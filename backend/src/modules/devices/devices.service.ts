import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PairingService } from './pairing.service';
import { Events } from '../../common/events';
import { paginate, skipTake } from '../../common/dto/pagination.dto';
import { serializeDevice } from '../../common/serializers';
import { randomToken, sha256 } from '../../common/utils/crypto';
import { fromApiEnum, toApiEnum } from '../../common/utils/enums';
import type { AuthContext } from '../../common/auth-context';
import type {
  DeviceCommandType,
  DeviceEventType,
  DeviceStatus,
  DeviceType,
  Prisma,
} from '../../generated/prisma/client';
import type { CommandDto, CreateDeviceDto, DeviceQueryDto, UpdateDeviceDto } from './devices.dto';
import { compareVersions, LATEST_EAR_TAG_FIRMWARE } from '../../domain/firmware';

const COMMAND_TTL_MS = 24 * 3_600_000;
const detailInclude = {
  assignedLivestock: { select: { id: true, name: true, code: true } },
  events: { orderBy: { createdAt: 'desc' }, take: 50 },
  maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
} satisfies Prisma.DeviceInclude;

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pairing: PairingService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async list(ctx: AuthContext, query: DeviceQueryDto) {
    const where: Prisma.DeviceWhereInput = {
      organizationId: ctx.organizationId,
      type: query.type ? fromApiEnum<DeviceType>(query.type) : undefined,
      status: query.status ? fromApiEnum<DeviceStatus>(query.status) : undefined,
      farmId: query.farmId,
      ...(query.assignment === 'assigned' ? { assignedLivestock: { isNot: null } } : {}),
      ...(query.assignment === 'unassigned' ? { assignedLivestock: { is: null }, type: 'EAR_TAG' } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { serial: { contains: query.search, mode: 'insensitive' } },
              { devEui: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        include: { assignedLivestock: { select: { id: true } } },
        orderBy: [{ type: 'asc' }, { serial: query.sortOrder }],
        ...skipTake(query),
      }),
      this.prisma.device.count({ where }),
    ]);
    return paginate(rows.map(serializeDevice), total, query);
  }

  async stats(ctx: AuthContext, farmId?: string) {
    const where = { organizationId: ctx.organizationId, ...(farmId ? { farmId } : {}) };
    const [byStatus, byType, aggregates] = await Promise.all([
      this.prisma.device.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.device.groupBy({ by: ['type'], where, _count: { _all: true } }),
      this.prisma.device.aggregate({
        where,
        _avg: { battery: true, signal: true, uptime: true },
        _sum: { dataPackets: true },
        _count: true,
      }),
    ]);
    return {
      total: aggregates._count,
      byStatus: Object.fromEntries(byStatus.map((row) => [toApiEnum(row.status), row._count._all])),
      byType: Object.fromEntries(byType.map((row) => [toApiEnum(row.type), row._count._all])),
      averageBattery: Math.round(aggregates._avg.battery ?? 0),
      averageSignal: Math.round(aggregates._avg.signal ?? 0),
      averageUptime: Math.round((aggregates._avg.uptime ?? 0) * 10) / 10,
      dataPackets: aggregates._sum.dataPackets ?? 0,
    };
  }

  async get(ctx: AuthContext, id: string) {
    const device = await this.prisma.device.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: detailInclude,
    });
    if (!device) throw new NotFoundException('Device not found');
    return { ...serializeDevice(device), assignedLivestock: device.assignedLivestock };
  }

  async create(ctx: AuthContext, dto: CreateDeviceDto) {
    await this.assertFarm(ctx, dto.farmId, dto.barnId);
    const type = fromApiEnum<DeviceType>(dto.type);
    const apiKey = type === 'GATEWAY' ? `trv_gw_${randomToken(32)}` : null;
    const device = await this.prisma.device.create({
      data: {
        organizationId: ctx.organizationId,
        farmId: dto.farmId,
        barnId: dto.barnId,
        serial: dto.serial.trim().toUpperCase(),
        devEui: dto.devEui?.toUpperCase(),
        name: dto.name,
        type,
        firmware: dto.firmware ?? 'v1.0.0',
        reportInterval: dto.reportInterval ?? 300,
        latitude: dto.latitude,
        longitude: dto.longitude,
        battery: 100,
        apiKeyHash: apiKey ? sha256(apiKey) : null,
        status: 'OFFLINE',
        events: {
          create: {
            type: 'CONNECTED',
            message: { id: 'Perangkat didaftarkan ke Terrava.', en: 'Device registered with Terrava.' },
            metadata: { by: ctx.name },
          },
        },
      },
    });
    await this.audit.record(ctx, {
      action: 'device.create',
      entityType: 'Device',
      entityId: device.id,
      metadata: { serial: device.serial },
    });
    return { device: await this.get(ctx, device.id), apiKey };
  }

  async update(ctx: AuthContext, id: string, dto: UpdateDeviceDto) {
    await this.assertDevice(ctx, id);
    if (dto.farmId) await this.assertFarm(ctx, dto.farmId, dto.barnId);
    await this.prisma.device.update({
      where: { id },
      data: {
        name: dto.name,
        farmId: dto.farmId,
        barnId: dto.barnId,
        devEui: dto.devEui?.toUpperCase(),
        firmware: dto.firmware,
        reportInterval: dto.reportInterval,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return this.get(ctx, id);
  }

  async remove(ctx: AuthContext, id: string) {
    await this.assertDevice(ctx, id);
    await this.pairing.unpairDevice(ctx, id);
    await this.prisma.device.delete({ where: { id } });
    await this.audit.record(ctx, { action: 'device.delete', entityType: 'Device', entityId: id });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Operations from the device detail page
  // ---------------------------------------------------------------------------

  async restart(ctx: AuthContext, id: string) {
    await this.assertDevice(ctx, id);
    const command = await this.queueCommand(ctx, id, 'RESTART');
    await this.logEvent(
      id,
      'RESTARTED',
      { id: 'Perintah restart dikirim ke perangkat.', en: 'Restart command sent to the device.' },
      { by: ctx.name },
    );
    return { command, device: await this.get(ctx, id) };
  }

  /**
   * Runs diagnostics from the data we already hold (packet delivery, link
   * quality, battery drain) and queues an on-device self-test.
   */
  async diagnostics(ctx: AuthContext, id: string) {
    const device = await this.assertDevice(ctx, id);
    const since = new Date(Date.now() - 24 * 3_600_000);
    const readings = await this.prisma.telemetryReading.findMany({
      where: { deviceId: id, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { recordedAt: true, battery: true, rssi: true, snr: true },
    });

    const expected = Math.max(1, Math.floor((24 * 3600) / device.reportInterval));
    const delivery = device.type === 'GATEWAY' ? 100 : Math.min(100, Math.round((readings.length / expected) * 100));
    const avg = (values: (number | null)[]) => {
      const nums = values.filter((v): v is number => v != null);
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    };
    const avgRssi = avg(readings.map((r) => r.rssi));
    const avgSnr = avg(readings.map((r) => r.snr));
    const firstBattery = readings.find((r) => r.battery != null)?.battery ?? device.battery;
    const lastBattery = [...readings].reverse().find((r) => r.battery != null)?.battery ?? device.battery;
    const drainPerDay = Math.max(0, firstBattery - lastBattery);
    const daysRemaining = drainPerDay > 0 ? Math.round(lastBattery / drainPerDay) : null;

    const checks = [
      { key: 'connectivity', ok: device.status !== 'OFFLINE', value: toApiEnum(device.status) },
      { key: 'packetDelivery', ok: delivery >= 80, value: `${delivery}%` },
      {
        key: 'signal',
        ok: device.signal >= 40,
        value: `${device.signal}%${avgRssi != null ? ` (RSSI ${Math.round(avgRssi)} dBm)` : ''}`,
      },
      { key: 'battery', ok: device.battery > 20, value: `${device.battery}%` },
      {
        key: 'firmware',
        ok: device.type !== 'EAR_TAG' || compareVersions(device.firmware, LATEST_EAR_TAG_FIRMWARE) >= 0,
        value: device.firmware,
      },
    ];
    const healthy = checks.every((check) => check.ok);

    const report = {
      deviceId: id,
      ranAt: new Date().toISOString(),
      healthy,
      checks,
      metrics: {
        readings24h: readings.length,
        expectedReadings24h: expected,
        packetDelivery: delivery,
        averageRssi: avgRssi != null ? Math.round(avgRssi) : null,
        averageSnr: avgSnr != null ? Math.round(avgSnr * 10) / 10 : null,
        batteryDrainPerDay: drainPerDay,
        estimatedDaysRemaining: daysRemaining,
      },
    };

    await this.queueCommand(ctx, id, 'RUN_DIAGNOSTICS');
    await this.logEvent(
      id,
      healthy ? 'DIAGNOSTICS' : 'WARNING',
      healthy
        ? { id: 'Diagnostik selesai: semua pemeriksaan lulus.', en: 'Diagnostics complete: all checks passed.' }
        : {
            id: 'Diagnostik menemukan masalah yang perlu ditindaklanjuti.',
            en: 'Diagnostics found issues that need attention.',
          },
      { by: ctx.name, report } as unknown as Prisma.InputJsonValue,
    );
    return report;
  }

  async startMaintenance(ctx: AuthContext, id: string, note?: string) {
    await this.assertDevice(ctx, id);
    await this.prisma.$transaction([
      this.prisma.device.update({ where: { id }, data: { status: 'MAINTENANCE' } }),
      this.prisma.maintenanceLog.create({
        data: { deviceId: id, note: note || 'Maintenance started', byName: ctx.name },
      }),
    ]);
    await this.logEvent(
      id,
      'MAINTENANCE_STARTED',
      { id: 'Perangkat masuk mode perawatan.', en: 'Device entered maintenance mode.' },
      { by: ctx.name },
    );
    return this.emitAndGet(ctx, id);
  }

  async endMaintenance(ctx: AuthContext, id: string, note?: string) {
    const device = await this.assertDevice(ctx, id);
    if (device.status !== 'MAINTENANCE') throw new BadRequestException('Device is not in maintenance');
    const recentlySeen = device.lastSyncAt && Date.now() - device.lastSyncAt.getTime() < 2 * 3_600_000;
    await this.prisma.$transaction([
      this.prisma.device.update({ where: { id }, data: { status: recentlySeen ? 'ONLINE' : 'OFFLINE' } }),
      this.prisma.maintenanceLog.create({
        data: { deviceId: id, note: note || 'Maintenance completed', byName: ctx.name },
      }),
    ]);
    await this.logEvent(
      id,
      'MAINTENANCE_ENDED',
      { id: 'Perawatan selesai, perangkat kembali beroperasi.', en: 'Maintenance finished; device back in service.' },
      { by: ctx.name },
    );
    return this.emitAndGet(ctx, id);
  }

  async addMaintenanceLog(ctx: AuthContext, id: string, note: string) {
    await this.assertDevice(ctx, id);
    if (!note?.trim()) throw new BadRequestException('Note is required');
    await this.prisma.maintenanceLog.create({ data: { deviceId: id, note: note.trim(), byName: ctx.name } });
    return this.get(ctx, id);
  }

  async assign(ctx: AuthContext, id: string, livestockId: string | null | undefined) {
    await this.assertDevice(ctx, id);
    if (livestockId) await this.pairing.pair(ctx, livestockId, id);
    else await this.pairing.unpairDevice(ctx, id);
    return this.get(ctx, id);
  }

  /** Issue (or rotate) the API key a gateway uses to push telemetry. Shown once. */
  async rotateApiKey(ctx: AuthContext, id: string) {
    const device = await this.assertDevice(ctx, id);
    if (device.type !== 'GATEWAY') throw new BadRequestException('API keys are only issued to gateways');
    const apiKey = `trv_gw_${randomToken(32)}`;
    await this.prisma.device.update({ where: { id }, data: { apiKeyHash: sha256(apiKey) } });
    await this.audit.record(ctx, { action: 'device.api-key.rotate', entityType: 'Device', entityId: id });
    return { apiKey, note: 'Store this key on the gateway now. It will not be shown again.' };
  }

  async sendCommand(ctx: AuthContext, id: string, dto: CommandDto) {
    await this.assertDevice(ctx, id);
    const type = fromApiEnum<DeviceCommandType>(dto.type);
    if (type === 'SET_INTERVAL') {
      const interval = Number(dto.payload?.interval);
      if (!Number.isInteger(interval) || interval < 30 || interval > 86_400) {
        throw new BadRequestException('payload.interval must be an integer between 30 and 86400 seconds');
      }
    }
    if (type === 'FIRMWARE_UPDATE' && typeof dto.payload?.version !== 'string') {
      throw new BadRequestException('payload.version is required for firmware updates');
    }
    return this.queueCommand(ctx, id, type, dto.payload as Prisma.InputJsonValue | undefined);
  }

  async listCommands(ctx: AuthContext, id: string) {
    await this.assertDevice(ctx, id);
    const commands = await this.prisma.deviceCommand.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return commands.map((c) => ({ ...c, type: toApiEnum(c.type), status: toApiEnum(c.status) }));
  }

  async listEvents(ctx: AuthContext, id: string, take = 100) {
    await this.assertDevice(ctx, id);
    const events = await this.prisma.deviceEvent.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 500),
    });
    return events.map((event) => ({
      id: event.id,
      type: toApiEnum(event.type),
      message: event.message,
      metadata: event.metadata,
      at: event.createdAt.toISOString(),
    }));
  }

  /** Raw sensor readings for the Sensor Data tab. */
  async readings(ctx: AuthContext, id: string, hours = 24) {
    await this.assertDevice(ctx, id);
    const since = new Date(Date.now() - Math.min(hours, 24 * 30) * 3_600_000);
    const device = await this.prisma.device.findUniqueOrThrow({ where: { id }, select: { type: true } });
    if (device.type === 'ENVIRONMENTAL_SENSOR') {
      const rows = await this.prisma.environmentReading.findMany({
        where: { deviceId: id, recordedAt: { gte: since } },
        orderBy: { recordedAt: 'asc' },
        take: 5000,
      });
      return rows.map((row) => ({ ...row, id: row.id.toString(), recordedAt: row.recordedAt.toISOString() }));
    }
    const rows = await this.prisma.telemetryReading.findMany({
      where: { deviceId: id, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      take: 5000,
    });
    return rows.map((row) => ({
      ...row,
      id: row.id.toString(),
      recordedAt: row.recordedAt.toISOString(),
      receivedAt: row.receivedAt.toISOString(),
    }));
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async queueCommand(
    ctx: AuthContext,
    deviceId: string,
    type: DeviceCommandType,
    payload?: Prisma.InputJsonValue,
  ) {
    // A newer command of the same type supersedes any still-pending one.
    await this.prisma.deviceCommand.updateMany({
      where: { deviceId, type, status: 'PENDING' },
      data: { status: 'EXPIRED' },
    });
    const command = await this.prisma.deviceCommand.create({
      data: { deviceId, type, payload, requestedBy: ctx.name, expiresAt: new Date(Date.now() + COMMAND_TTL_MS) },
    });
    return { ...command, type: toApiEnum(command.type), status: toApiEnum(command.status) };
  }

  private async logEvent(
    deviceId: string,
    type: DeviceEventType,
    message: { id: string; en: string },
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.deviceEvent.create({ data: { deviceId, type, message, metadata } });
  }

  private async emitAndGet(ctx: AuthContext, id: string) {
    const device = await this.get(ctx, id);
    this.events.emit(Events.DeviceUpdated, { organizationId: ctx.organizationId, payload: device });
    return device;
  }

  private async assertDevice(ctx: AuthContext, id: string) {
    const device = await this.prisma.device.findFirst({ where: { id, organizationId: ctx.organizationId } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  private async assertFarm(ctx: AuthContext, farmId: string, barnId?: string) {
    const farm = await this.prisma.farm.count({ where: { id: farmId, organizationId: ctx.organizationId } });
    if (!farm) throw new BadRequestException('Farm not found in this organization');
    if (barnId) {
      const barn = await this.prisma.barn.count({ where: { id: barnId, farmId } });
      if (!barn) throw new BadRequestException('Barn does not belong to that farm');
    }
  }
}
