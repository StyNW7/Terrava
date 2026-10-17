import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PairingService } from '../devices/pairing.service';
import { Events } from '../../common/events';
import { paginate, skipTake } from '../../common/dto/pagination.dto';
import { serializeLivestock } from '../../common/serializers';
import { toCsv } from '../../common/utils/csv';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import { asLocalized, localized } from '../../common/utils/localized';
import { ageInMonths } from '../../domain/schedule';
import type { AuthContext } from '../../common/auth-context';
import {
  Prisma,
  type DeviceStatus,
  type HealthRecordType,
  type HealthStatus,
  type VaccinationStatus,
} from '../../generated/prisma/client';
import type {
  BulkLivestockDto,
  CreateLivestockDto,
  HealthRecordDto,
  LivestockQueryDto,
  MoveLivestockDto,
  UpdateLivestockDto,
} from './livestock.dto';

export type VitalsRange = '24h' | '7d' | '30d' | '90d';

const RANGE_CONFIG: Record<VitalsRange, { hours: number; bucket: 'hour' | 'day' }> = {
  '24h': { hours: 24, bucket: 'hour' },
  '7d': { hours: 24 * 7, bucket: 'hour' },
  '30d': { hours: 24 * 30, bucket: 'day' },
  '90d': { hours: 24 * 90, bucket: 'day' },
};

const withDevice = { device: true } as const;

