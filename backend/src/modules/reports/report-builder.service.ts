import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService, type Scope } from '../dashboard/analytics.service';
import { roleLabel, toApiEnum } from '../../common/utils/enums';
import { pickLanguage, type Language } from '../../common/utils/localized';
import { thiBand } from '../../domain/environment';
import {
  ENUM_LABELS,
  LABELS,
  type ReportDocument,
  type ReportFilters,
  type ReportKind,
  type Tone,
} from './report.types';

type LabelKey = Exclude<keyof typeof LABELS, 'col'>;
type ColKey = keyof (typeof LABELS)['col'];

/**
 * Builds report documents from live data. One document feeds the JSON
 * preview, the PDF renderer and the CSV export, so all three always agree.
 */
@Injectable()
export class ReportBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async build(
    organizationId: string,
    type: ReportKind,
    filters: ReportFilters,
    lang: Language,
  ): Promise<ReportDocument> {
    const t = (key: LabelKey) => LABELS[key][lang];
    const c = (key: ColKey) => LABELS.col[key][lang];
    const num = (value: number, digits = 0) =>
      value.toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    const e = (value: string) => ENUM_LABELS[value]?.[lang] ?? value;
    const date = (value: Date | null | undefined) =>
      value
        ? value.toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Jakarta',
          })
        : '-';

    const scope: Scope = {
      organizationId,
      farmId: filters.farmId,
      livestockType: filters.livestockType,
      health: filters.health,
    };
    const farmWhere = this.analytics.farmFilter(scope);
    const since = new Date(Date.now() - filters.days * 86_400_000);
    const farm =
      filters.farmId && filters.farmId !== 'all'
        ? await this.prisma.farm.findFirst({ where: { id: filters.farmId, organizationId }, select: { name: true } })
        : null;

    const base = {
      type,
      title: t(`title.${type}` as LabelKey),
      scope: farm?.name ?? t('allFarms'),
      period: { from: since.toISOString(), to: new Date().toISOString() },
      generatedAt: new Date().toISOString(),
      language: lang,
    };
    const statusLabel = (status: string) => (LABELS[status as LabelKey] ? t(status as LabelKey) : status);

    switch (type) {
      // -----------------------------------------------------------------------
      case 'overview':
      case 'health': {
        const [distribution, avg, attention, vaccination, openAlerts, devices, tasks] = await Promise.all([
          this.analytics.healthDistribution(scope),
          this.prisma.livestock.aggregate({ where: this.analytics.livestockWhere(scope), _avg: { healthScore: true } }),
          this.prisma.livestock.findMany({
            where: { ...this.analytics.livestockWhere(scope), healthStatus: { in: ['ATTENTION', 'CRITICAL'] } },
            include: { barn: { select: { name: true } } },
            orderBy: { healthScore: 'asc' },
            take: 50,
          }),
          this.prisma.livestock.findMany({
            where: { ...this.analytics.livestockWhere(scope), vaccinationStatus: { in: ['DUE', 'OVERDUE'] } },
            include: { farm: { select: { name: true } } },
            orderBy: { vaccinationStatus: 'desc' },
            take: 100,
          }),
          this.prisma.alert.count({ where: { organizationId, status: { not: 'RESOLVED' }, ...farmWhere } }),
          this.prisma.device.groupBy({
            by: ['status'],
            where: { organizationId, ...farmWhere },
            _count: { _all: true },
          }),
          this.prisma.task.count({ where: { organizationId, done: false, ...farmWhere } }),
        ]);
        const count = (s: string) => distribution.find((d) => d.status === s)?.count ?? 0;
        const total = distribution.reduce((sum, d) => sum + d.count, 0);
        const overdue = vaccination.filter((v) => v.vaccinationStatus === 'OVERDUE').length;
        const tones: Record<string, Tone> = {
          healthy: 'good',
          attention: 'warning',
          critical: 'danger',
          inactive: 'neutral',
        };
        const deviceTotal = devices.reduce((s, d) => s + d._count._all, 0);
        const online = devices.find((d) => d.status === 'ONLINE')?._count._all ?? 0;

        const kpis = [
          { label: t('totalLivestock'), value: num(total) },
          { label: t('healthy'), value: num(count('healthy')), tone: 'good' as Tone },
          { label: t('attention'), value: num(count('attention')), tone: 'warning' as Tone },
          { label: t('critical'), value: num(count('critical')), tone: 'danger' as Tone },
          { label: t('avgHealth'), value: num(avg._avg.healthScore ?? 0) },
          type === 'overview'
            ? { label: t('activeDevices'), value: `${online}/${deviceTotal}` }
            : { label: t('vaccinationOverdue'), value: num(overdue), tone: (overdue ? 'danger' : 'good') as Tone },
        ];
        const healthyPct = total ? Math.round((count('healthy') / total) * 100) : 0;
        const findings =
          lang === 'id'
            ? [
                `${healthyPct}% ternak dalam kondisi sehat; ${count('attention') + count('critical')} ekor perlu ditinjau.`,
                `${openAlerts} alert masih terbuka dan ${tasks} tugas belum selesai.`,
                overdue
                  ? `${overdue} ternak terlambat vaksinasi — jadwalkan sesi lanjutan.`
                  : 'Tidak ada vaksinasi yang terlambat.',
              ]
            : [
                `${healthyPct}% of the herd is healthy; ${count('attention') + count('critical')} animals need review.`,
                `${openAlerts} alerts are still open and ${tasks} tasks are outstanding.`,
                overdue
                  ? `${overdue} animals are overdue for vaccination — schedule a follow-up session.`
                  : 'No vaccinations are overdue.',
              ];
        return {
          ...base,
          kpis,
          chart: {
            title: t('healthDistribution'),
            bars: distribution.map((d) => ({ label: statusLabel(d.status), value: d.count, tone: tones[d.status] })),
          },
          findings,
          tables: [
            {
              title: t('needsAttentionTable'),
              columns: [c('code'), c('name'), c('barn'), c('score'), c('status'), c('temperature'), c('heartRate')],
              rows: attention.map((a) => [
                a.code,
                a.name,
                a.barn.name,
                a.healthScore,
                statusLabel(toApiEnum(a.healthStatus)),
                a.temperature?.toFixed(1) ?? '-',
                a.heartRate ?? '-',
              ]),
            },
            ...(type === 'health'
              ? [
                  {
                    title: t('vaccinationTable'),
                    columns: [c('code'), c('name'), c('farm'), c('vaccination')],
                    rows: vaccination.map((v) => [v.code, v.name, v.farm.name, e(toApiEnum(v.vaccinationStatus))]),
                  },
                ]
              : []),
          ],
        };
      }

      // -----------------------------------------------------------------------
      case 'alerts': {
        const where = { organizationId, detectedAt: { gte: since }, ...farmWhere };
        const [alerts, byCategory, open, criticalOpen] = await Promise.all([
          this.prisma.alert.findMany({
            where,
            include: {
              livestock: { select: { name: true, code: true } },
              assignedTo: { include: { user: { select: { name: true } } } },
            },
            orderBy: { detectedAt: 'desc' },
            take: 300,
          }),
          this.analytics.alertsByCategory(scope, filters.days <= 7 ? '7d' : filters.days <= 30 ? '30d' : '90d'),
          this.prisma.alert.count({ where: { organizationId, status: { not: 'RESOLVED' }, ...farmWhere } }),
          this.prisma.alert.count({
            where: { organizationId, status: { not: 'RESOLVED' }, severity: 'CRITICAL', ...farmWhere },
          }),
        ]);
        const resolved = alerts.filter((a) => a.resolvedAt);
        const mttr = resolved.length
          ? resolved.reduce((s, a) => s + (a.resolvedAt!.getTime() - a.detectedAt.getTime()), 0) /
            resolved.length /
            3_600_000
          : 0;
        const top = byCategory[0];
        return {
          ...base,
          kpis: [
            { label: t('alertsInPeriod'), value: num(alerts.length) },
            { label: t('openAlerts'), value: num(open), tone: open ? 'warning' : 'good' },
            { label: t('criticalAlerts'), value: num(criticalOpen), tone: criticalOpen ? 'danger' : 'good' },
            { label: t('resolved'), value: num(resolved.length), tone: 'good' },
            { label: t('mttr'), value: `${num(mttr, 1)} ${lang === 'id' ? 'jam' : 'h'}` },
          ],
          chart: {
            title: t('alertsByCategory'),
            bars: byCategory.map((b) => ({ label: e(b.category), value: b.count })),
          },
          findings:
            lang === 'id'
              ? [
                  `${alerts.length} alert tercatat dalam ${filters.days} hari terakhir; ${resolved.length} sudah diselesaikan.`,
                  top
                    ? `Kategori terbanyak: ${e(top.category)} (${top.count} alert).`
                    : 'Belum ada alert dalam periode ini.',
                  `Rata-rata waktu penyelesaian ${num(mttr, 1)} jam.`,
                ]
              : [
                  `${alerts.length} alerts were recorded in the last ${filters.days} days; ${resolved.length} have been resolved.`,
                  top
                    ? `Most frequent category: ${e(top.category)} (${top.count} alerts).`
                    : 'No alerts in this period.',
                  `Mean time to resolve: ${num(mttr, 1)} hours.`,
                ],
          tables: [
            {
              title: t('alertLog'),
              columns: [
                c('id'),
                c('alert'),
                c('severity'),
                c('category'),
                c('livestock'),
                c('status'),
                c('detected'),
                c('assignee'),
              ],
              rows: alerts.map((a) => [
                a.id,
                pickLanguage(a.title, lang),
                e(toApiEnum(a.severity)),
                e(toApiEnum(a.category)),
                a.livestock ? `${a.livestock.code} ${a.livestock.name}` : '-',
                e(toApiEnum(a.status)),
                date(a.detectedAt),
                a.assignedTo?.user.name ?? '-',
              ]),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      case 'devices': {
        const devices = await this.prisma.device.findMany({
          where: { organizationId, ...farmWhere },
          include: { assignedLivestock: { select: { name: true } } },
          orderBy: [{ status: 'asc' }, { serial: 'asc' }],
        });
        const by = (status: string) => devices.filter((d) => d.status === status).length;
        const avgBattery = devices.length ? devices.reduce((s, d) => s + d.battery, 0) / devices.length : 0;
        const avgUptime = devices.length ? devices.reduce((s, d) => s + d.uptime, 0) / devices.length : 0;
        return {
          ...base,
          kpis: [
            { label: t('totalDevices'), value: num(devices.length) },
            { label: t('online'), value: num(by('ONLINE')), tone: 'good' },
            { label: t('offline'), value: num(by('OFFLINE')), tone: by('OFFLINE') ? 'danger' : 'good' },
            { label: t('lowBattery'), value: num(by('LOW_BATTERY')), tone: by('LOW_BATTERY') ? 'warning' : 'good' },
            { label: t('avgBattery'), value: `${num(avgBattery)}%` },
            { label: t('avgUptime'), value: `${num(avgUptime, 1)}%` },
          ],
          chart: {
            title: t('deviceStatus'),
            bars: [
              { label: t('online'), value: by('ONLINE'), tone: 'good' },
              { label: t('offline'), value: by('OFFLINE'), tone: 'danger' },
              { label: t('lowBattery'), value: by('LOW_BATTERY'), tone: 'warning' },
              { label: t('maintenance'), value: by('MAINTENANCE'), tone: 'neutral' },
            ],
          },
          findings:
            lang === 'id'
              ? [
                  `${by('ONLINE')} dari ${devices.length} perangkat online dengan uptime rata-rata ${num(avgUptime, 1)}%.`,
                  `${by('OFFLINE') + by('LOW_BATTERY')} perangkat memerlukan tindakan (offline atau baterai rendah).`,
                ]
              : [
                  `${by('ONLINE')} of ${devices.length} devices are online, with ${num(avgUptime, 1)}% average uptime.`,
                  `${by('OFFLINE') + by('LOW_BATTERY')} devices need attention (offline or low battery).`,
                ],
          tables: [
            {
              title: t('deviceTable'),
              columns: [
                c('id'),
                c('name'),
                c('type'),
                c('status'),
                c('battery'),
                c('signal'),
                c('firmware'),
                c('livestock'),
                c('lastSync'),
              ],
              rows: devices.map((d) => [
                d.serial,
                d.name,
                e(toApiEnum(d.type)),
                e(toApiEnum(d.status)),
                `${d.battery}%`,
                `${d.signal}%`,
                d.firmware,
                d.assignedLivestock?.name ?? '-',
                date(d.lastSyncAt),
              ]),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      case 'farm': {
        const farms = await this.prisma.farm.findMany({
          where: { organizationId, ...(filters.farmId && filters.farmId !== 'all' ? { id: filters.farmId } : {}) },
          include: { barns: { select: { capacity: true } } },
        });
        const ids = farms.map((f) => f.id);
        const [livestock, covered, alerts, staff] = await Promise.all([
          this.prisma.livestock.groupBy({
            by: ['farmId'],
            where: { farmId: { in: ids }, archived: false },
            _count: { _all: true },
            _avg: { healthScore: true },
          }),
          this.prisma.livestock.groupBy({
            by: ['farmId'],
            where: { farmId: { in: ids }, archived: false, deviceId: { not: null } },
            _count: { _all: true },
          }),
          this.prisma.alert.groupBy({
            by: ['farmId'],
            where: { farmId: { in: ids }, status: { not: 'RESOLVED' } },
            _count: { _all: true },
          }),
          this.prisma.membership.groupBy({
            by: ['farmId'],
            where: { farmId: { in: ids }, status: 'ACTIVE' },
            _count: { _all: true },
          }),
        ]);
        const get = <T extends { farmId: string | null }>(rows: T[], id: string) => rows.find((r) => r.farmId === id);
        const rows = farms.map((f) => {
          const capacity = f.barns.reduce((s, b) => s + b.capacity, 0);
          const animals = get(livestock, f.id)?._count._all ?? 0;
          const withDevice = get(covered, f.id)?._count._all ?? 0;
          return {
            name: f.name,
            animals,
            capacity,
            occupancy: capacity ? Math.round((animals / capacity) * 100) : 0,
            health: Math.round(get(livestock, f.id)?._avg.healthScore ?? 0),
            coverage: animals ? Math.round((withDevice / animals) * 100) : 0,
            alerts: get(alerts, f.id)?._count._all ?? 0,
            staff: get(staff, f.id)?._count._all ?? 0,
          };
        });
        const totalAnimals = rows.reduce((s, r) => s + r.animals, 0);
        const totalCapacity = rows.reduce((s, r) => s + r.capacity, 0);
        return {
          ...base,
          kpis: [
            { label: t('farms'), value: num(rows.length) },
            { label: t('totalLivestock'), value: num(totalAnimals) },
            { label: t('capacity'), value: num(totalCapacity) },
            {
              label: t('occupancy'),
              value: `${totalCapacity ? Math.round((totalAnimals / totalCapacity) * 100) : 0}%`,
            },
          ],
          chart: {
            title: t('occupancyByFarm'),
            unit: '%',
            max: 100,
            bars: rows.map((r) => ({ label: r.name, value: r.occupancy, tone: r.occupancy > 90 ? 'warning' : 'good' })),
          },
          findings: rows
            .filter((r) => r.occupancy > 90 || r.coverage < 85)
            .map((r) =>
              lang === 'id'
                ? `${r.name}: okupansi ${r.occupancy}%, cakupan perangkat ${r.coverage}%.`
                : `${r.name}: ${r.occupancy}% occupancy, ${r.coverage}% device coverage.`,
            ),
          tables: [
            {
              title: t('farmTable'),
              columns: [
                c('farm'),
                c('livestock'),
                t('capacity'),
                t('occupancy'),
                c('score'),
                t('coverage'),
                c('alerts'),
                c('staff'),
              ],
              rows: rows.map((r) => [
                r.name,
                r.animals,
                r.capacity,
                `${r.occupancy}%`,
                r.health,
                `${r.coverage}%`,
                r.alerts,
                r.staff,
              ]),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      case 'environment': {
        const range = filters.days <= 7 ? '7d' : filters.days <= 30 ? '30d' : '90d';
        const [trend, latest] = await Promise.all([
          this.analytics.environmentTrend(scope, range),
          this.prisma.environmentReading.findMany({
            where: { farm: { organizationId }, ...farmWhere },
            orderBy: { recordedAt: 'desc' },
            distinct: ['farmId'],
            include: { farm: { select: { name: true } } },
          }),
        ]);
        const withData = trend.filter((d) => d.thi != null);
        const avg = (key: 'temperature' | 'humidity' | 'thi') =>
          withData.length ? withData.reduce((s, d) => s + (d[key] ?? 0), 0) / withData.length : 0;
        const peak = withData.reduce((m, d) => Math.max(m, d.maxThi ?? 0), 0);
        const stressDays = withData.filter((d) => (d.maxThi ?? 0) >= 72).length;
        return {
          ...base,
          kpis: [
            { label: t('avgTemperature'), value: `${num(avg('temperature'), 1)}°C` },
            { label: t('avgHumidity'), value: `${num(avg('humidity'))}%` },
            { label: t('avgThi'), value: num(avg('thi'), 1), tone: avg('thi') >= 72 ? 'warning' : 'good' },
            { label: t('maxThi'), value: num(peak, 1), tone: peak >= 80 ? 'danger' : peak >= 72 ? 'warning' : 'good' },
            { label: t('heatStressDays'), value: num(stressDays), tone: stressDays ? 'warning' : 'good' },
          ],
          chart: {
            title: t('thiByFarm'),
            max: 100,
            bars: latest.map((r) => ({
              label: r.farm.name,
              value: r.thi,
              tone: thiBand(r.thi) === 'normal' ? 'good' : thiBand(r.thi) === 'mild' ? 'warning' : 'danger',
            })),
          },
          findings:
            lang === 'id'
              ? [
                  `${stressDays} dari ${withData.length} hari mencapai ambang heat stress (THI ≥ 72).`,
                  `THI tertinggi tercatat ${num(peak, 1)}.`,
                ]
              : [
                  `${stressDays} of ${withData.length} days reached the heat stress threshold (THI ≥ 72).`,
                  `The highest THI recorded was ${num(peak, 1)}.`,
                ],
          tables: [
            {
              title: t('dailyEnvironment'),
              columns: [c('date'), c('temperature'), c('humidity'), c('thi'), t('maxThi')],
              rows: withData.map((d) => [
                d.date,
                d.temperature ?? '-',
                d.humidity ?? '-',
                d.thi ?? '-',
                d.maxThi ?? '-',
              ]),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      case 'staff': {
        const members = await this.prisma.membership.findMany({
          where: {
            organizationId,
            status: 'ACTIVE',
            ...(filters.farmId && filters.farmId !== 'all' ? { farmId: filters.farmId } : {}),
          },
          include: { user: { select: { name: true } } },
        });
        const ids = members.map((m) => m.id);
        const [tasksOpen, tasksDone, alertsAssigned, alertsResolved] = await Promise.all([
          this.prisma.task.groupBy({
            by: ['assigneeId'],
            where: { assigneeId: { in: ids }, done: false },
            _count: { _all: true },
          }),
          this.prisma.task.groupBy({
            by: ['assigneeId'],
            where: { assigneeId: { in: ids }, done: true },
            _count: { _all: true },
          }),
          this.prisma.alert.groupBy({
            by: ['assignedToId'],
            where: { assignedToId: { in: ids } },
            _count: { _all: true },
          }),
          this.prisma.alert.groupBy({
            by: ['assignedToId'],
            where: { assignedToId: { in: ids }, status: 'RESOLVED' },
            _count: { _all: true },
          }),
        ]);
        const byKey = <K extends string>(rows: ({ _count: { _all: number } } & Record<K, string | null>)[], key: K) =>
          new Map(rows.map((row) => [row[key], row._count._all]));
        const openBy = byKey(tasksOpen, 'assigneeId');
        const doneBy = byKey(tasksDone, 'assigneeId');
        const assignedBy = byKey(alertsAssigned, 'assignedToId');
        const resolvedBy = byKey(alertsResolved, 'assignedToId');
        const rows = members.map((m) => {
          const assigned = assignedBy.get(m.id) ?? 0;
          const resolvedCount = resolvedBy.get(m.id) ?? 0;
          return {
            name: m.user.name,
            role: roleLabel(m.role),
            open: openBy.get(m.id) ?? 0,
            done: doneBy.get(m.id) ?? 0,
            alerts: assigned,
            rate: assigned ? Math.round((resolvedCount / assigned) * 100) : 0,
          };
        });
        const withAlerts = rows.filter((r) => r.alerts > 0);
        const avgRate = withAlerts.length ? withAlerts.reduce((s, r) => s + r.rate, 0) / withAlerts.length : 0;
        return {
          ...base,
          kpis: [
            { label: t('members'), value: num(rows.length) },
            { label: t('tasksOpen'), value: num(rows.reduce((s, r) => s + r.open, 0)) },
            { label: t('tasksDone'), value: num(rows.reduce((s, r) => s + r.done, 0)), tone: 'good' },
            { label: t('avgResolution'), value: `${num(avgRate)}%` },
          ],
          chart: {
            title: t('resolutionByMember'),
            unit: '%',
            max: 100,
            bars: withAlerts.map((r) => ({
              label: r.name,
              value: r.rate,
              tone: r.rate >= 80 ? 'good' : r.rate >= 50 ? 'warning' : 'danger',
            })),
          },
          findings:
            lang === 'id'
              ? [
                  `Tingkat penyelesaian alert rata-rata ${num(avgRate)}% dari ${withAlerts.length} anggota yang menangani alert.`,
                ]
              : [
                  `Average alert resolution rate is ${num(avgRate)}% across ${withAlerts.length} members handling alerts.`,
                ],
          tables: [
            {
              title: t('staffTable'),
              columns: [c('name'), c('role'), t('openTasks'), t('tasksDone'), c('alerts'), c('resolution')],
              rows: rows.map((r) => [r.name, r.role, r.open, r.done, r.alerts, `${r.rate}%`]),
            },
          ],
        };
      }
    }
  }
}
