import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthContext } from '../../common/auth-context';
import { PrismaService } from '../../prisma/prisma.service';
import { serializeAlert, serializeInsight, serializeLivestock, serializeTask } from '../../common/serializers';
import { roleLabel, toApiEnum } from '../../common/utils/enums';
import { asLocalized } from '../../common/utils/localized';
import { AnalyticsService, RANGE_DAYS, type Range, type Scope } from './analytics.service';

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, WARNING: 2, INFO: 3 } as const;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  /** Everything the Dashboard Overview page renders, in one round trip. */
  async overview(ctx: AuthContext, farmId?: string, range: Range = '7d') {
    const scope: Scope = { organizationId: ctx.organizationId, farmId };
    const farm = this.analytics.farmFilter(scope);
    const livestockWhere = this.analytics.livestockWhere(scope);
    const days = RANGE_DAYS[range] ?? 7;
    const periodStart = new Date(Date.now() - days * 86_400_000);
    const previousStart = new Date(Date.now() - 2 * days * 86_400_000);

    const [
      distribution,
      avgScore,
      devices,
      openAlerts,
      alertsThisPeriod,
      alertsPrevPeriod,
      attention,
      deviceIssues,
      insights,
      tasks,
      recentEvents,
      user,
      healthTrend,
      alertFrequency,
      activityTrend,
      deviceUptime,
    ] = await Promise.all([
      this.analytics.healthDistribution(scope),
      this.prisma.livestock.aggregate({ where: livestockWhere, _avg: { healthScore: true } }),
      this.prisma.device.groupBy({
        by: ['status'],
        where: { organizationId: ctx.organizationId, ...farm },
        _count: { _all: true },
      }),
      this.prisma.alert.findMany({
        where: { organizationId: ctx.organizationId, status: { not: 'RESOLVED' }, ...farm },
        include: { assignedTo: { include: { user: true } } },
        orderBy: { detectedAt: 'desc' },
        take: 50,
      }),
      this.prisma.alert.count({
        where: { organizationId: ctx.organizationId, detectedAt: { gte: periodStart }, ...farm },
      }),
      this.prisma.alert.count({
        where: { organizationId: ctx.organizationId, detectedAt: { gte: previousStart, lt: periodStart }, ...farm },
      }),
      this.prisma.livestock.findMany({
        where: { ...livestockWhere, healthStatus: { in: ['ATTENTION', 'CRITICAL'] } },
        include: { device: true },
        orderBy: { healthScore: 'asc' },
        take: 6,
      }),
      this.prisma.device.findMany({
        where: { organizationId: ctx.organizationId, status: { in: ['OFFLINE', 'LOW_BATTERY'] }, ...farm },
        include: { assignedLivestock: { select: { id: true, name: true, code: true } } },
        orderBy: [{ status: 'asc' }, { battery: 'asc' }],
        take: 6,
      }),
      this.prisma.aIInsight.findMany({
        where: { organizationId: ctx.organizationId, dismissed: false, reviewed: false },
        orderBy: [{ priority: 'desc' }, { generatedAt: 'desc' }],
        take: 3,
      }),
      this.prisma.task.findMany({
        where: { organizationId: ctx.organizationId, done: false, ...farm },
        orderBy: { dueDate: 'asc' },
        take: 6,
      }),
      this.prisma.alertEvent.findMany({
        where: { alert: { organizationId: ctx.organizationId, ...farm } },
        include: { alert: { select: { id: true, title: true, severity: true, livestockId: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId }, select: { name: true } }),
      this.analytics.healthTrend(scope, range),
      this.analytics.alertFrequency(scope, range),
      this.analytics.activityTrend(scope, range),
      this.analytics.deviceUptime(scope),
    ]);

    const count = (status: string) => distribution.find((d) => d.status === status)?.count ?? 0;
    const total = distribution.reduce((sum, d) => sum + d.count, 0);
    const deviceCount = devices.reduce((sum, d) => sum + d._count._all, 0);
    const online = devices.find((d) => d.status === 'ONLINE')?._count._all ?? 0;
    const sortedAlerts = [...openAlerts].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

    return {
      greeting: { name: user.name, hour: new Date().getHours() },
      range,
      kpis: {
        totalLivestock: total,
        healthyLivestock: count('healthy'),
        needsAttention: count('attention'),
        critical: count('critical'),
        inactive: count('inactive'),
        criticalAlerts: openAlerts.filter((a) => a.severity === 'CRITICAL').length,
        openAlerts: openAlerts.length,
        activeDevices: online,
        totalDevices: deviceCount,
        avgHealthScore: Math.round(avgScore._avg.healthScore ?? 0),
        alertsThisPeriod,
        alertsChangePct: alertsPrevPeriod
          ? Math.round(((alertsThisPeriod - alertsPrevPeriod) / alertsPrevPeriod) * 100)
          : null,
      },
      charts: {
        healthTrend,
        healthDistribution: distribution,
        alertFrequency,
        activityTrend,
        deviceUptime,
      },
      panels: {
        alerts: sortedAlerts.slice(0, 5).map(serializeAlert),
        attention: attention.map(serializeLivestock),
        deviceIssues: deviceIssues.map((d) => ({
          id: d.id,
          name: d.name,
          type: toApiEnum(d.type),
          status: toApiEnum(d.status),
          battery: d.battery,
          signal: d.signal,
          lastSync: d.lastSyncAt?.toISOString() ?? null,
          livestock: d.assignedLivestock,
        })),
        insights: insights.map(serializeInsight),
        tasks: tasks.map(serializeTask),
        activity: recentEvents.map((event) => ({
          id: event.id,
          type: toApiEnum(event.type),
          actor: event.actorName,
          alertId: event.alert.id,
          alertTitle: asLocalized(event.alert.title),
          severity: toApiEnum(event.alert.severity),
          livestockId: event.alert.livestockId,
          timestamp: event.createdAt.toISOString(),
        })),
      },
    };
  }

  /** Global search (Ctrl + K): livestock, devices, alerts, farms and members. */
  async search(ctx: AuthContext, q: string) {
    const term = q.trim();
    if (term.length < 2) return { livestock: [], devices: [], alerts: [], farms: [], members: [] };
    const contains = { contains: term, mode: 'insensitive' as const };
    const [livestock, devices, alerts, farms, members] = await Promise.all([
      this.prisma.livestock.findMany({
        where: {
          organizationId: ctx.organizationId,
          OR: [{ name: contains }, { code: contains }, { earTagId: contains }],
        },
        select: { id: true, code: true, name: true, healthStatus: true, archived: true },
        take: 6,
      }),
      this.prisma.device.findMany({
        where: {
          organizationId: ctx.organizationId,
          OR: [{ name: contains }, { serial: contains }, { devEui: contains }],
        },
        select: { id: true, serial: true, name: true, type: true, status: true },
        take: 6,
      }),
      this.prisma.alert.findMany({
        where: {
          organizationId: ctx.organizationId,
          OR: [
            { id: contains },
            { title: { path: ['en'], string_contains: term } },
            { title: { path: ['id'], string_contains: term } },
          ],
        },
        select: { id: true, title: true, severity: true, status: true },
        orderBy: { detectedAt: 'desc' },
        take: 6,
      }),
      this.prisma.farm.findMany({
        where: { organizationId: ctx.organizationId, OR: [{ name: contains }, { location: contains }] },
        select: { id: true, name: true, location: true },
        take: 4,
      }),
      this.prisma.membership.findMany({
        where: { organizationId: ctx.organizationId, user: { OR: [{ name: contains }, { email: contains }] } },
        select: { id: true, role: true, user: { select: { name: true, email: true } } },
        take: 4,
      }),
    ]);
    return {
      livestock: livestock.map((l) => ({ ...l, healthStatus: toApiEnum(l.healthStatus) })),
      devices: devices.map((d) => ({ ...d, type: toApiEnum(d.type), status: toApiEnum(d.status) })),
      alerts: alerts.map((a) => ({
        ...a,
        title: asLocalized(a.title),
        severity: toApiEnum(a.severity),
        status: toApiEnum(a.status),
      })),
      farms,
      members: members.map((m) => ({ id: m.id, name: m.user.name, email: m.user.email, role: roleLabel(m.role) })),
    };
  }

  /** Farm Map: animals, barns, gateways and geofences with coordinates. */
  async map(ctx: AuthContext, farmId?: string) {
    const scope: Scope = { organizationId: ctx.organizationId, farmId };
    const farm = this.analytics.farmFilter(scope);
    const [farms, livestock, gateways, geofences] = await Promise.all([
      this.prisma.farm.findMany({
        where: { organizationId: ctx.organizationId, ...(farmId && farmId !== 'all' ? { id: farmId } : {}) },
        select: { id: true, name: true, location: true, latitude: true, longitude: true },
      }),
      this.prisma.livestock.findMany({ where: this.analytics.livestockWhere(scope), include: { device: true } }),
      this.prisma.device.findMany({
        where: { organizationId: ctx.organizationId, type: 'GATEWAY', ...farm },
        select: { id: true, name: true, status: true, latitude: true, longitude: true, farmId: true, signal: true },
      }),
      this.prisma.geofence.findMany({ where: { farm: { organizationId: ctx.organizationId }, ...farm, active: true } }),
    ]);
    return {
      farms: farms.map((f) => ({
        ...f,
        coordinates: f.latitude != null && f.longitude != null ? { lat: f.latitude, lng: f.longitude } : null,
      })),
      livestock: livestock.filter((l) => l.latitude != null && l.longitude != null).map(serializeLivestock),
      gateways: gateways.map((g) => ({ ...g, status: toApiEnum(g.status) })),
      geofences: geofences.map((g) => ({
        id: g.id,
        farmId: g.farmId,
        name: g.name,
        type: toApiEnum(g.type),
        polygon: g.polygon,
      })),
    };
  }
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard/overview')
  @ApiOperation({
    summary: 'KPIs, charts and panels for the Dashboard Overview (honours the header farm and range filters)',
  })
  @ApiQuery({ name: 'farmId', required: false })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  overview(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string, @Query('range') range?: Range) {
    return this.dashboard.overview(user, farmId, range && range in RANGE_DAYS ? range : '7d');
  }

  @Get('search')
  @ApiOperation({ summary: 'Global search (Ctrl + K)' })
  @ApiQuery({ name: 'q', required: true })
  search(@CurrentUser() user: AuthContext, @Query('q') q = '') {
    return this.dashboard.search(user, q);
  }

  @Get('map')
  @ApiOperation({ summary: 'Farm Map layers: livestock pins, gateways, geofences, farms' })
  @ApiQuery({ name: 'farmId', required: false })
  map(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.dashboard.map(user, farmId);
  }
}

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AnalyticsService],
  exports: [AnalyticsService, DashboardService],
})
export class DashboardModule {}
