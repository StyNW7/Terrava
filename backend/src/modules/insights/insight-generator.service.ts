import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { Events } from '../../common/events';
import { serializeInsight } from '../../common/serializers';
import { thiBand } from '../../domain/environment';
import type { InsightCategory, InsightPriority, Prisma } from '../../generated/prisma/client';
import type { Localized } from '../../common/utils/localized';

interface Draft {
  key: string;
  farmId?: string | null;
  priority: InsightPriority;
  category: InsightCategory;
  title: Localized;
  summary: Localized;
  recommendation: Localized;
  confidence: number;
  affectedLivestock: string[];
}

const DEDUPE_HOURS = 24;

/**
 * Herd-level analytics that run on the server without the ML service:
 * activity decline per barn, recurring fever, battery trends, heat stress,
 * falling herd health, overdue vaccinations and weakening gateways.
 * The AI service (ai/) produces richer, model-based insights in the same shape.
 */
@Injectable()
export class InsightGeneratorService {
  private readonly logger = new Logger(InsightGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly config: AppConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'insight-generator' })
  async runScheduled() {
    if (!this.config.get('JOBS_ENABLED')) return;
    const organizations = await this.prisma.organization.findMany({ select: { id: true } });
    for (const org of organizations) {
      try {
        await this.generate(org.id);
      } catch (error) {
        this.logger.error(`Insight generation failed for ${org.id}: ${(error as Error).message}`);
      }
    }
  }

  async generate(organizationId: string) {
    const drafts = (
      await Promise.all([
        this.activityDecline(organizationId),
        this.recurringFever(organizationId),
        this.batteryTrend(organizationId),
        this.heatStress(organizationId),
        this.herdHealth(organizationId),
        this.vaccinationOverdue(organizationId),
        this.gatewaySignal(organizationId),
      ])
    ).flat();

    const since = new Date(Date.now() - DEDUPE_HOURS * 3_600_000);
    const recent = await this.prisma.aIInsight.findMany({
      where: { organizationId, generatedAt: { gte: since } },
      select: { metadata: true },
    });
    const recentKeys = new Set(recent.map((r) => (r.metadata as { key?: string } | null)?.key).filter(Boolean));

    const created = [];
    for (const draft of drafts) {
      if (recentKeys.has(draft.key)) continue;
      const insight = await this.prisma.aIInsight.create({
        data: {
          organizationId,
          farmId: draft.farmId ?? null,
          priority: draft.priority,
          category: draft.category,
          title: { ...draft.title },
          summary: { ...draft.summary },
          recommendation: { ...draft.recommendation },
          confidence: draft.confidence,
          affectedLivestock: draft.affectedLivestock,
          source: 'rules/herd-analytics',
          metadata: { key: draft.key } as Prisma.InputJsonValue,
        },
      });
      const payload = serializeInsight(insight);
      this.events.emit(Events.InsightCreated, { organizationId, payload });
      created.push(payload);
    }
    return { evaluated: drafts.length, created: created.length, insights: created };
  }

  // ---------------------------------------------------------------------------
  // Analyses
  // ---------------------------------------------------------------------------

  private async activityDecline(organizationId: string): Promise<Draft[]> {
    const rows = await this.prisma.$queryRaw<
      { barnId: string; barnName: string; farmId: string; recent: number; baseline: number; animals: string[] }[]
    >`
      SELECT l."barnId" AS "barnId", b."name" AS "barnName", l."farmId" AS "farmId",
             AVG(t."activity") FILTER (WHERE t."recordedAt" >= NOW() - INTERVAL '48 hours')::float AS recent,
             AVG(t."activity") FILTER (WHERE t."recordedAt" < NOW() - INTERVAL '48 hours')::float AS baseline,
             ARRAY_AGG(DISTINCT l."id") AS animals
      FROM "telemetry_readings" t
      JOIN "livestock" l ON l."id" = t."livestockId"
      JOIN "barns" b ON b."id" = l."barnId"
      WHERE l."organizationId" = ${organizationId} AND l."archived" = false
        AND t."recordedAt" >= NOW() - INTERVAL '9 days' AND t."activity" IS NOT NULL
      GROUP BY l."barnId", b."name", l."farmId"`;
    return rows
      .filter((r) => r.recent != null && r.baseline != null && r.baseline > 0 && r.animals.length >= 3)
      .map((r) => ({ ...r, drop: ((r.baseline - r.recent) / r.baseline) * 100 }))
      .filter((r) => r.drop >= 12)
      .map((r): Draft => ({
        key: `activity-decline:${r.barnId}`,
        farmId: r.farmId,
        priority: r.drop >= 20 ? 'HIGH' : 'MEDIUM',
        category: 'BEHAVIOR',
        title: { id: `Penurunan aktivitas di ${r.barnName}`, en: `Activity decline in ${r.barnName}` },
        summary: {
          id: `${r.animals.length} ternak di ${r.barnName} menunjukkan penurunan aktivitas rata-rata ${Math.round(r.drop)}% selama dua hari terakhir.`,
          en: `${r.animals.length} animals in ${r.barnName} have shown an average ${Math.round(r.drop)}% drop in activity over the past two days.`,
        },
        recommendation: {
          id: 'Jadwalkan inspeksi lapangan dan pantau pola aktivitas selama 24 jam ke depan.',
          en: 'Schedule a field inspection and watch activity patterns for the next 24 hours.',
        },
        confidence: Math.min(95, Math.round(70 + r.drop)),
        affectedLivestock: r.animals.slice(0, 20),
      }));
  }

  private async recurringFever(organizationId: string): Promise<Draft[]> {
    const rows = await this.prisma.alert.groupBy({
      by: ['livestockId'],
      where: {
        organizationId,
        ruleKey: 'tempHigh',
        livestockId: { not: null },
        detectedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      },
      _count: { _all: true },
      having: { livestockId: { _count: { gte: 2 } } },
    });
    const animals = rows.map((r) => r.livestockId!).filter(Boolean);
    if (animals.length < 1) return [];
    return [
      {
        key: `recurring-fever:${[...animals].sort().join(',')}`,
        priority: 'HIGH',
        category: 'HEALTH',
        title: { id: 'Anomali suhu berulang', en: 'Recurring temperature anomaly' },
        summary: {
          id: `${animals.length} ternak mengalami kenaikan suhu tubuh berulang dalam seminggu terakhir.`,
          en: `${animals.length} animals have had repeated body temperature spikes over the past week.`,
        },
        recommendation: {
          id: 'Rekomendasikan pemeriksaan dokter hewan untuk kelompok ternak terkait.',
          en: 'Arrange a veterinary examination for the affected group.',
        },
        confidence: Math.min(94, 78 + animals.length * 3),
        affectedLivestock: animals,
      },
    ];
  }

  private async batteryTrend(organizationId: string): Promise<Draft[]> {
    const low = await this.prisma.device.findMany({
      where: { organizationId, type: 'EAR_TAG', battery: { lte: 20 } },
      select: { assignedLivestock: { select: { id: true } } },
    });
    if (low.length < 2) return [];
    return [
      {
        key: `battery-trend:${low.length}`,
        priority: low.length >= 5 ? 'HIGH' : 'MEDIUM',
        category: 'DEVICES',
        title: { id: 'Perangkat baterai rendah meningkat', en: 'More devices running low on battery' },
        summary: {
          id: `${low.length} smart ear tag memiliki baterai di bawah 20 persen.`,
          en: `${low.length} smart ear tags are below 20 percent battery.`,
        },
        recommendation: {
          id: 'Jadwalkan penggantian atau pengisian daya perangkat secara proaktif.',
          en: 'Proactively schedule device replacement or recharging.',
        },
        confidence: 96,
        affectedLivestock: low.map((d) => d.assignedLivestock?.id).filter((id): id is string => Boolean(id)),
      },
    ];
  }

  private async heatStress(organizationId: string): Promise<Draft[]> {
    const latest = await this.prisma.environmentReading.findMany({
      where: { farm: { organizationId }, recordedAt: { gte: new Date(Date.now() - 6 * 3_600_000) } },
      orderBy: { recordedAt: 'desc' },
      distinct: ['farmId'],
      include: { farm: { select: { name: true } } },
    });
    return latest
      .filter((r) => thiBand(r.thi) !== 'normal')
      .map((r): Draft => ({
        key: `heat-stress:${r.farmId}:${new Date().toISOString().slice(0, 10)}`,
        farmId: r.farmId,
        priority: thiBand(r.thi) === 'mild' ? 'MEDIUM' : 'HIGH',
        category: 'ENVIRONMENT',
        title: { id: `Risiko heat stress di ${r.farm.name}`, en: `Heat stress risk at ${r.farm.name}` },
        summary: {
          id: `Temperature-Humidity Index mencapai ${r.thi} (suhu ${r.temperature.toFixed(1)}°C, kelembapan ${Math.round(r.humidity)}%).`,
          en: `The Temperature-Humidity Index has reached ${r.thi} (${r.temperature.toFixed(1)}°C, ${Math.round(r.humidity)}% humidity).`,
        },
        recommendation: {
          id: 'Siapkan ventilasi tambahan dan pastikan akses air minum memadai.',
          en: 'Prepare additional ventilation and make sure drinking water is readily available.',
        },
        confidence: 88,
        affectedLivestock: [],
      }));
  }

  private async herdHealth(organizationId: string): Promise<Draft[]> {
    const groups = await this.prisma.livestock.groupBy({
      by: ['herdGroup'],
      where: { organizationId, archived: false },
      _avg: { healthScore: true },
      _count: { _all: true },
    });
    const weak = groups.filter((g) => (g._avg.healthScore ?? 100) < 76 && g._count._all >= 3);
    const drafts: Draft[] = [];
    for (const group of weak) {
      const animals = await this.prisma.livestock.findMany({
        where: {
          organizationId,
          herdGroup: group.herdGroup,
          archived: false,
          healthStatus: { in: ['ATTENTION', 'CRITICAL'] },
        },
        select: { id: true },
      });
      drafts.push({
        key: `herd-health:${group.herdGroup}`,
        priority: 'MEDIUM',
        category: 'PRODUCTIVITY',
        title: { id: `Skor kesehatan ${group.herdGroup} menurun`, en: `${group.herdGroup} health score is falling` },
        summary: {
          id: `Rata-rata skor kesehatan ${group.herdGroup} berada di ${Math.round(group._avg.healthScore ?? 0)}.`,
          en: `The average health score for ${group.herdGroup} is ${Math.round(group._avg.healthScore ?? 0)}.`,
        },
        recommendation: {
          id: 'Tinjau kualitas pakan dan kondisi lingkungan kandang terkait.',
          en: 'Review feed quality and the environmental conditions in the relevant barn.',
        },
        confidence: 81,
        affectedLivestock: animals.map((a) => a.id),
      });
    }
    return drafts;
  }

  private async vaccinationOverdue(organizationId: string): Promise<Draft[]> {
    const overdue = await this.prisma.livestock.findMany({
      where: { organizationId, archived: false, vaccinationStatus: 'OVERDUE' },
      select: { id: true },
    });
    if (!overdue.length) return [];
    return [
      {
        key: `vaccination-overdue:${overdue.length}`,
        priority: overdue.length >= 5 ? 'HIGH' : 'MEDIUM',
        category: 'HEALTH',
        title: { id: 'Follow-up vaksinasi tertunda', en: 'Vaccination follow-up overdue' },
        summary: {
          id: `${overdue.length} ternak melewati jadwal follow-up vaksinasi.`,
          en: `${overdue.length} animals are past their vaccination follow-up date.`,
        },
        recommendation: {
          id: 'Jadwalkan ulang sesi vaksinasi lanjutan bersama dokter hewan.',
          en: 'Reschedule the follow-up vaccination session with the veterinarian.',
        },
        confidence: 97,
        affectedLivestock: overdue.map((a) => a.id),
      },
    ];
  }

  private async gatewaySignal(organizationId: string): Promise<Draft[]> {
    const gateways = await this.prisma.device.findMany({
      where: { organizationId, type: 'GATEWAY', status: { not: 'MAINTENANCE' }, signal: { lt: 50 } },
      select: { id: true, name: true, farmId: true, signal: true },
    });
    return gateways.map((g): Draft => ({
      key: `gateway-signal:${g.id}`,
      farmId: g.farmId,
      priority: 'MEDIUM',
      category: 'DEVICES',
      title: { id: `Sinyal ${g.name} melemah`, en: `${g.name} signal weakening` },
      summary: {
        id: `Kualitas sinyal gateway turun ke ${g.signal}%.`,
        en: `Gateway link quality has dropped to ${g.signal}%.`,
      },
      recommendation: {
        id: 'Jadwalkan pemeriksaan teknis pada lokasi gateway terkait.',
        en: 'Schedule a technical inspection at that gateway location.',
      },
      confidence: 84,
      affectedLivestock: [],
    }));
  }
}
