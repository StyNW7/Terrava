import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { Events } from '../../common/events';
import { toApiEnum } from '../../common/utils/enums';
import { evaluateEnvironment, evaluateReading, type AlertCandidate } from '../../domain/alert-rules';
import { signalQuality, temperatureHumidityIndex } from '../../domain/environment';
import { pointInPolygon, type LatLng } from '../../domain/geo';
import { assessHealth, smoothScore } from '../../domain/health-scoring';
import type { AlertThresholds } from '../../domain/thresholds';
import type { Device, DeviceStatus, Prisma } from '../../generated/prisma/client';
import { readThresholds } from '../settings/settings.schema';
import type { DeviceContext } from '../../common/auth-context';
import type { EnvironmentReadingDto, TelemetryReadingDto } from './telemetry.dto';

/** Rules that clear on their own when a later reading is back in range. */
const AUTO_RESOLVABLE = [
  'tempHigh',
  'tempLow',
  'heartRate',
  'oxygenLow',
  'batteryLow',
  'signalWeak',
  'geofence',
  'activityDrop',
];

export interface IngestResult {
  accepted: number;
  duplicates: number;
  rejected: { index: number; reason: string }[];
  alertsRaised: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Telemetry pipeline: persist -> update device -> refresh the animal's live
 * snapshot and health score -> evaluate rules -> raise / auto-resolve alerts ->
 * broadcast to the dashboard.
 *
 * Short-lived caches (thresholds, geofences, activity baselines) keep the
 * per-reading cost to a handful of queries. They are per-process; move them to
 * Redis when running several API replicas.
 */
@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly thresholdCache = new Map<string, CacheEntry<AlertThresholds>>();
  private readonly geofenceCache = new Map<string, CacheEntry<LatLng[][]>>();
  private readonly baselineCache = new Map<string, CacheEntry<number | null>>();
  /** When each animal was first seen outside every geofence. */
  private readonly outsideSince = new Map<string, Date>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
    private readonly events: EventEmitter2,
  ) {}

  // ---------------------------------------------------------------------------
  // Ear tag readings
  // ---------------------------------------------------------------------------

  async ingest(gateway: DeviceContext, readings: TelemetryReadingDto[]): Promise<IngestResult> {
    const result: IngestResult = { accepted: 0, duplicates: 0, rejected: [], alertsRaised: 0 };
    const thresholds = await this.thresholds(gateway.organizationId);

    // Resolve every referenced device in one query.
    const serials = readings.map((r) => r.deviceSerial?.toUpperCase()).filter((v): v is string => Boolean(v));
    const euis = readings.map((r) => r.devEui?.toUpperCase()).filter((v): v is string => Boolean(v));
    const devices = await this.prisma.device.findMany({
      where: { organizationId: gateway.organizationId, OR: [{ serial: { in: serials } }, { devEui: { in: euis } }] },
      include: { assignedLivestock: true },
    });
    const bySerial = new Map(devices.map((d) => [d.serial, d]));
    const byEui = new Map(devices.filter((d) => d.devEui).map((d) => [d.devEui!, d]));

    for (const [index, reading] of readings.entries()) {
      const device =
        (reading.deviceSerial && bySerial.get(reading.deviceSerial.toUpperCase())) ||
        (reading.devEui && byEui.get(reading.devEui.toUpperCase()));
      if (!device) {
        result.rejected.push({ index, reason: 'Unknown device for this organization' });
        continue;
      }
      if (device.type !== 'EAR_TAG') {
        result.rejected.push({
          index,
          reason: 'Only ear tags send vital-sign telemetry; use /ingest/environment for sensors',
        });
        continue;
      }
      try {
        const outcome = await this.processReading(gateway, device, reading, thresholds);
        if (outcome === 'duplicate') result.duplicates += 1;
        else {
          result.accepted += 1;
          result.alertsRaised += outcome.alertsRaised;
        }
      } catch (error) {
        this.logger.error(`Reading ${index} from ${device.serial} failed: ${(error as Error).message}`);
        result.rejected.push({ index, reason: 'Processing error' });
      }
    }
    await this.touchGateway(gateway.gatewayId, result.accepted);
    return result;
  }

  private async processReading(
    gateway: DeviceContext,
    device: Device & { assignedLivestock: Prisma.LivestockGetPayload<object> | null },
    reading: TelemetryReadingDto,
    thresholds: AlertThresholds,
  ): Promise<'duplicate' | { alertsRaised: number }> {
    const recordedAt = reading.recordedAt ? new Date(reading.recordedAt) : new Date();
    const animal = device.assignedLivestock;

    // skipDuplicates turns a replayed uplink (same device, frame counter and time) into a no-op.
    const inserted = await this.prisma.telemetryReading.createMany({
      skipDuplicates: true,
      data: {
        deviceId: device.id,
        livestockId: animal?.id,
        recordedAt,
        sequence: reading.sequence,
        temperature: reading.temperature,
        heartRate: reading.heartRate,
        oxygen: reading.oxygen,
        activity: reading.activity,
        steps: reading.steps,
        latitude: reading.latitude,
        longitude: reading.longitude,
        battery: reading.battery,
        rssi: reading.rssi,
        snr: reading.snr,
      },
    });
    if (inserted.count === 0) return 'duplicate';

    // --- Device state --------------------------------------------------------
    const signal = reading.rssi != null ? signalQuality(reading.rssi, reading.snr) : device.signal;
    const battery = reading.battery ?? device.battery;
    const nextStatus: DeviceStatus =
      device.status === 'MAINTENANCE' ? 'MAINTENANCE' : battery <= thresholds.batteryLow ? 'LOW_BATTERY' : 'ONLINE';
    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        lastSyncAt: recordedAt > (device.lastSyncAt ?? new Date(0)) ? recordedAt : undefined,
        battery,
        signal,
        rssi: reading.rssi,
        snr: reading.snr,
        firmware: reading.firmware,
        dataPackets: { increment: 1 },
        status: nextStatus,
      },
    });
    if (device.status === 'OFFLINE') {
      await this.prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          type: 'CONNECTED',
          message: { id: 'Koneksi LoRa dipulihkan.', en: 'LoRa connection restored.' },
        },
      });
      await this.alerts.autoResolve(gateway.organizationId, { deviceId: device.id }, ['deviceOffline']);
    }
    if (device.status !== nextStatus) {
      this.events.emit(Events.DeviceUpdated, {
        organizationId: gateway.organizationId,
        payload: { id: device.id, status: toApiEnum(nextStatus), battery, signal },
      });
    }

    // --- Device-only rules (no wearer) -------------------------------------
    if (!animal) {
      const candidates = evaluateReading({ battery, signal }, { thresholds, hasDevice: true });
      return {
        alertsRaised: await this.applyRules(
          gateway.organizationId,
          device.farmId,
          null,
          device.id,
          candidates,
          reading,
        ),
      };
    }

    // --- Animal snapshot and health ------------------------------------------
    const vitals = {
      temperature: reading.temperature ?? animal.temperature,
      heartRate: reading.heartRate ?? animal.heartRate,
      oxygen: reading.oxygen ?? animal.oxygenLevel,
      activity: reading.activity ?? animal.activityLevel,
    };
    const assessment = assessHealth(vitals);
    const healthScore = smoothScore(animal.healthScore, assessment.score);
    const healthStatus = healthScore >= 80 ? 'HEALTHY' : healthScore >= 58 ? 'ATTENTION' : 'CRITICAL';

    await this.prisma.livestock.update({
      where: { id: animal.id },
      data: {
        temperature: vitals.temperature,
        heartRate: vitals.heartRate,
        oxygenLevel: vitals.oxygen,
        activityLevel: vitals.activity,
        latitude: reading.latitude ?? undefined,
        longitude: reading.longitude ?? undefined,
        lastReadingAt: recordedAt,
        healthScore,
        healthStatus,
      },
    });

    // --- Rules -------------------------------------------------------------------
    const minutesOutside =
      reading.latitude != null && reading.longitude != null
        ? await this.minutesOutsideGeofence(animal.id, animal.farmId, [reading.latitude, reading.longitude], recordedAt)
        : null;
    const candidates = evaluateReading(
      { ...vitals, battery, signal },
      {
        thresholds,
        activityBaseline: await this.activityBaseline(animal.id),
        minutesOutsideGeofence: minutesOutside,
        hasDevice: true,
      },
    );
    const alertsRaised = await this.applyRules(
      gateway.organizationId,
      animal.farmId,
      animal,
      device.id,
      candidates,
      reading,
    );

    // --- Broadcast -------------------------------------------------------------
    this.events.emit(Events.TelemetryReceived, {
      organizationId: gateway.organizationId,
      payload: {
        livestockId: animal.id,
        deviceId: device.id,
        recordedAt: recordedAt.toISOString(),
        temperature: vitals.temperature,
        heartRate: vitals.heartRate,
        activity: vitals.activity,
        oxygen: vitals.oxygen,
        battery,
        signal,
        location:
          reading.latitude != null && reading.longitude != null
            ? { lat: reading.latitude, lng: reading.longitude }
            : null,
        healthScore,
        healthStatus: toApiEnum(healthStatus),
        breaches: candidates.map((c) => c.ruleKey),
      },
    });
    if (healthStatus !== animal.healthStatus) {
      this.events.emit(Events.LivestockUpdated, {
        organizationId: gateway.organizationId,
        payload: { id: animal.id, healthStatus: toApiEnum(healthStatus), healthScore },
      });
    }
    return { alertsRaised };
  }

  private async applyRules(
    organizationId: string,
    farmId: string,
    animal: { id: string; barnId: string } | null,
    deviceId: string,
    candidates: AlertCandidate[],
    reading: TelemetryReadingDto,
  ) {
    let raised = 0;
    const dataAtDetection = {
      temperature: reading.temperature ?? 0,
      heartRate: reading.heartRate ?? 0,
      activity: reading.activity ?? 0,
      oxygen: reading.oxygen ?? 0,
    };
    for (const candidate of candidates) {
      const isDeviceRule = candidate.category === 'DEVICE';
      const outcome = await this.alerts.raise(candidate, {
        organizationId,
        farmId,
        barnId: animal?.barnId,
        livestockId: isDeviceRule ? null : animal?.id,
        deviceId,
        dataAtDetection,
        detectedAt: reading.recordedAt ? new Date(reading.recordedAt) : undefined,
      });
      if (outcome.created) raised += 1;
    }
    const firing = new Set(candidates.map((c) => c.ruleKey));
    const cleared = AUTO_RESOLVABLE.filter((key) => !firing.has(key));
    const animalRules = cleared.filter((k) => k !== 'batteryLow' && k !== 'signalWeak');
    const deviceRules = cleared.filter((k) => k === 'batteryLow' || k === 'signalWeak');
    const asOf = reading.recordedAt ? new Date(reading.recordedAt) : new Date();
    if (animal) await this.alerts.autoResolve(organizationId, { livestockId: animal.id }, animalRules, asOf);
    await this.alerts.autoResolve(organizationId, { deviceId }, deviceRules, asOf);
    return raised;
  }

  // ---------------------------------------------------------------------------
  // Environmental sensors
  // ---------------------------------------------------------------------------

  async ingestEnvironment(gateway: DeviceContext, readings: EnvironmentReadingDto[]) {
    const result: IngestResult = { accepted: 0, duplicates: 0, rejected: [], alertsRaised: 0 };
    const devices = await this.prisma.device.findMany({
      where: {
        organizationId: gateway.organizationId,
        serial: { in: readings.map((r) => r.deviceSerial.toUpperCase()) },
      },
    });
    const bySerial = new Map(devices.map((d) => [d.serial, d]));

    for (const [index, reading] of readings.entries()) {
      const device = bySerial.get(reading.deviceSerial.toUpperCase());
      if (!device || device.type !== 'ENVIRONMENTAL_SENSOR') {
        result.rejected.push({ index, reason: 'Unknown environmental sensor' });
        continue;
      }
      const recordedAt = reading.recordedAt ? new Date(reading.recordedAt) : new Date();
      const thi = temperatureHumidityIndex(reading.temperature, reading.humidity);
      await this.prisma.environmentReading.create({
        data: {
          farmId: device.farmId,
          barnId: device.barnId,
          deviceId: device.id,
          recordedAt,
          temperature: reading.temperature,
          humidity: reading.humidity,
          thi,
        },
      });
      await this.prisma.device.update({
        where: { id: device.id },
        data: {
          lastSyncAt: recordedAt,
          battery: reading.battery,
          rssi: reading.rssi,
          snr: reading.snr,
          signal: reading.rssi != null ? signalQuality(reading.rssi, reading.snr) : undefined,
          dataPackets: { increment: 1 },
          status:
            device.status === 'MAINTENANCE'
              ? 'MAINTENANCE'
              : (reading.battery ?? device.battery) <= 20
                ? 'LOW_BATTERY'
                : 'ONLINE',
        },
      });
      result.accepted += 1;

      const candidate = evaluateEnvironment(thi, reading.temperature, reading.humidity);
      if (candidate) {
        const outcome = await this.alerts.raise(candidate, {
          organizationId: gateway.organizationId,
          farmId: device.farmId,
          barnId: device.barnId,
          deviceId: device.id,
          dataAtDetection: { temperature: reading.temperature, heartRate: 0, activity: 0, oxygen: 0 },
          detectedAt: recordedAt,
        });
        if (outcome.created) result.alertsRaised += 1;
      } else if (device.barnId) {
        await this.alerts.autoResolve(gateway.organizationId, { barnId: device.barnId }, ['heatStress'], recordedAt);
      }
      this.events.emit(Events.EnvironmentReceived, {
        organizationId: gateway.organizationId,
        payload: {
          farmId: device.farmId,
          barnId: device.barnId,
          temperature: reading.temperature,
          humidity: reading.humidity,
          thi,
          recordedAt: recordedAt.toISOString(),
        },
      });
    }
    await this.touchGateway(gateway.gatewayId, result.accepted);
    return result;
  }

  // ---------------------------------------------------------------------------
  // Gateway bookkeeping and downlink commands
  // ---------------------------------------------------------------------------

  async heartbeat(
    gateway: DeviceContext,
    body: { firmware?: string; rssi?: number; uptimeSeconds?: number; packetsForwarded?: number },
  ) {
    const device = await this.prisma.device.findUniqueOrThrow({ where: { id: gateway.gatewayId } });
    await this.prisma.device.update({
      where: { id: gateway.gatewayId },
      data: {
        lastSyncAt: new Date(),
        status: device.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'ONLINE',
        firmware: body.firmware,
        rssi: body.rssi,
        signal: body.rssi != null ? signalQuality(body.rssi) : undefined,
      },
    });
    if (device.status === 'OFFLINE') {
      await this.prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          type: 'CONNECTED',
          message: { id: 'Gateway kembali online.', en: 'Gateway is back online.' },
          metadata: body,
        },
      });
      await this.alerts.autoResolve(gateway.organizationId, { deviceId: device.id }, ['deviceOffline']);
    }
    return { ok: true, serverTime: new Date().toISOString() };
  }

  /**
   * Pending downlinks; marks them as sent. `organization` scope suits LoRaWAN
   * bridges (the network server reaches every tag); `farm` scope suits a P2P
   * gateway that only covers its own farm.
   */
  async pullCommands(gateway: DeviceContext, scope: 'organization' | 'farm' = 'organization') {
    const commands = await this.prisma.deviceCommand.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { gt: new Date() },
        device: { organizationId: gateway.organizationId, ...(scope === 'farm' ? { farmId: gateway.farmId } : {}) },
      },
      include: { device: { select: { serial: true, devEui: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    if (commands.length) {
      await this.prisma.deviceCommand.updateMany({
        where: { id: { in: commands.map((c) => c.id) } },
        data: { status: 'SENT', sentAt: new Date() },
      });
    }
    return commands.map((c) => ({
      id: c.id,
      deviceSerial: c.device.serial,
      devEui: c.device.devEui,
      type: toApiEnum(c.type),
      payload: c.payload,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async ackCommand(gateway: DeviceContext, commandId: string, success: boolean, result?: Record<string, unknown>) {
    const command = await this.prisma.deviceCommand.findFirst({
      where: { id: commandId, device: { organizationId: gateway.organizationId } },
      include: { device: true },
    });
    if (!command) return { ok: false };
    await this.prisma.deviceCommand.update({
      where: { id: commandId },
      data: {
        status: success ? 'ACKNOWLEDGED' : 'FAILED',
        ackedAt: new Date(),
        result: result as Prisma.InputJsonValue,
      },
    });
    // Apply confirmed configuration changes to the device record.
    if (success && command.type === 'SET_INTERVAL') {
      const interval = Number((command.payload as { interval?: number } | null)?.interval);
      if (Number.isInteger(interval))
        await this.prisma.device.update({ where: { id: command.deviceId }, data: { reportInterval: interval } });
    }
    if (success && command.type === 'FIRMWARE_UPDATE') {
      const version = (command.payload as { version?: string } | null)?.version;
      if (version) {
        await this.prisma.device.update({ where: { id: command.deviceId }, data: { firmware: version } });
        await this.prisma.deviceEvent.create({
          data: {
            deviceId: command.deviceId,
            type: 'FIRMWARE_UPDATED',
            message: { id: `Firmware diperbarui ke ${version}.`, en: `Firmware updated to ${version}.` },
          },
        });
      }
    }
    if (!success) {
      await this.prisma.deviceEvent.create({
        data: {
          deviceId: command.deviceId,
          type: 'WARNING',
          message: { id: 'Perangkat gagal menjalankan perintah.', en: 'Device failed to execute a command.' },
          metadata: { commandId, type: command.type, result } as Prisma.InputJsonValue,
        },
      });
    }
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Dashboard reads
  // ---------------------------------------------------------------------------

  /** Live Monitoring page: latest snapshot of every active animal with threshold breaches. */
  async live(organizationId: string, farmId?: string) {
    const thresholds = await this.thresholds(organizationId);
    const animals = await this.prisma.livestock.findMany({
      where: { organizationId, archived: false, ...(farmId && farmId !== 'all' ? { farmId } : {}) },
      include: { device: true },
      orderBy: { code: 'asc' },
    });
    return {
      thresholds,
      generatedAt: new Date().toISOString(),
      animals: animals.map((a) => {
        const breaches = evaluateReading(
          {
            temperature: a.temperature,
            heartRate: a.heartRate,
            oxygen: a.oxygenLevel,
            battery: a.device?.battery ?? null,
          },
          { thresholds, hasDevice: Boolean(a.device) },
        ).map((c) => c.ruleKey);
        return {
          id: a.id,
          code: a.code,
          name: a.name,
          farmId: a.farmId,
          barnId: a.barnId,
          healthStatus: toApiEnum(a.healthStatus),
          healthScore: a.healthScore,
          temperature: a.temperature,
          heartRate: a.heartRate,
          activity: a.activityLevel,
          oxygen: a.oxygenLevel,
          battery: a.device?.battery ?? null,
          signal: a.device?.signal ?? null,
          deviceId: a.deviceId,
          deviceStatus: a.device ? toApiEnum(a.device.status) : 'unassigned',
          lastReadingAt: a.lastReadingAt?.toISOString() ?? null,
          location: a.latitude != null && a.longitude != null ? { lat: a.latitude, lng: a.longitude } : null,
          breaches,
        };
      }),
    };
  }

  async latest(organizationId: string, livestockId: string, limit = 20) {
    const rows = await this.prisma.telemetryReading.findMany({
      where: { livestockId, livestock: { organizationId } },
      orderBy: { recordedAt: 'desc' },
      take: Math.min(limit, 500),
    });
    return rows.map((row) => ({
      ...row,
      id: row.id.toString(),
      recordedAt: row.recordedAt.toISOString(),
      receivedAt: row.receivedAt.toISOString(),
    }));
  }

  // ---------------------------------------------------------------------------
  // Cached lookups
  // ---------------------------------------------------------------------------

  private async thresholds(organizationId: string): Promise<AlertThresholds> {
    const cached = this.thresholdCache.get(organizationId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { settings: true },
    });
    const value = readThresholds(org.settings);
    this.thresholdCache.set(organizationId, { value, expiresAt: Date.now() + 60_000 });
    return value;
  }

  /** Mean activity over the last 7 days (cached for an hour). */
  private async activityBaseline(livestockId: string): Promise<number | null> {
    const cached = this.baselineCache.get(livestockId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const aggregate = await this.prisma.telemetryReading.aggregate({
      where: {
        livestockId,
        recordedAt: { gte: new Date(Date.now() - 7 * 86_400_000), lt: new Date(Date.now() - 3_600_000) },
      },
      _avg: { activity: true },
      _count: { activity: true },
    });
    // Require a day's worth of data before judging drops against the baseline.
    const value = aggregate._count.activity >= 24 ? aggregate._avg.activity : null;
    this.baselineCache.set(livestockId, { value, expiresAt: Date.now() + 3_600_000 });
    return value;
  }

  private async minutesOutsideGeofence(
    livestockId: string,
    farmId: string,
    point: LatLng,
    at: Date,
  ): Promise<number | null> {
    const fences = await this.geofences(farmId);
    if (!fences.length) return null;
    const inside = fences.some((polygon) => pointInPolygon(point, polygon));
    if (inside) {
      this.outsideSince.delete(livestockId);
      return 0;
    }
    const since = this.outsideSince.get(livestockId) ?? at;
    this.outsideSince.set(livestockId, since);
    return (at.getTime() - since.getTime()) / 60_000;
  }

  private async geofences(farmId: string): Promise<LatLng[][]> {
    const cached = this.geofenceCache.get(farmId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const rows = await this.prisma.geofence.findMany({
      where: { farmId, active: true, type: { in: ['BOUNDARY', 'GRAZING'] } },
      select: { polygon: true },
    });
    const value = rows.map((row) => row.polygon as unknown as LatLng[]);
    this.geofenceCache.set(farmId, { value, expiresAt: Date.now() + 5 * 60_000 });
    return value;
  }

  private async touchGateway(gatewayId: string, packets: number) {
    await this.prisma.device.update({
      where: { id: gatewayId },
      data: { lastSyncAt: new Date(), dataPackets: { increment: packets } },
    });
    await this.prisma.device.updateMany({
      where: { id: gatewayId, status: { not: 'MAINTENANCE' } },
      data: { status: 'ONLINE' },
    });
  }
}
