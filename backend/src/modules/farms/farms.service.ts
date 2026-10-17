import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { FarmStatsService } from './farm-stats.service';
import { serializeBarn, serializeFarm } from '../../common/serializers';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import { isValidPolygon } from '../../domain/geo';
import { thiBand } from '../../domain/environment';
import type { AuthContext } from '../../common/auth-context';
import type { GeofenceType, Prisma } from '../../generated/prisma/client';
import type {
  BarnInputDto,
  CreateFarmDto,
  GeofenceDto,
  UpdateBarnDto,
  UpdateFarmDto,
  UpdateGeofenceDto,
} from './farms.dto';

const managerInclude = { manager: { include: { user: true } } } as const;

@Injectable()
export class FarmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stats: FarmStatsService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Farms
  // ---------------------------------------------------------------------------

  async list(ctx: AuthContext) {
    const farms = await this.prisma.farm.findMany({
      where: { organizationId: ctx.organizationId },
      include: managerInclude,
      orderBy: { createdAt: 'asc' },
    });
    const stats = await this.stats.forFarms(
      ctx.organizationId,
      farms.map((farm) => farm.id),
    );
    return farms.map((farm) => serializeFarm(farm, stats.get(farm.id)!));
  }

  async get(ctx: AuthContext, id: string) {
    const farm = await this.prisma.farm.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: { ...managerInclude, geofences: { orderBy: { createdAt: 'asc' } } },
    });
    if (!farm) throw new NotFoundException('Farm not found');
    const [stats, barns] = await Promise.all([this.stats.forFarms(ctx.organizationId, [id]), this.listBarns(ctx, id)]);
    return {
      ...serializeFarm(farm, stats.get(id)!),
      barns,
      geofences: farm.geofences.map((g) => ({ ...g, type: toApiEnum(g.type) })),
    };
  }

  async create(ctx: AuthContext, dto: CreateFarmDto) {
    await this.assertManager(ctx, dto.managerId);
    const farm = await this.prisma.farm.create({
      data: {
        organizationId: ctx.organizationId,
        name: dto.name,
        location: dto.location,
        region: dto.region,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        areaHectares: dto.areaHectares,
        imageUrl: dto.imageUrl,
        managerId: dto.managerId,
        status: dto.status ? fromApiEnum(dto.status) : 'ACTIVE',
        barns: dto.barns?.length
          ? {
              create: dto.barns.map((barn) => ({
                name: barn.name,
                capacity: barn.capacity,
                managerId: barn.managerId,
              })),
            }
          : undefined,
      },
    });
    await this.audit.record(ctx, {
      action: 'farm.create',
      entityType: 'Farm',
      entityId: farm.id,
      metadata: { name: farm.name },
    });
    return this.get(ctx, farm.id);
  }

  async update(ctx: AuthContext, id: string, dto: UpdateFarmDto) {
    await this.assertFarm(ctx, id);
    await this.assertManager(ctx, dto.managerId);
    await this.prisma.farm.update({
      where: { id },
      data: {
        name: dto.name,
        location: dto.location,
        region: dto.region,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        areaHectares: dto.areaHectares,
        imageUrl: dto.imageUrl,
        managerId: dto.managerId,
        status: dto.status ? fromApiEnum(dto.status) : undefined,
      },
    });
    await this.audit.record(ctx, { action: 'farm.update', entityType: 'Farm', entityId: id });
    return this.get(ctx, id);
  }

  async remove(ctx: AuthContext, id: string) {
    await this.assertFarm(ctx, id);
    const [animals, devices] = await Promise.all([
      this.prisma.livestock.count({ where: { farmId: id } }),
      this.prisma.device.count({ where: { farmId: id } }),
    ]);
    if (animals || devices) {
      throw new ConflictException('Move or remove the livestock and devices of this farm before deleting it');
    }
    await this.prisma.farm.delete({ where: { id } });
    await this.audit.record(ctx, { action: 'farm.delete', entityType: 'Farm', entityId: id });
    return { ok: true };
  }

  /** Climate history and the current Temperature-Humidity Index for the Environment tab. */
  async environment(ctx: AuthContext, farmId: string, hours = 24) {
    await this.assertFarm(ctx, farmId);
    const since = new Date(Date.now() - Math.min(hours, 24 * 90) * 3_600_000);
    const readings = await this.prisma.environmentReading.findMany({
      where: { farmId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { barnId: true, recordedAt: true, temperature: true, humidity: true, thi: true },
    });
    const latest = readings.at(-1);
    return {
      current: latest
        ? {
            temperature: latest.temperature,
            humidity: latest.humidity,
            thi: latest.thi,
            band: thiBand(latest.thi),
            recordedAt: latest.recordedAt.toISOString(),
          }
        : null,
      series: readings.map((r) => ({ ...r, recordedAt: r.recordedAt.toISOString() })),
    };
  }

  /** Recent operational activity for the farm's Activity tab. */
  async activity(ctx: AuthContext, farmId: string) {
    await this.assertFarm(ctx, farmId);
    const [alerts, tasks, movements] = await Promise.all([
      this.prisma.alert.findMany({ where: { farmId }, orderBy: { detectedAt: 'desc' }, take: 15 }),
      this.prisma.task.findMany({ where: { farmId }, orderBy: { updatedAt: 'desc' }, take: 15 }),
      this.prisma.livestockMovement.findMany({
        where: { OR: [{ fromFarmId: farmId }, { toFarmId: farmId }] },
        include: { livestock: { select: { name: true, code: true } } },
        orderBy: { movedAt: 'desc' },
        take: 15,
      }),
    ]);
    const items = [
      ...alerts.map((a) => ({
        id: a.id,
        type: 'alert',
        label: a.title,
        status: toApiEnum(a.status),
        timestamp: a.detectedAt,
      })),
      ...tasks.map((t) => ({
        id: t.id,
        type: 'task',
        label: t.title ?? t.titleKey,
        status: t.done ? 'done' : 'open',
        timestamp: t.updatedAt,
      })),
      ...movements.map((m) => ({
        id: m.id,
        type: 'movement',
        label: `${m.livestock.code} ${m.livestock.name}`,
        status: m.toFarmId === farmId ? 'in' : 'out',
        timestamp: m.movedAt,
        actor: m.movedByName,
      })),
    ];
    return items
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 30)
      .map((item) => ({ ...item, timestamp: item.timestamp.toISOString() }));
  }

  // ---------------------------------------------------------------------------
  // Barns
  // ---------------------------------------------------------------------------

  async listBarns(ctx: AuthContext, farmId?: string) {
    const barns = await this.prisma.barn.findMany({
      where: { farm: { organizationId: ctx.organizationId }, ...(farmId ? { farmId } : {}) },
      include: managerInclude,
      orderBy: [{ farmId: 'asc' }, { name: 'asc' }],
    });
    const stats = await this.stats.forBarns(barns.map((barn) => barn.id));
    return barns.map((barn) => serializeBarn(barn, stats.get(barn.id)!));
  }

  async createBarn(ctx: AuthContext, farmId: string, dto: BarnInputDto) {
    await this.assertFarm(ctx, farmId);
    await this.assertManager(ctx, dto.managerId);
    const barn = await this.prisma.barn.create({
      data: { farmId, name: dto.name, capacity: dto.capacity, managerId: dto.managerId },
    });
    await this.audit.record(ctx, {
      action: 'barn.create',
      entityType: 'Barn',
      entityId: barn.id,
      metadata: { farmId },
    });
    return (await this.listBarns(ctx, farmId)).find((b) => b.id === barn.id);
  }

  async updateBarn(ctx: AuthContext, id: string, dto: UpdateBarnDto) {
    const barn = await this.assertBarn(ctx, id);
    await this.assertManager(ctx, dto.managerId);
    if (dto.capacity != null) {
      const occupancy = await this.prisma.livestock.count({ where: { barnId: id, archived: false } });
      if (dto.capacity < occupancy)
        throw new BadRequestException(`Capacity cannot be lower than the current occupancy (${occupancy})`);
    }
    await this.prisma.barn.update({
      where: { id },
      data: { name: dto.name, capacity: dto.capacity, managerId: dto.managerId },
    });
    return (await this.listBarns(ctx, barn.farmId)).find((b) => b.id === id);
  }

  async removeBarn(ctx: AuthContext, id: string) {
    await this.assertBarn(ctx, id);
    const animals = await this.prisma.livestock.count({ where: { barnId: id } });
    if (animals) throw new ConflictException('Move the livestock out of this barn before deleting it');
    await this.prisma.barn.delete({ where: { id } });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Geofences
  // ---------------------------------------------------------------------------

  async listGeofences(ctx: AuthContext, farmId?: string) {
    const geofences = await this.prisma.geofence.findMany({
      where: { farm: { organizationId: ctx.organizationId }, ...(farmId ? { farmId } : {}) },
      orderBy: { createdAt: 'asc' },
    });
    return geofences.map((g) => ({ ...g, type: toApiEnum(g.type) }));
  }

  async createGeofence(ctx: AuthContext, farmId: string, dto: GeofenceDto) {
    await this.assertFarm(ctx, farmId);
    if (!isValidPolygon(dto.polygon))
      throw new BadRequestException('Polygon must contain at least three valid [lat, lng] pairs');
    const geofence = await this.prisma.geofence.create({
      data: {
        farmId,
        name: dto.name,
        type: fromApiEnum<GeofenceType>(dto.type ?? 'boundary'),
        polygon: dto.polygon as Prisma.InputJsonValue,
        active: dto.active ?? true,
      },
    });
    return { ...geofence, type: toApiEnum(geofence.type) };
  }

  async updateGeofence(ctx: AuthContext, id: string, dto: UpdateGeofenceDto) {
    const existing = await this.prisma.geofence.findFirst({
      where: { id, farm: { organizationId: ctx.organizationId } },
    });
    if (!existing) throw new NotFoundException('Geofence not found');
    if (dto.polygon && !isValidPolygon(dto.polygon)) throw new BadRequestException('Invalid polygon');
    const geofence = await this.prisma.geofence.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type ? fromApiEnum<GeofenceType>(dto.type) : undefined,
        polygon: dto.polygon as Prisma.InputJsonValue | undefined,
        active: dto.active,
      },
    });
    return { ...geofence, type: toApiEnum(geofence.type) };
  }

  async removeGeofence(ctx: AuthContext, id: string) {
    const result = await this.prisma.geofence.deleteMany({
      where: { id, farm: { organizationId: ctx.organizationId } },
    });
    if (!result.count) throw new NotFoundException('Geofence not found');
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  async assertFarm(ctx: Pick<AuthContext, 'organizationId'>, id: string) {
    const farm = await this.prisma.farm.findFirst({
      where: { id, organizationId: ctx.organizationId },
      select: { id: true },
    });
    if (!farm) throw new NotFoundException('Farm not found');
    return farm;
  }

  async assertBarn(ctx: Pick<AuthContext, 'organizationId'>, id: string) {
    const barn = await this.prisma.barn.findFirst({
      where: { id, farm: { organizationId: ctx.organizationId } },
      select: { id: true, farmId: true, capacity: true },
    });
    if (!barn) throw new NotFoundException('Barn not found');
    return barn;
  }

  private async assertManager(ctx: AuthContext, membershipId?: string) {
    if (!membershipId) return;
    const member = await this.prisma.membership.count({
      where: { id: membershipId, organizationId: ctx.organizationId },
    });
    if (!member) throw new BadRequestException('Manager must be a member of this organization');
  }
}
