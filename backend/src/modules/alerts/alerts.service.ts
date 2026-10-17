import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Events } from '../../common/events';
import { paginate, skipTake } from '../../common/dto/pagination.dto';
import { serializeAlert } from '../../common/serializers';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import { SEVERITY_RANK, type AlertCandidate } from '../../domain/alert-rules';
import type { AuthContext } from '../../common/auth-context';
import type {
  AlertCategory,
  AlertEventType,
  AlertSeverity,
  AlertSource,
  AlertStatus,
  Prisma,
} from '../../generated/prisma/client';
import type { AlertQueryDto, BulkAlertDto, CreateAlertDto } from './alerts.dto';

const DEDUPE_WINDOW_MS = 24 * 3_600_000;
/** A rule must stay clear this long before its alert auto-resolves, so values hovering at a threshold do not flap. */
export const AUTO_RESOLVE_CLEAR_MS = 30 * 60_000;

const detailInclude = {
  notes: { orderBy: { createdAt: 'asc' } },
  assignedTo: { include: { user: true } },
} satisfies Prisma.AlertInclude;

/** Context the rule engine passes when it raises an alert. */
export interface RaiseContext {
  organizationId: string;
  farmId: string;
  barnId?: string | null;
  livestockId?: string | null;
  deviceId?: string | null;
  source?: AlertSource;
  dataAtDetection: { temperature: number; heartRate: number; activity: number; oxygen: number };
  detectedAt?: Date;
}

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  async list(ctx: AuthContext, query: AlertQueryDto) {
    const csv = <T extends string>(value?: string) =>
      value ? value.split(',').map((v) => fromApiEnum<T>(v.trim())) : undefined;
    const where: Prisma.AlertWhereInput = {
      organizationId: ctx.organizationId,
      status: query.status ? { in: csv<AlertStatus>(query.status) } : undefined,
      severity: query.severity ? { in: csv<AlertSeverity>(query.severity) } : undefined,
      category: query.category ? { in: csv<AlertCategory>(query.category) } : undefined,
      farmId: query.farmId && query.farmId !== 'all' ? query.farmId : undefined,
      barnId: query.barnId,
      livestockId: query.livestockId,
      assignedToId:
        query.assignedTo === 'me' ? ctx.membershipId : query.assignedTo === 'unassigned' ? null : query.assignedTo,
      detectedAt:
        query.from || query.to
          ? { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined }
          : undefined,
      ...(query.search
        ? {
            OR: [
              { title: { path: ['en'], string_contains: query.search } },
              { title: { path: ['id'], string_contains: query.search } },
              { livestock: { name: { contains: query.search, mode: 'insensitive' } } },
              { livestock: { code: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: { assignedTo: { include: { user: true } } },
        orderBy: [{ detectedAt: query.sortOrder }],
        ...skipTake(query),
      }),
      this.prisma.alert.count({ where }),
    ]);
    return paginate(rows.map(serializeAlert), total, query);
  }

  async stats(ctx: AuthContext, farmId?: string) {
    const where: Prisma.AlertWhereInput = {
      organizationId: ctx.organizationId,
      ...(farmId && farmId !== 'all' ? { farmId } : {}),
    };
    const open: Prisma.AlertWhereInput = { ...where, status: { not: 'RESOLVED' } };
    const [bySeverity, byCategory, byStatus, resolved] = await Promise.all([
      this.prisma.alert.groupBy({ by: ['severity'], where: open, _count: { _all: true } }),
      this.prisma.alert.groupBy({ by: ['category'], where: open, _count: { _all: true } }),
      this.prisma.alert.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.alert.findMany({
        where: {
          ...where,
          status: 'RESOLVED',
          resolvedAt: { not: null },
          detectedAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
        select: { detectedAt: true, resolvedAt: true },
      }),
    ]);
    const mttrHours = resolved.length
      ? resolved.reduce((sum, a) => sum + (a.resolvedAt!.getTime() - a.detectedAt.getTime()), 0) /
        resolved.length /
        3_600_000
      : null;
    return {
      open: bySeverity.reduce((sum, row) => sum + row._count._all, 0),
      bySeverity: Object.fromEntries(bySeverity.map((r) => [toApiEnum(r.severity), r._count._all])),
      byCategory: Object.fromEntries(byCategory.map((r) => [toApiEnum(r.category), r._count._all])),
      byStatus: Object.fromEntries(byStatus.map((r) => [toApiEnum(r.status), r._count._all])),
      meanTimeToResolveHours: mttrHours != null ? Math.round(mttrHours * 10) / 10 : null,
    };
  }

  async get(ctx: AuthContext, id: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: {
        ...detailInclude,
        events: { orderBy: { createdAt: 'asc' } },
        livestock: {
          select: { id: true, code: true, name: true, healthStatus: true, healthScore: true, photoUrl: true },
        },
        farm: { select: { id: true, name: true } },
        barn: { select: { id: true, name: true } },
      },
    });
    if (!alert) throw new NotFoundException('Alert not found');

    // Related: same animal, or same category in the same barn, over the past week.
    const related = await this.prisma.alert.findMany({
      where: {
        organizationId: ctx.organizationId,
        id: { not: id },
        detectedAt: { gte: new Date(alert.detectedAt.getTime() - 7 * 86_400_000) },
        OR: [
          ...(alert.livestockId ? [{ livestockId: alert.livestockId }] : []),
          ...(alert.barnId ? [{ barnId: alert.barnId, category: alert.category }] : []),
        ],
      },
      orderBy: { detectedAt: 'desc' },
      take: 6,
    });

    return {
      ...serializeAlert(alert),
      livestock: alert.livestock ? { ...alert.livestock, healthStatus: toApiEnum(alert.livestock.healthStatus) } : null,
      farm: alert.farm,
      barn: alert.barn,
      timeline: alert.events.map((event) => ({
        id: event.id,
        type: toApiEnum(event.type),
        actor: event.actorName,
        metadata: event.metadata,
        timestamp: event.createdAt.toISOString(),
      })),
      related: related.map((r) => serializeAlert(r)),
    };
  }

  // ---------------------------------------------------------------------------
  // Workflow
  // ---------------------------------------------------------------------------

  async acknowledge(ctx: AuthContext, ids: string[]) {
    return this.transition(
      ctx,
      ids,
      'ACKNOWLEDGED',
      { status: 'ACTIVE' },
      {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: ctx.name,
      },
    );
  }

  async resolve(ctx: AuthContext, ids: string[], note?: string) {
    const result = await this.transition(
      ctx,
      ids,
      'RESOLVED',
      { status: { not: 'RESOLVED' } },
      {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: ctx.name,
        resolutionNote: note,
      },
    );
    if (note) {
      await this.prisma.alertNote.createMany({
        data: result.ids.map((alertId) => ({ alertId, authorId: ctx.userId, authorName: ctx.name, text: note })),
      });
    }
    return result;
  }

  async reopen(ctx: AuthContext, ids: string[]) {
    return this.transition(
      ctx,
      ids,
      'REOPENED',
      { status: 'RESOLVED' },
      {
        status: 'ACTIVE',
        resolvedAt: null,
        resolvedBy: null,
        resolutionNote: null,
        acknowledgedAt: null,
        acknowledgedBy: null,
      },
    );
  }

  async assign(ctx: AuthContext, ids: string[], assigneeId: string | null) {
    let assigneeName: string | null = null;
    if (assigneeId) {
      const member = await this.prisma.membership.findFirst({
        where: { id: assigneeId, organizationId: ctx.organizationId, status: 'ACTIVE' },
        include: { user: true },
      });
      if (!member) throw new BadRequestException('Assignee must be an active member of this organization');
      assigneeName = member.user.name;
    }
    return this.transition(
      ctx,
      ids,
      assigneeId ? 'ASSIGNED' : 'UNASSIGNED',
      {},
      { assignedToId: assigneeId },
      { assignee: assigneeName },
    );
  }

  async bulk(ctx: AuthContext, dto: BulkAlertDto) {
    switch (dto.action) {
      case 'acknowledge':
        return this.acknowledge(ctx, dto.ids);
      case 'resolve':
        return this.resolve(ctx, dto.ids, dto.note);
      case 'reopen':
        return this.reopen(ctx, dto.ids);
      case 'assign':
        return this.assign(ctx, dto.ids, dto.assigneeId ?? null);
    }
  }

  async addNote(ctx: AuthContext, id: string, text: string) {
    await this.assertAlert(ctx, id);
    await this.prisma.$transaction([
      this.prisma.alertNote.create({ data: { alertId: id, authorId: ctx.userId, authorName: ctx.name, text } }),
      this.prisma.alertEvent.create({ data: { alertId: id, type: 'NOTE_ADDED', actorName: ctx.name } }),
    ]);
    return this.get(ctx, id);
  }

  /** Manually reported alert (e.g. a farmer noticing lameness). */
  async createManual(ctx: AuthContext, dto: CreateAlertDto) {
    const farm = await this.prisma.farm.count({ where: { id: dto.farmId, organizationId: ctx.organizationId } });
    if (!farm) throw new BadRequestException('Farm not found');
    const animal = dto.livestockId
      ? await this.prisma.livestock.findFirst({ where: { id: dto.livestockId, organizationId: ctx.organizationId } })
      : null;
    if (dto.livestockId && !animal) throw new BadRequestException('Livestock not found');

    const alert = await this.prisma.alert.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: dto.farmId,
        barnId: dto.barnId ?? animal?.barnId,
        livestockId: animal?.id,
        title: { ...dto.title },
        description: { ...dto.description },
        severity: fromApiEnum<AlertSeverity>(dto.severity),
        category: fromApiEnum<AlertCategory>(dto.category),
        source: 'MANUAL',
        aiConfidence: dto.aiConfidence ?? 100,
        aiCause: { id: 'Dilaporkan secara manual oleh tim.', en: 'Reported manually by the team.' },
        recommendations: dto.recommendations ?? [],
        dataAtDetection: {
          temperature: animal?.temperature ?? 0,
          heartRate: animal?.heartRate ?? 0,
          activity: animal?.activityLevel ?? 0,
          oxygen: animal?.oxygenLevel ?? 0,
        },
        events: { create: { type: 'CREATED', actorName: ctx.name } },
      },
      include: detailInclude,
    });
    const payload = serializeAlert(alert);
    this.events.emit(Events.AlertCreated, { organizationId: ctx.organizationId, payload });
    await this.audit.record(ctx, { action: 'alert.create', entityType: 'Alert', entityId: alert.id });
    return payload;
  }

  /**
   * Raise an alert from the rule engine / AI. De-duplicates against an open
   * alert for the same rule and subject within 24 h, escalating its severity
   * when the new reading is worse instead of opening a second alert.
   */
  async raise(candidate: AlertCandidate, ctx: RaiseContext) {
    const subject: Prisma.AlertWhereInput = ctx.livestockId
      ? { livestockId: ctx.livestockId }
      : ctx.deviceId
        ? { deviceId: ctx.deviceId }
        : ctx.barnId
          ? { barnId: ctx.barnId }
          : { farmId: ctx.farmId };

    const existing = await this.prisma.alert.findFirst({
      where: {
        organizationId: ctx.organizationId,
        ruleKey: candidate.ruleKey,
        status: { not: 'RESOLVED' },
        detectedAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
        ...subject,
      },
      orderBy: { detectedAt: 'desc' },
    });

    const seenAt = ctx.detectedAt ?? new Date();
    if (existing) {
      if (SEVERITY_RANK[candidate.severity] > SEVERITY_RANK[existing.severity]) {
        const escalated = await this.prisma.alert.update({
          where: { id: existing.id },
          data: {
            severity: candidate.severity,
            description: { ...candidate.description },
            aiConfidence: Math.max(existing.aiConfidence, candidate.confidence),
            dataAtDetection: ctx.dataAtDetection,
            status: 'ACTIVE',
            lastSeenAt: seenAt > existing.lastSeenAt ? seenAt : existing.lastSeenAt,
            events: {
              create: {
                type: 'ESCALATED',
                actorName: 'Terrava AI',
                metadata: { from: existing.severity, to: candidate.severity },
              },
            },
          },
          include: detailInclude,
        });
        const payload = serializeAlert(escalated);
        this.events.emit(Events.AlertUpdated, { organizationId: ctx.organizationId, payload });
        if (candidate.severity === 'CRITICAL')
          this.events.emit(Events.AlertCreated, { organizationId: ctx.organizationId, payload });
        return { alert: payload, created: false, escalated: true };
      }
      if (seenAt > existing.lastSeenAt) {
        await this.prisma.alert.update({ where: { id: existing.id }, data: { lastSeenAt: seenAt } });
      }
      return { alert: null, created: false, escalated: false };
    }

    const alert = await this.prisma.alert.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: ctx.farmId,
        barnId: ctx.barnId,
        livestockId: ctx.livestockId,
        deviceId: ctx.deviceId,
        title: { ...candidate.title },
        description: { ...candidate.description },
        severity: candidate.severity,
        category: candidate.category,
        source: ctx.source ?? 'RULE',
        ruleKey: candidate.ruleKey,
        aiConfidence: candidate.confidence,
        aiCause: { ...candidate.cause },
        recommendations: candidate.recommendations,
        dataAtDetection: ctx.dataAtDetection,
        detectedAt: seenAt,
        lastSeenAt: seenAt,
        events: { create: { type: 'CREATED', actorName: 'Terrava AI' } },
      },
      include: detailInclude,
    });
    const payload = serializeAlert(alert);
    this.events.emit(Events.AlertCreated, { organizationId: ctx.organizationId, payload });
    return { alert: payload, created: true, escalated: false };
  }

  /**
   * Close rule-based alerts automatically once the condition has cleared and
   * stayed clear for AUTO_RESOLVE_CLEAR_MS (measured against the reading time `asOf`).
   */
  async autoResolve(
    organizationId: string,
    subject: { livestockId?: string; deviceId?: string; barnId?: string },
    ruleKeys: string[],
    asOf: Date = new Date(),
  ) {
    if (!ruleKeys.length) return 0;
    const open = await this.prisma.alert.findMany({
      where: {
        organizationId,
        ruleKey: { in: ruleKeys },
        status: 'ACTIVE',
        source: { in: ['RULE', 'DEVICE'] },
        lastSeenAt: { lt: new Date(asOf.getTime() - AUTO_RESOLVE_CLEAR_MS) },
        ...subject,
      },
      select: { id: true },
    });
    if (!open.length) return 0;
    const ids = open.map((a) => a.id);
    await this.prisma.$transaction([
      this.prisma.alert.updateMany({
        where: { id: { in: ids } },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: 'Terrava AI',
          resolutionNote: 'Condition returned to normal',
        },
      }),
      this.prisma.alertEvent.createMany({
        data: ids.map((alertId) => ({
          alertId,
          type: 'RESOLVED' as const,
          actorName: 'Terrava AI',
          metadata: { auto: true },
        })),
      }),
    ]);
    for (const id of ids) {
      this.events.emit(Events.AlertUpdated, { organizationId, payload: { id, status: 'resolved' } });
    }
    return ids.length;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async transition(
    ctx: AuthContext,
    ids: string[],
    eventType: AlertEventType,
    precondition: Prisma.AlertWhereInput,
    data: Prisma.AlertUncheckedUpdateManyInput,
    metadata?: Prisma.InputJsonValue,
  ) {
    const targets = await this.prisma.alert.findMany({
      where: { id: { in: ids }, organizationId: ctx.organizationId, ...precondition },
      select: { id: true },
    });
    const targetIds = targets.map((t) => t.id);
    if (!targetIds.length) {
      const exists = await this.prisma.alert.count({ where: { id: { in: ids }, organizationId: ctx.organizationId } });
      if (!exists) throw new NotFoundException('Alert not found');
      return { updated: 0, ids: [] as string[] };
    }
    await this.prisma.$transaction([
      this.prisma.alert.updateMany({ where: { id: { in: targetIds } }, data }),
      this.prisma.alertEvent.createMany({
        data: targetIds.map((alertId) => ({ alertId, type: eventType, actorName: ctx.name, metadata })),
      }),
    ]);
    const updated = await this.prisma.alert.findMany({ where: { id: { in: targetIds } }, include: detailInclude });
    for (const alert of updated) {
      this.events.emit(Events.AlertUpdated, { organizationId: ctx.organizationId, payload: serializeAlert(alert) });
    }
    await this.audit.record(ctx, {
      action: `alert.${eventType.toLowerCase()}`,
      entityType: 'Alert',
      metadata: { ids: targetIds },
    });
    return { updated: targetIds.length, ids: targetIds, alerts: updated.map(serializeAlert) };
  }

  private async assertAlert(ctx: AuthContext, id: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id, organizationId: ctx.organizationId },
      select: { id: true },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }
}