@Injectable()
export class LivestockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pairing: PairingService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  private buildWhere(ctx: AuthContext, query: LivestockQueryDto): Prisma.LivestockWhereInput {
    const deviceFilter: Prisma.LivestockWhereInput =
      query.deviceStatus === 'unassigned'
        ? { deviceId: null }
        : query.deviceStatus
          ? { device: { status: fromApiEnum<DeviceStatus>(query.deviceStatus) } }
          : {};
    return {
      organizationId: ctx.organizationId,
      archived: query.archived ?? false,
      farmId: query.farmId && query.farmId !== 'all' ? query.farmId : undefined,
      barnId: query.barnId,
      healthStatus: query.healthStatus ? fromApiEnum<HealthStatus>(query.healthStatus) : undefined,
      type: query.type,
      breed: query.breed,
      herdGroup: query.herdGroup,
      vaccinationStatus: query.vaccinationStatus ? fromApiEnum<VaccinationStatus>(query.vaccinationStatus) : undefined,
      ...deviceFilter,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { earTagId: { contains: query.search, mode: 'insensitive' } },
              { breed: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  async list(ctx: AuthContext, query: LivestockQueryDto) {
    const where = this.buildWhere(ctx, query);
    const sortBy = query.sortBy ?? 'code';
    const [rows, total, statusCounts] = await Promise.all([
      this.prisma.livestock.findMany({
        where,
        include: withDevice,
        orderBy: { [sortBy]: sortBy === 'code' && !query.sortBy ? 'asc' : query.sortOrder },
        ...skipTake(query),
      }),
      this.prisma.livestock.count({ where }),
      this.prisma.livestock.groupBy({
        by: ['healthStatus'],
        where: { ...where, healthStatus: undefined },
        _count: { _all: true },
      }),
    ]);
    return {
      ...paginate(rows.map(serializeLivestock), total, query),
      summary: Object.fromEntries(statusCounts.map((row) => [toApiEnum(row.healthStatus), row._count._all])),
    };
  }

  async exportCsv(ctx: AuthContext, query: LivestockQueryDto) {
    const rows = await this.prisma.livestock.findMany({
      where: this.buildWhere(ctx, query),
      include: { device: true, farm: { select: { name: true } }, barn: { select: { name: true } } },
      orderBy: { code: 'asc' },
      take: 10_000,
    });
    return toCsv(
      [
        'Code',
        'Name',
        'Ear Tag',
        'Type',
        'Breed',
        'Gender',
        'Age (months)',
        'Weight (kg)',
        'BCS',
        'Farm',
        'Barn',
        'Herd',
        'Health Status',
        'Health Score',
        'Temperature (°C)',
        'Heart Rate (bpm)',
        'Activity (%)',
        'Oxygen (%)',
        'Device',
        'Battery (%)',
        'Vaccination',
        'Last Update',
      ],
      rows.map((a) => [
        a.code,
        a.name,
        a.earTagId,
        a.type,
        a.breed,
        a.gender === 'MALE' ? 'Male' : 'Female',
        ageInMonths(a.dateOfBirth),
        a.weightKg,
        a.bodyConditionScore,
        a.farm.name,
        a.barn.name,
        a.herdGroup,
        toApiEnum(a.healthStatus),
        a.healthScore,
        a.temperature,
        a.heartRate,
        a.activityLevel,
        a.oxygenLevel,
        a.device?.serial ?? '',
        a.device?.battery ?? '',
        toApiEnum(a.vaccinationStatus),
        a.lastReadingAt?.toISOString() ?? '',
      ]),
    );
  }

  /** Live uniqueness check used by the Add Livestock form. */
  async checkUnique(ctx: AuthContext, field: { code?: string; earTagId?: string }, excludeId?: string) {
    const [code, earTag] = await Promise.all([
      field.code
        ? this.prisma.livestock.count({
            where: {
              organizationId: ctx.organizationId,
              code: field.code,
              NOT: excludeId ? { id: excludeId } : undefined,
            },
          })
        : 0,
      field.earTagId
        ? this.prisma.livestock.count({
            where: {
              organizationId: ctx.organizationId,
              earTagId: field.earTagId,
              NOT: excludeId ? { id: excludeId } : undefined,
            },
          })
        : 0,
    ]);
    return { codeAvailable: code === 0, earTagAvailable: earTag === 0 };
  }

  async get(ctx: AuthContext, id: string) {
    const animal = await this.prisma.livestock.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: { device: true, farm: { select: { id: true, name: true } }, barn: { select: { id: true, name: true } } },
    });
    if (!animal) throw new NotFoundException('Livestock not found');
    const [openAlerts, lastExam, nextVaccination] = await Promise.all([
      this.prisma.alert.count({ where: { livestockId: id, status: { not: 'RESOLVED' } } }),
      this.prisma.healthRecord.findFirst({
        where: { livestockId: id, type: 'EXAMINATION' },
        orderBy: { performedAt: 'desc' },
      }),
      this.prisma.healthRecord.findFirst({
        where: { livestockId: id, type: 'VACCINATION', nextDueAt: { not: null } },
        orderBy: { performedAt: 'desc' },
      }),
    ]);
    return {
      ...serializeLivestock(animal),
      farm: animal.farm,
      barn: animal.barn,
      openAlerts,
      lastExaminationAt: lastExam?.performedAt.toISOString() ?? null,
      nextVaccinationDue: nextVaccination?.nextDueAt?.toISOString() ?? null,
    };
  }

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  async create(ctx: AuthContext, dto: CreateLivestockDto) {
    await this.assertBarnInFarm(ctx, dto.farmId, dto.barnId);
    await this.assertCapacity(dto.barnId);
    const unique = await this.checkUnique(ctx, { code: dto.internalId, earTagId: dto.earTagId });
    if (!unique.codeAvailable) throw new ConflictException(`Internal ID ${dto.internalId} is already used`);
    if (!unique.earTagAvailable) throw new ConflictException(`Ear tag ${dto.earTagId} is already used`);

    const status = fromApiEnum<HealthStatus>(dto.initialHealthStatus);
    const animal = await this.prisma.livestock.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: dto.farmId,
        barnId: dto.barnId,
        code: dto.internalId.trim(),
        name: dto.name.trim(),
        earTagId: dto.earTagId.trim(),
        rfid: dto.rfid,
        registrationNumber: dto.registrationNumber,
        photoUrl: dto.photoUrl,
        type: dto.animalType,
        breed: dto.breed,
        gender: dto.gender === 'Male' ? 'MALE' : 'FEMALE',
        dateOfBirth: new Date(dto.dateOfBirth),
        weightKg: dto.weightKg,
        bodyConditionScore: dto.bodyConditionScore,
        markings: dto.markings,
        herdGroup: dto.herdGroup,
        healthStatus: status,
        healthScore: status === 'HEALTHY' ? 92 : status === 'ATTENTION' ? 70 : status === 'CRITICAL' ? 45 : 60,
        vaccinationStatus: fromApiEnum<VaccinationStatus>(dto.vaccinationStatus),
        arrivalDate: new Date(dto.arrivalDate),
        acquisitionSource: dto.acquisitionSource,
        knownConditions: dto.knownConditions,
        notes: dto.notes ? localized(dto.notes) : undefined,
        healthRecords: {
          create: [
            {
              type: 'WEIGHING',
              title: 'Initial weighing',
              performedAt: new Date(dto.arrivalDate),
              weightKg: dto.weightKg,
              bodyConditionScore: dto.bodyConditionScore,
              performedById: ctx.userId,
              performedByName: ctx.name,
            },
            ...(dto.lastExaminationDate
              ? [
                  {
                    type: 'EXAMINATION' as const,
                    title: 'Examination before arrival',
                    performedAt: new Date(dto.lastExaminationDate),
                    performedByName: ctx.name,
                  },
                ]
              : []),
          ],
        },
      },
    });
    if (dto.deviceId) await this.pairing.pair(ctx, animal.id, dto.deviceId);

    await this.audit.record(ctx, {
      action: 'livestock.create',
      entityType: 'Livestock',
      entityId: animal.id,
      metadata: { code: animal.code },
    });
    this.events.emit(Events.LivestockUpdated, {
      organizationId: ctx.organizationId,
      payload: { id: animal.id, created: true },
    });
    return this.get(ctx, animal.id);
  }

  async update(ctx: AuthContext, id: string, dto: UpdateLivestockDto) {
    const current = await this.assertLivestock(ctx, id);
    if (dto.internalId || dto.earTagId) {
      const unique = await this.checkUnique(ctx, { code: dto.internalId, earTagId: dto.earTagId }, id);
      if (!unique.codeAvailable) throw new ConflictException(`Internal ID ${dto.internalId} is already used`);
      if (!unique.earTagAvailable) throw new ConflictException(`Ear tag ${dto.earTagId} is already used`);
    }
    if (dto.barnId && dto.barnId !== current.barnId) {
      throw new BadRequestException('Use the move endpoint to change barn so the movement is recorded');
    }
    await this.prisma.livestock.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.animalType,
        breed: dto.breed,
        gender: dto.gender ? (dto.gender === 'Male' ? 'MALE' : 'FEMALE') : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        code: dto.internalId,
        earTagId: dto.earTagId,
        rfid: dto.rfid,
        registrationNumber: dto.registrationNumber,
        weightKg: dto.weightKg,
        bodyConditionScore: dto.bodyConditionScore,
        markings: dto.markings,
        herdGroup: dto.herdGroup,
        arrivalDate: dto.arrivalDate ? new Date(dto.arrivalDate) : undefined,
        acquisitionSource: dto.acquisitionSource,
        healthStatus: dto.healthStatus ? fromApiEnum<HealthStatus>(dto.healthStatus) : undefined,
        vaccinationStatus: dto.vaccinationStatus ? fromApiEnum<VaccinationStatus>(dto.vaccinationStatus) : undefined,
        knownConditions: dto.knownConditions,
        notes: dto.notes !== undefined ? localized(dto.notes) : undefined,
        photoUrl: dto.photoUrl,
      },
    });
    await this.audit.record(ctx, { action: 'livestock.update', entityType: 'Livestock', entityId: id });
    this.events.emit(Events.LivestockUpdated, { organizationId: ctx.organizationId, payload: { id } });
    return this.get(ctx, id);
  }

  async setArchived(ctx: AuthContext, ids: string[], archived: boolean) {
    const result = await this.prisma.livestock.updateMany({
      where: { id: { in: ids }, organizationId: ctx.organizationId },
      data: { archived, archivedAt: archived ? new Date() : null },
    });
    if (archived) {
      // Archived animals stop wearing tags so the devices can be reused.
      const worn = await this.prisma.livestock.findMany({
        where: { id: { in: ids }, deviceId: { not: null } },
        select: { id: true },
      });
      for (const animal of worn) await this.pairing.pair(ctx, animal.id, null);
    }
    await this.audit.record(ctx, {
      action: archived ? 'livestock.archive' : 'livestock.restore',
      entityType: 'Livestock',
      metadata: { ids },
    });
    return { updated: result.count };
  }

  async bulk(ctx: AuthContext, dto: BulkLivestockDto) {
    if (dto.action === 'archive') return this.setArchived(ctx, dto.ids, true);
    if (dto.action === 'restore') return this.setArchived(ctx, dto.ids, false);

    const patch = dto.patch ?? {};
    const data: Prisma.LivestockUpdateManyMutationInput = {
      herdGroup: patch.herdGroup,
      vaccinationStatus: patch.vaccinationStatus ? fromApiEnum<VaccinationStatus>(patch.vaccinationStatus) : undefined,
      healthStatus: patch.healthStatus ? fromApiEnum<HealthStatus>(patch.healthStatus) : undefined,
    };
    const result = await this.prisma.livestock.updateMany({
      where: { id: { in: dto.ids }, organizationId: ctx.organizationId },
      data,
    });
    await this.audit.record(ctx, {
      action: 'livestock.bulk-update',
      entityType: 'Livestock',
      metadata: { ids: dto.ids, patch },
    });
    return { updated: result.count };
  }

  async move(ctx: AuthContext, id: string, dto: MoveLivestockDto) {
    const animal = await this.assertLivestock(ctx, id);
    if (animal.barnId === dto.barnId) throw new BadRequestException('The animal is already in that barn');
    const target = await this.prisma.barn.findFirst({
      where: { id: dto.barnId, farm: { organizationId: ctx.organizationId } },
    });
    if (!target) throw new NotFoundException('Target barn not found');
    await this.assertCapacity(target.id);

    await this.prisma.$transaction([
      this.prisma.livestock.update({ where: { id }, data: { barnId: target.id, farmId: target.farmId } }),
      this.prisma.livestockMovement.create({
        data: {
          livestockId: id,
          fromFarmId: animal.farmId,
          fromBarnId: animal.barnId,
          toFarmId: target.farmId,
          toBarnId: target.id,
          reason: dto.reason,
          movedByName: ctx.name,
        },
      }),
      ...(animal.deviceId
        ? [this.prisma.device.update({ where: { id: animal.deviceId }, data: { farmId: target.farmId } })]
        : []),
    ]);
    await this.audit.record(ctx, {
      action: 'livestock.move',
      entityType: 'Livestock',
      entityId: id,
      metadata: { to: target.id },
    });
    this.events.emit(Events.LivestockUpdated, {
      organizationId: ctx.organizationId,
      payload: { id, barnId: target.id },
    });
    return this.get(ctx, id);
  }

  async assignDevice(ctx: AuthContext, id: string, deviceId: string | null) {
    await this.pairing.pair(ctx, id, deviceId);
    return this.get(ctx, id);
  }

  async remove(ctx: AuthContext, id: string) {
    await this.assertLivestock(ctx, id);
    await this.pairing.pair(ctx, id, null);
    await this.prisma.livestock.delete({ where: { id } });
    await this.audit.record(ctx, { action: 'livestock.delete', entityType: 'Livestock', entityId: id });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Detail tabs
  // ---------------------------------------------------------------------------

  /** Vital Signs tab: averaged series from the ear tag time series. */
  async vitals(ctx: AuthContext, id: string, range: VitalsRange = '24h') {
    await this.assertLivestock(ctx, id);
    const config = RANGE_CONFIG[range] ?? RANGE_CONFIG['24h'];
    const since = new Date(Date.now() - config.hours * 3_600_000);
    const rows = await this.prisma.$queryRaw<
      {
        bucket: Date;
        temperature: number | null;
        heartRate: number | null;
        activity: number | null;
        oxygen: number | null;
        readings: bigint;
      }[]
    >(Prisma.sql`
      SELECT date_trunc(${config.bucket}, "recordedAt") AS bucket,
             AVG("temperature")::float AS "temperature",
             AVG("heartRate")::float   AS "heartRate",
             AVG("activity")::float    AS "activity",
             AVG("oxygen")::float      AS "oxygen",
             COUNT(*)                  AS readings
      FROM "telemetry_readings"
      WHERE "livestockId" = ${id} AND "recordedAt" >= ${since}
      GROUP BY bucket
      ORDER BY bucket ASC`);
    const round = (value: number | null, digits = 0) => (value == null ? null : Number(value.toFixed(digits)));
    return {
      range,
      bucket: config.bucket,
      series: rows.map((row) => ({
        timestamp: row.bucket.toISOString(),
        temperature: round(row.temperature, 2),
        heartRate: round(row.heartRate),
        activity: round(row.activity),
        oxygen: round(row.oxygen),
        readings: Number(row.readings),
      })),
    };
  }

  async locationHistory(ctx: AuthContext, id: string, hours = 24) {
    await this.assertLivestock(ctx, id);
    const since = new Date(Date.now() - Math.min(hours, 24 * 30) * 3_600_000);
    const rows = await this.prisma.telemetryReading.findMany({
      where: { livestockId: id, recordedAt: { gte: since }, latitude: { not: null }, longitude: { not: null } },
      select: { recordedAt: true, latitude: true, longitude: true },
      orderBy: { recordedAt: 'asc' },
      take: 2000,
    });
    return rows.map((row) => ({ lat: row.latitude!, lng: row.longitude!, at: row.recordedAt.toISOString() }));
  }

  async alerts(ctx: AuthContext, id: string) {
    await this.assertLivestock(ctx, id);
    const alerts = await this.prisma.alert.findMany({
      where: { livestockId: id },
      orderBy: { detectedAt: 'desc' },
      take: 50,
    });
    return alerts.map((alert) => ({
      id: alert.id,
      title: asLocalized(alert.title),
      severity: toApiEnum(alert.severity),
      category: toApiEnum(alert.category),
      status: toApiEnum(alert.status),
      detectedAt: alert.detectedAt.toISOString(),
    }));
  }

  async healthRecords(ctx: AuthContext, id: string) {
    await this.assertLivestock(ctx, id);
    const records = await this.prisma.healthRecord.findMany({
      where: { livestockId: id },
      orderBy: { performedAt: 'desc' },
    });
    return records.map((r) => ({
      ...r,
      type: toApiEnum(r.type),
      cost: r.cost ? Number(r.cost) : null,
      performedAt: r.performedAt.toISOString(),
      nextDueAt: r.nextDueAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addHealthRecord(ctx: AuthContext, id: string, dto: HealthRecordDto) {
    await this.assertLivestock(ctx, id);
    const type = fromApiEnum<HealthRecordType>(dto.type);
    const record = await this.prisma.healthRecord.create({
      data: {
        livestockId: id,
        type,
        title: dto.title,
        description: dto.description,
        performedAt: new Date(dto.performedAt),
        performedById: ctx.userId,
        performedByName: dto.performedByName ?? ctx.name,
        vaccineName: dto.vaccineName,
        medication: dto.medication,
        dosage: dto.dosage,
        weightKg: dto.weightKg,
        bodyConditionScore: dto.bodyConditionScore,
        temperature: dto.temperature,
        nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : undefined,
        cost: dto.cost,
      },
    });
    // Records keep the animal's profile current.
    const sideEffects: Prisma.LivestockUpdateInput = {};
    if (type === 'WEIGHING' && dto.weightKg) {
      sideEffects.weightKg = dto.weightKg;
      if (dto.bodyConditionScore) sideEffects.bodyConditionScore = dto.bodyConditionScore;
    }
    if (type === 'VACCINATION') sideEffects.vaccinationStatus = 'UP_TO_DATE';
    if (Object.keys(sideEffects).length) await this.prisma.livestock.update({ where: { id }, data: sideEffects });

    await this.audit.record(ctx, {
      action: 'health-record.create',
      entityType: 'Livestock',
      entityId: id,
      metadata: { recordId: record.id, type: dto.type },
    });
    return { ...record, type: toApiEnum(record.type), cost: record.cost ? Number(record.cost) : null };
  }

  async removeHealthRecord(ctx: AuthContext, recordId: string) {
    const result = await this.prisma.healthRecord.deleteMany({
      where: { id: recordId, livestock: { organizationId: ctx.organizationId } },
    });
    if (!result.count) throw new NotFoundException('Health record not found');
    return { ok: true };
  }

  async weightHistory(ctx: AuthContext, id: string) {
    await this.assertLivestock(ctx, id);
    const rows = await this.prisma.healthRecord.findMany({
      where: { livestockId: id, weightKg: { not: null } },
      select: { performedAt: true, weightKg: true, bodyConditionScore: true },
      orderBy: { performedAt: 'asc' },
    });
    return rows.map((r) => ({
      date: r.performedAt.toISOString().slice(0, 10),
      weightKg: r.weightKg,
      bodyConditionScore: r.bodyConditionScore,
    }));
  }

  /** Activity Timeline tab: alerts, health records, movements and device pairing in one feed. */
  async timeline(ctx: AuthContext, id: string) {
    const animal = await this.assertLivestock(ctx, id);
    const [alerts, records, movements, deviceEvents] = await Promise.all([
      this.prisma.alert.findMany({ where: { livestockId: id }, orderBy: { detectedAt: 'desc' }, take: 30 }),
      this.prisma.healthRecord.findMany({ where: { livestockId: id }, orderBy: { performedAt: 'desc' }, take: 30 }),
      this.prisma.livestockMovement.findMany({ where: { livestockId: id }, orderBy: { movedAt: 'desc' }, take: 30 }),
      animal.deviceId
        ? this.prisma.deviceEvent.findMany({
            where: { deviceId: animal.deviceId, type: { in: ['PAIRED', 'UNPAIRED', 'OFFLINE', 'WARNING'] } },
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
        : Promise.resolve([]),
    ]);
    const barnIds = [...new Set(movements.flatMap((m) => [m.fromBarnId, m.toBarnId]))];
    const barns = new Map(
      (await this.prisma.barn.findMany({ where: { id: { in: barnIds } }, select: { id: true, name: true } })).map(
        (b) => [b.id, b.name],
      ),
    );

    const items = [
      ...alerts.map((a) => ({
        id: a.id,
        type: `alert.${toApiEnum(a.severity)}`,
        label: asLocalized(a.title),
        timestamp: a.detectedAt,
        actor: null as string | null,
      })),
      ...records.map((r) => ({
        id: r.id,
        type: `record.${toApiEnum(r.type)}`,
        label: localized(r.title),
        timestamp: r.performedAt,
        actor: r.performedByName,
      })),
      ...movements.map((m) => ({
        id: m.id,
        type: 'movement',
        label: localized(
          `Dipindah dari ${barns.get(m.fromBarnId) ?? '-'} ke ${barns.get(m.toBarnId) ?? '-'}`,
          `Moved from ${barns.get(m.fromBarnId) ?? '-'} to ${barns.get(m.toBarnId) ?? '-'}`,
        ),
        timestamp: m.movedAt,
        actor: m.movedByName,
      })),
      ...deviceEvents.map((e) => ({
        id: e.id,
        type: `device.${toApiEnum(e.type)}`,
        label: asLocalized(e.message),
        timestamp: e.createdAt,
        actor: null,
      })),
    ];
    return items
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((item) => ({ ...item, timestamp: item.timestamp.toISOString() }));
  }

  /** Distinct values for the list filters (types, breeds, herd groups). */
  async filterOptions(ctx: AuthContext) {
    const [types, breeds, herds] = await Promise.all([
      this.prisma.livestock.findMany({
        where: { organizationId: ctx.organizationId },
        distinct: ['type'],
        select: { type: true },
      }),
      this.prisma.livestock.findMany({
        where: { organizationId: ctx.organizationId },
        distinct: ['breed'],
        select: { breed: true },
      }),
      this.prisma.livestock.findMany({
        where: { organizationId: ctx.organizationId },
        distinct: ['herdGroup'],
        select: { herdGroup: true },
      }),
    ]);
    return {
      types: types.map((t) => t.type).sort(),
      breeds: breeds.map((b) => b.breed).sort(),
      herdGroups: herds.map((h) => h.herdGroup).sort(),
    };
  }

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  private async assertLivestock(ctx: AuthContext, id: string) {
    const animal = await this.prisma.livestock.findFirst({
      where: { id, organizationId: ctx.organizationId },
      select: { id: true, farmId: true, barnId: true, deviceId: true },
    });
    if (!animal) throw new NotFoundException('Livestock not found');
    return animal;
  }

  private async assertBarnInFarm(ctx: AuthContext, farmId: string, barnId: string) {
    const barn = await this.prisma.barn.findFirst({
      where: { id: barnId, farmId, farm: { organizationId: ctx.organizationId } },
    });
    if (!barn) throw new BadRequestException('Barn does not belong to the selected farm');
  }

  private async assertCapacity(barnId: string) {
    const barn = await this.prisma.barn.findUniqueOrThrow({
      where: { id: barnId },
      select: { capacity: true, name: true },
    });
    const occupancy = await this.prisma.livestock.count({ where: { barnId, archived: false } });
    if (occupancy >= barn.capacity) throw new ConflictException(`${barn.name} is at full capacity (${barn.capacity})`);
  }
}
