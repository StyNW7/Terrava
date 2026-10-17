import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AlertsService } from '../alerts/alerts.service';
import { Events } from '../../common/events';
import { ACTIONS } from '../../domain/alert-rules';

/**
 * Background jobs for the device fleet:
 * - mark devices offline when they stop reporting (and raise a device alert)
 * - maintain a rolling uptime percentage
 * - expire stale downlink commands
 * - prune telemetry beyond the retention window
 */
@Injectable()
export class DeviceMonitorService {
  private readonly logger = new Logger(DeviceMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
    private readonly events: EventEmitter2,
    private readonly config: AppConfigService,
  ) {}

  private get enabled() {
    return this.config.get('JOBS_ENABLED');
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'device-offline-detector' })
  async detectOffline() {
    if (!this.enabled) return;
    const cutoff = new Date(Date.now() - this.config.get('DEVICE_OFFLINE_MINUTES') * 60_000);
    const stale = await this.prisma.device.findMany({
      where: { status: { in: ['ONLINE', 'LOW_BATTERY'] }, lastSyncAt: { lt: cutoff } },
      include: { assignedLivestock: { select: { id: true, name: true, barnId: true } } },
    });
    for (const device of stale) {
      await this.prisma.device.update({ where: { id: device.id }, data: { status: 'OFFLINE' } });
      await this.prisma.deviceEvent.create({
        data: {
          deviceId: device.id,
          type: 'OFFLINE',
          message: {
            id: 'Tidak ada data diterima dalam batas waktu yang ditentukan.',
            en: 'No data received within the configured window.',
          },
        },
      });
      await this.alerts.raise(
        {
          ruleKey: 'deviceOffline',
          category: 'DEVICE',
          severity: device.type === 'GATEWAY' ? 'CRITICAL' : 'WARNING',
          title: { id: `${device.name} offline`, en: `${device.name} is offline` },
          description: {
            id: `Perangkat tidak mengirim data sejak ${device.lastSyncAt?.toISOString() ?? '-'}.`,
            en: `The device has not reported since ${device.lastSyncAt?.toISOString() ?? '-'}.`,
          },
          cause: {
            id:
              device.type === 'GATEWAY'
                ? 'Gangguan daya atau koneksi internet gateway.'
                : 'Baterai habis, perangkat rusak, atau di luar jangkauan gateway.',
            en:
              device.type === 'GATEWAY'
                ? 'A power or internet outage at the gateway.'
                : 'Flat battery, damaged hardware, or out of gateway range.',
          },
          recommendations: [ACTIONS.task, ACTIONS.inspect],
          confidence: 95,
        },
        {
          organizationId: device.organizationId,
          farmId: device.farmId,
          barnId: device.assignedLivestock?.barnId ?? device.barnId,
          deviceId: device.id,
          source: 'DEVICE',
          dataAtDetection: { temperature: 0, heartRate: 0, activity: 0, oxygen: 0 },
        },
      );
      this.events.emit(Events.DeviceUpdated, {
        organizationId: device.organizationId,
        payload: { id: device.id, status: 'offline' },
      });
    }
    if (stale.length) this.logger.log(`Marked ${stale.length} device(s) offline`);
  }

  /** Rolling uptime: every tick moves the figure 1% toward 100 (online) or 0 (offline). */
  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'device-uptime' })
  async updateUptime() {
    if (!this.enabled) return;
    await this.prisma.$executeRaw`
      UPDATE "devices"
      SET "uptime" = ROUND(("uptime" * 0.99 + CASE WHEN "status" = 'OFFLINE' THEN 0 ELSE 1 END)::numeric, 2)
      WHERE "status" <> 'MAINTENANCE'`;
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'device-command-expiry' })
  async expireCommands() {
    if (!this.enabled) return;
    const result = await this.prisma.deviceCommand.updateMany({
      where: { status: { in: ['PENDING', 'SENT'] }, expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    if (result.count) this.logger.log(`Expired ${result.count} downlink command(s)`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'telemetry-retention', timeZone: 'Asia/Jakarta' })
  async pruneTelemetry() {
    if (!this.enabled) return;
    const cutoff = new Date(Date.now() - this.config.get('TELEMETRY_RETENTION_DAYS') * 86_400_000);
    const [readings, environment] = await Promise.all([
      this.prisma.telemetryReading.deleteMany({ where: { recordedAt: { lt: cutoff } } }),
      this.prisma.environmentReading.deleteMany({ where: { recordedAt: { lt: cutoff } } }),
    ]);
    this.logger.log(`Retention: removed ${readings.count} telemetry and ${environment.count} environment readings`);
  }
}
