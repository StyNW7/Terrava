import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { Events } from '../../common/events';
import type { AuthContext } from '../../common/auth-context';

/**
 * Pairs ear tags with animals. A device is worn by at most one animal and an
 * animal wears at most one device; pairing releases any previous partner on
 * both sides atomically (the same rules as the dashboard's `assignDevice`).
 */
@Injectable()
export class PairingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async pair(ctx: AuthContext, livestockId: string, deviceId: string | null) {
    const animal = await this.prisma.livestock.findFirst({
      where: { id: livestockId, organizationId: ctx.organizationId },
      select: { id: true, deviceId: true, farmId: true, name: true },
    });
    if (!animal) throw new NotFoundException('Livestock not found');

    if (deviceId) {
      const device = await this.prisma.device.findFirst({
        where: { id: deviceId, organizationId: ctx.organizationId },
        select: { id: true, type: true },
      });
      if (!device) throw new NotFoundException('Device not found');
      if (device.type !== 'EAR_TAG') throw new BadRequestException('Only smart ear tags can be paired with livestock');
    }
    if (animal.deviceId === deviceId) return { livestockId, deviceId };

    await this.prisma.$transaction(async (tx) => {
      // Release the device from whoever wears it now.
      if (deviceId) {
        const previousWearer = await tx.livestock.findFirst({ where: { deviceId }, select: { id: true } });
        if (previousWearer) await tx.livestock.update({ where: { id: previousWearer.id }, data: { deviceId: null } });
      }
      await tx.livestock.update({ where: { id: livestockId }, data: { deviceId } });

      if (animal.deviceId) {
        await tx.deviceEvent.create({
          data: {
            deviceId: animal.deviceId,
            type: 'UNPAIRED',
            message: { id: `Dilepas dari ${animal.name}.`, en: `Unpaired from ${animal.name}.` },
            metadata: { livestockId, by: ctx.name },
          },
        });
      }
      if (deviceId) {
        await tx.deviceEvent.create({
          data: {
            deviceId,
            type: 'PAIRED',
            message: { id: `Dipasangkan ke ${animal.name}.`, en: `Paired with ${animal.name}.` },
            metadata: { livestockId, by: ctx.name },
          },
        });
        // Telemetry recorded under the device now belongs to the new wearer.
        await tx.device.update({ where: { id: deviceId }, data: { farmId: animal.farmId } });
      }
    });

    this.events.emit(Events.LivestockUpdated, {
      organizationId: ctx.organizationId,
      payload: { id: livestockId, deviceId },
    });
    return { livestockId, deviceId };
  }

  async unpairDevice(ctx: AuthContext, deviceId: string) {
    const wearer = await this.prisma.livestock.findFirst({
      where: { deviceId, organizationId: ctx.organizationId },
      select: { id: true },
    });
    if (wearer) await this.pair(ctx, wearer.id, null);
    return { deviceId, livestockId: null };
  }
}
