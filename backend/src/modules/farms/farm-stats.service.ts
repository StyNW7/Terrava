import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { BarnStats, FarmStats } from '../../common/serializers';

/**
 * Aggregates computed on read instead of denormalised counters, so occupancy,
 * health and alert counts can never drift from the underlying records.
 * Each method issues a fixed number of grouped queries regardless of farm count.
 */
@Injectable()
export class FarmStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async forFarms(organizationId: string, farmIds: string[]): Promise<Map<string, FarmStats>> {
    if (!farmIds.length) return new Map();
    const where = { farmId: { in: farmIds } };

    const [livestock, covered, barns, alerts, staff] = await Promise.all([
      this.prisma.livestock.groupBy({
        by: ['farmId'],
        where: { ...where, archived: false },
        _count: { _all: true },
        _avg: { healthScore: true },
      }),
      this.prisma.livestock.groupBy({
        by: ['farmId'],
        where: { ...where, archived: false, deviceId: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.barn.groupBy({ by: ['farmId'], where, _count: { _all: true }, _sum: { capacity: true } }),
      this.prisma.alert.groupBy({
        by: ['farmId'],
        where: { ...where, organizationId, status: { not: 'RESOLVED' } },
        _count: { _all: true },
      }),
      this.prisma.membership.groupBy({
        by: ['farmId'],
        where: { organizationId, status: 'ACTIVE', farmId: { in: farmIds } },
        _count: { _all: true },
      }),
    ]);

    const index = <T extends { farmId: string | null }>(rows: T[]) => new Map(rows.map((row) => [row.farmId, row]));
    const livestockBy = index(livestock);
    const coveredBy = index(covered);
    const barnsBy = index(barns);
    const alertsBy = index(alerts);
    const staffBy = index(staff);

    return new Map(
      farmIds.map((farmId) => {
        const animals = livestockBy.get(farmId)?._count._all ?? 0;
        const withDevice = coveredBy.get(farmId)?._count._all ?? 0;
        return [
          farmId,
          {
            livestockCount: animals,
            barnCount: barnsBy.get(farmId)?._count._all ?? 0,
            healthScore: Math.round(livestockBy.get(farmId)?._avg.healthScore ?? 0),
            deviceCoverage: animals ? Math.round((withDevice / animals) * 100) : 0,
            activeAlerts: alertsBy.get(farmId)?._count._all ?? 0,
            staffCount: staffBy.get(farmId)?._count._all ?? 0,
            capacity: barnsBy.get(farmId)?._sum.capacity ?? 0,
          },
        ];
      }),
    );
  }

  async forBarns(barnIds: string[]): Promise<Map<string, BarnStats>> {
    if (!barnIds.length) return new Map();
    const [livestock, alerts, climate] = await Promise.all([
      this.prisma.livestock.groupBy({
        by: ['barnId'],
        where: { barnId: { in: barnIds }, archived: false },
        _count: { _all: true },
        _avg: { healthScore: true },
      }),
      this.prisma.alert.groupBy({
        by: ['barnId'],
        where: { barnId: { in: barnIds }, status: { not: 'RESOLVED' } },
        _count: { _all: true },
      }),
      // Latest climate reading per barn.
      this.prisma.environmentReading.findMany({
        where: { barnId: { in: barnIds } },
        distinct: ['barnId'],
        orderBy: [{ barnId: 'asc' }, { recordedAt: 'desc' }],
        select: { barnId: true, temperature: true, humidity: true },
      }),
    ]);
    const livestockBy = new Map(livestock.map((row) => [row.barnId, row]));
    const alertsBy = new Map(alerts.map((row) => [row.barnId, row._count._all]));
    const climateBy = new Map(climate.map((row) => [row.barnId, row]));

    return new Map(
      barnIds.map((barnId) => [
        barnId,
        {
          occupancy: livestockBy.get(barnId)?._count._all ?? 0,
          healthScore: Math.round(livestockBy.get(barnId)?._avg.healthScore ?? 0),
          temperature: climateBy.get(barnId)?.temperature ?? 0,
          humidity: Math.round(climateBy.get(barnId)?.humidity ?? 0),
          alertCount: alertsBy.get(barnId) ?? 0,
        },
      ]),
    );
  }
}
