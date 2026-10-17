import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '../../generated/prisma/client';
import type { AuthContext } from '../../common/auth-context';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

/** Append-only audit trail of who changed what. Failures never break the request. */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(actor: Pick<AuthContext, 'organizationId' | 'userId' | 'name'> | null, entry: AuditEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: actor?.organizationId ?? null,
          userId: actor?.userId ?? null,
          actorName: actor?.name ?? 'system',
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          metadata: entry.metadata,
          ipAddress: entry.ipAddress ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(`Could not write audit entry ${entry.action}: ${(error as Error).message}`);
    }
  }

  async list(organizationId: string, opts: { entityType?: string; entityId?: string; take?: number } = {}) {
    return this.prisma.auditLog.findMany({
      where: { organizationId, entityType: opts.entityType, entityId: opts.entityId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(opts.take ?? 50, 200),
    });
  }
}
