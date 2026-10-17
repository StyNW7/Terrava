import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { assessHealth } from '../../domain/health-scoring';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import type { HealthStatus, Prisma } from '../../generated/prisma/client';

export type Range = '7d' | '30d' | '90d';

export const RANGE_DAYS: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 };

export interface Scope {
  organizationId: string;
  farmId?: string;
  livestockType?: string;
  health?: string;
}

/**
 * Time-series and distribution queries shared by the dashboard overview and
 * the Reports & Analytics page. Every series is computed from stored data.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  livestockWhere(scope: Scope): Prisma.LivestockWhereInput {
    return {
      organizationId: scope.organizationId,
      archived: false,
      ...(scope.farmId && scope.farmId !== 'all' ? { farmId: scope.farmId } : {}),
      ...(scope.livestockType && scope.livestockType !== 'all' ? { type: scope.livestockType } : {}),
      ...(scope.health && scope.health !== 'all' ? { healthStatus: fromApiEnum<HealthStatus>(scope.health) } : {}),
    };
  }

  farmFilter(scope: Scope) {
    return scope.farmId && scope.farmId !== 'all' ? { farmId: scope.farmId } : {};
  }

  /** Days in the window as YYYY-MM-DD, oldest first, so charts have no gaps. */
  days(range: Range): string[] {
    const count = RANGE_DAYS[range];
    const today = new Date();
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(today.getTime() - (count - 1 - i) * 86_400_000);
      return d.toISOString().slice(0, 10);
    });
  }

  /** Daily herd health: per-animal daily vital averages scored with the health model, then averaged. */
  async healthTrend(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const animalIds = (
      await this.prisma.livestock.findMany({ where: this.livestockWhere(scope), select: { id: true } })
    ).map((a) => a.id);
    if (!animalIds.length)
      return this.days(range).map((date) => ({ date, healthScore: null, healthy: 0, attention: 0, critical: 0 }));

    const rows = await this.prisma.$queryRaw<
      {
        day: Date;
        livestockId: string;
        temperature: number | null;
        heartRate: number | null;
        oxygen: number | null;
        activity: number | null;
      }[]
    >`
      SELECT date_trunc('day', "recordedAt") AS day, "livestockId",
             AVG("temperature")::float AS temperature, AVG("heartRate")::float AS "heartRate",
             AVG("oxygen")::float AS oxygen, AVG("activity")::float AS activity
      FROM "telemetry_readings"
      WHERE "livestockId" = ANY(${animalIds}) AND "recordedAt" >= ${since}
      GROUP BY day, "livestockId"`;

    const byDay = new Map<string, number[]>();
    for (const row of rows) {
      const key = row.day.toISOString().slice(0, 10);
      const score = assessHealth(row).score;
      byDay.set(key, [...(byDay.get(key) ?? []), score]);
    }
    return this.days(range).map((date) => {
      const scores = byDay.get(date) ?? [];
      return {
        date,
        healthScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        healthy: scores.filter((s) => s >= 80).length,
        attention: scores.filter((s) => s >= 58 && s < 80).length,
        critical: scores.filter((s) => s < 58).length,
      };
    });
  }

  async healthDistribution(scope: Scope) {
    const rows = await this.prisma.livestock.groupBy({
      by: ['healthStatus'],
      where: this.livestockWhere(scope),
      _count: { _all: true },
    });
    const counts = Object.fromEntries(rows.map((r) => [toApiEnum(r.healthStatus), r._count._all]));
    return ['healthy', 'attention', 'critical', 'inactive'].map((status) => ({ status, count: counts[status] ?? 0 }));
  }

  async alertFrequency(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const farmId = scope.farmId && scope.farmId !== 'all' ? scope.farmId : null;
    const rows = await this.prisma.$queryRaw<{ day: Date; severity: string; count: bigint }[]>`
      SELECT date_trunc('day', "detectedAt") AS day, "severity"::text AS severity, COUNT(*) AS count
      FROM "alerts"
      WHERE "organizationId" = ${scope.organizationId} AND "detectedAt" >= ${since}
        AND (${farmId}::text IS NULL OR "farmId" = ${farmId})
      GROUP BY day, "severity"`;
    const map = new Map<string, Record<string, number>>();
    for (const row of rows) {
      const key = row.day.toISOString().slice(0, 10);
      map.set(key, { ...(map.get(key) ?? {}), [row.severity.toLowerCase()]: Number(row.count) });
    }
    return this.days(range).map((date) => {
      const day = map.get(date) ?? {};
      return {
        date,
        info: day.info ?? 0,
        warning: day.warning ?? 0,
        high: day.high ?? 0,
        critical: day.critical ?? 0,
        total: Object.values(day).reduce((a, b) => a + b, 0),
      };
    });
  }

  async alertsByCategory(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const rows = await this.prisma.alert.groupBy({
      by: ['category'],
      where: { organizationId: scope.organizationId, detectedAt: { gte: since }, ...this.farmFilter(scope) },
      _count: { _all: true },
    });
    return rows
      .map((r) => ({ category: toApiEnum(r.category), count: r._count._all }))
      .sort((a, b) => b.count - a.count);
  }

  async activityTrend(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const animalIds = (
      await this.prisma.livestock.findMany({ where: this.livestockWhere(scope), select: { id: true } })
    ).map((a) => a.id);
    if (!animalIds.length)
      return this.days(range).map((date) => ({ date, activity: null, temperature: null, heartRate: null }));
    const rows = await this.prisma.$queryRaw<
      { day: Date; activity: number | null; temperature: number | null; heartRate: number | null }[]
    >`
      SELECT date_trunc('day', "recordedAt") AS day, AVG("activity")::float AS activity,
             AVG("temperature")::float AS temperature, AVG("heartRate")::float AS "heartRate"
      FROM "telemetry_readings"
      WHERE "livestockId" = ANY(${animalIds}) AND "recordedAt" >= ${since}
      GROUP BY day`;
    const map = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), r]));
    return this.days(range).map((date) => {
      const row = map.get(date);
      return {
        date,
        activity: row?.activity != null ? Math.round(row.activity) : null,
        temperature: row?.temperature != null ? Number(row.temperature.toFixed(2)) : null,
        heartRate: row?.heartRate != null ? Math.round(row.heartRate) : null,
      };
    });
  }

  async environmentTrend(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const farmId = scope.farmId && scope.farmId !== 'all' ? scope.farmId : null;
    const rows = await this.prisma.$queryRaw<
      { day: Date; temperature: number; humidity: number; thi: number; maxThi: number }[]
    >`
      SELECT date_trunc('day', e."recordedAt") AS day, AVG(e."temperature")::float AS temperature,
             AVG(e."humidity")::float AS humidity, AVG(e."thi")::float AS thi, MAX(e."thi")::float AS "maxThi"
      FROM "environment_readings" e JOIN "farms" f ON f."id" = e."farmId"
      WHERE f."organizationId" = ${scope.organizationId} AND e."recordedAt" >= ${since}
        AND (${farmId}::text IS NULL OR e."farmId" = ${farmId})
      GROUP BY day`;
    const map = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), r]));
    return this.days(range).map((date) => {
      const r = map.get(date);
      return r
        ? {
            date,
            temperature: Number(r.temperature.toFixed(1)),
            humidity: Math.round(r.humidity),
            thi: Number(r.thi.toFixed(1)),
            maxThi: Number(r.maxThi.toFixed(1)),
          }
        : { date, temperature: null, humidity: null, thi: null, maxThi: null };
    });
  }

  async deviceUptime(scope: Scope) {
    const rows = await this.prisma.device.groupBy({
      by: ['type'],
      where: { organizationId: scope.organizationId, ...this.farmFilter(scope) },
      _avg: { uptime: true, battery: true, signal: true },
      _count: { _all: true },
    });
    return rows.map((r) => ({
      type: toApiEnum(r.type),
      devices: r._count._all,
      uptime: Math.round((r._avg.uptime ?? 0) * 10) / 10,
      battery: Math.round(r._avg.battery ?? 0),
      signal: Math.round(r._avg.signal ?? 0),
    }));
  }

  /** Mean time from detection to acknowledgement / resolution, per day. */
  async responseTimes(scope: Scope, range: Range) {
    const since = new Date(Date.now() - RANGE_DAYS[range] * 86_400_000);
    const farmId = scope.farmId && scope.farmId !== 'all' ? scope.farmId : null;
    const rows = await this.prisma.$queryRaw<{ day: Date; ackMinutes: number | null; resolveHours: number | null }[]>`
      SELECT date_trunc('day', "detectedAt") AS day,
             AVG(EXTRACT(EPOCH FROM ("acknowledgedAt" - "detectedAt")) / 60)::float AS "ackMinutes",
             AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "detectedAt")) / 3600)::float AS "resolveHours"
      FROM "alerts"
      WHERE "organizationId" = ${scope.organizationId} AND "detectedAt" >= ${since}
        AND (${farmId}::text IS NULL OR "farmId" = ${farmId})
      GROUP BY day`;
    const map = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), r]));
    return this.days(range).map((date) => {
      const r = map.get(date);
      return {
        date,
        acknowledgeMinutes: r?.ackMinutes != null ? Math.round(r.ackMinutes) : null,
        resolveHours: r?.resolveHours != null ? Number(r.resolveHours.toFixed(1)) : null,
      };
    });
  }

  async farmComparison(organizationId: string) {
    const farms = await this.prisma.farm.findMany({ where: { organizationId }, select: { id: true, name: true } });
    const [livestock, alerts] = await Promise.all([
      this.prisma.livestock.groupBy({
        by: ['farmId'],
        where: { organizationId, archived: false },
        _avg: { healthScore: true },
        _count: { _all: true },
      }),
      this.prisma.alert.groupBy({
        by: ['farmId'],
        where: { organizationId, status: { not: 'RESOLVED' } },
        _count: { _all: true },
      }),
    ]);
    const livestockBy = new Map(livestock.map((l) => [l.farmId, l]));
    const alertsBy = new Map(alerts.map((a) => [a.farmId, a._count._all]));
    return farms.map((farm) => ({
      farmId: farm.id,
      name: farm.name,
      livestock: livestockBy.get(farm.id)?._count._all ?? 0,
      healthScore: Math.round(livestockBy.get(farm.id)?._avg.healthScore ?? 0),
      openAlerts: alertsBy.get(farm.id) ?? 0,
    }));
  }
}
