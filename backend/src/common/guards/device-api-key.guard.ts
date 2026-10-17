import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { sha256 } from '../utils/crypto';
import type { DeviceContext } from '../auth-context';

/**
 * Authenticates LoRa gateways and the IoT bridge. Each gateway gets an API key
 * (shown once when issued); only its SHA-256 hash is stored.
 */
@Injectable()
export class DeviceApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-device-key'];
    if (typeof key !== 'string' || key.length < 24) throw new UnauthorizedException('Missing or malformed device key');

    const gateway = await this.prisma.device.findUnique({
      where: { apiKeyHash: sha256(key) },
      select: { id: true, organizationId: true, farmId: true, type: true },
    });
    if (!gateway || gateway.type !== 'GATEWAY') throw new UnauthorizedException('Unknown device key');

    const ctx: DeviceContext = {
      gatewayId: gateway.id,
      organizationId: gateway.organizationId,
      farmId: gateway.farmId,
    };
    request.gateway = ctx;
    return true;
  }
}
