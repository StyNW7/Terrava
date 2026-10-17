import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../notifications/channels/mail.service';
import { ROLE_PERMISSIONS, Permission } from '../../common/permissions';
import { serializeStaff, type StaffStats } from '../../common/serializers';
import { randomToken, sha256 } from '../../common/utils/crypto';
import { roleFromLabel, roleLabel, ROLE_LABEL_VALUES } from '../../common/utils/enums';
import type { AuthContext } from '../../common/auth-context';
import type { StaffRole } from '../../generated/prisma/client';
import type { InviteMemberDto, UpdateMemberDto } from './team.dto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
    private readonly config: AppConfigService,
  ) {}

  async list(ctx: AuthContext, farmId?: string) {
    const members = await this.prisma.membership.findMany({
      where: { organizationId: ctx.organizationId, ...(farmId && farmId !== 'all' ? { farmId } : {}) },
      include: { user: true },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });
    const stats = await this.stats(members.map((m) => m.id));
    return members.map((member) => serializeStaff(member, stats.get(member.id)!));
  }

  async get(ctx: AuthContext, id: string) {
    const member = await this.prisma.membership.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: { user: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    const [stats, tasks, alerts] = await Promise.all([
      this.stats([id]),
      this.prisma.task.findMany({ where: { assigneeId: id, done: false }, orderBy: { dueDate: 'asc' }, take: 10 }),
      this.prisma.alert.findMany({
        where: { assignedToId: id, status: { not: 'RESOLVED' } },
        orderBy: { detectedAt: 'desc' },
        take: 10,
      }),
    ]);
    return {
      ...serializeStaff(member, stats.get(id)!),
      permissions: ROLE_PERMISSIONS[member.role],
      openTasks: tasks.map((t) => ({
        id: t.id,
        title: t.title ?? t.titleKey,
        dueDate: t.dueDate.toISOString().slice(0, 10),
      })),
      openAlerts: alerts.map((a) => ({ id: a.id, title: a.title, severity: a.severity.toLowerCase() })),
    };
  }

  /** The Team page permissions matrix, generated from the same table the guards use. */
  permissionsMatrix() {
    const roles = Object.keys(ROLE_PERMISSIONS) as StaffRole[];
    return {
      roles: roles.map(roleLabel),
      permissions: Object.values(Permission).map((permission) => ({
        key: permission,
        allowed: roles.map((role) => ROLE_PERMISSIONS[role].includes(permission)),
      })),
    };
  }

  async invite(ctx: AuthContext, dto: InviteMemberDto) {
    const role = this.parseRole(dto.role);
    if (role === 'OWNER' && ctx.role !== 'OWNER')
      throw new ForbiddenException('Only an Owner can invite another Owner');
    if (dto.farmId) await this.assertFarm(ctx, dto.farmId);

    const email = dto.email.trim().toLowerCase();
    const existingMember = await this.prisma.membership.findFirst({
      where: { organizationId: ctx.organizationId, user: { email } },
    });
    if (existingMember && existingMember.status !== 'INVITED')
      throw new ConflictException('This person is already a member');

    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } });
    const token = randomToken(32);

    const member = await this.prisma.$transaction(async (tx) => {
      // A placeholder account lets the invitee appear in the staff list straight away.
      const user =
        (await tx.user.findUnique({ where: { email } })) ??
        (await tx.user.create({
          data: { email, name: dto.name ?? email.split('@')[0], passwordHash: '!', status: 'INVITED' },
        }));
      const membership = await tx.membership.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: ctx.organizationId } },
        update: { role, farmId: dto.farmId, title: dto.title, status: 'INVITED' },
        create: {
          userId: user.id,
          organizationId: ctx.organizationId,
          role,
          farmId: dto.farmId,
          title: dto.title,
          status: 'INVITED',
        },
        include: { user: true },
      });
      await tx.invitation.updateMany({
        where: { organizationId: ctx.organizationId, email, acceptedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.invitation.create({
        data: {
          organizationId: ctx.organizationId,
          email,
          name: dto.name,
          role,
          farmId: dto.farmId,
          tokenHash: sha256(token),
          invitedById: ctx.userId,
          expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000),
        },
      });
      return membership;
    });

    await this.sendInvitationEmail(email, token, organization.name, ctx.name, roleLabel(role));
    await this.audit.record(ctx, {
      action: 'team.invite',
      entityType: 'Membership',
      entityId: member.id,
      metadata: { email, role },
    });
    const stats = await this.stats([member.id]);
    return serializeStaff(member, stats.get(member.id)!);
  }

  async pendingInvitations(ctx: AuthContext) {
    const invitations = await this.prisma.invitation.findMany({
      where: { organizationId: ctx.organizationId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { invitedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      role: roleLabel(inv.role),
      farmId: inv.farmId,
      invitedBy: inv.invitedBy?.name ?? null,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    }));
  }

  async resendInvitation(ctx: AuthContext, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: ctx.organizationId, acceptedAt: null, revokedAt: null },
      include: { organization: true },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    const token = randomToken(32);
    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { tokenHash: sha256(token), expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000) },
    });
    await this.sendInvitationEmail(
      invitation.email,
      token,
      invitation.organization.name,
      ctx.name,
      roleLabel(invitation.role),
    );
    return { ok: true };
  }

  async revokeInvitation(ctx: AuthContext, invitationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: ctx.organizationId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    await this.prisma.$transaction([
      this.prisma.invitation.update({ where: { id: invitationId }, data: { revokedAt: new Date() } }),
      this.prisma.membership.deleteMany({
        where: { organizationId: ctx.organizationId, status: 'INVITED', user: { email: invitation.email } },
      }),
    ]);
    return { ok: true };
  }

  async update(ctx: AuthContext, id: string, dto: UpdateMemberDto) {
    const member = await this.assertMember(ctx, id);
    const role = dto.role ? this.parseRole(dto.role) : undefined;

    if (role && role !== member.role) {
      if (member.id === ctx.membershipId) throw new ForbiddenException('You cannot change your own role');
      if ((role === 'OWNER' || member.role === 'OWNER') && ctx.role !== 'OWNER') {
        throw new ForbiddenException('Only an Owner can grant or remove the Owner role');
      }
      if (member.role === 'OWNER') await this.assertNotLastOwner(ctx.organizationId);
    }
    if (dto.farmId && dto.farmId !== 'all') await this.assertFarm(ctx, dto.farmId);

    await this.prisma.membership.update({
      where: { id },
      data: { role, title: dto.title, farmId: dto.farmId === 'all' ? null : dto.farmId },
    });
    await this.audit.record(ctx, {
      action: 'team.update',
      entityType: 'Membership',
      entityId: id,
      metadata: { role, farmId: dto.farmId },
    });
    return this.get(ctx, id);
  }

  async setActive(ctx: AuthContext, id: string, active: boolean) {
    const member = await this.assertMember(ctx, id);
    if (member.id === ctx.membershipId) throw new ForbiddenException('You cannot deactivate yourself');
    if (!active && member.role === 'OWNER') await this.assertNotLastOwner(ctx.organizationId);
    if (member.status === 'INVITED') throw new BadRequestException('This member has not accepted the invitation yet');

    await this.prisma.membership.update({ where: { id }, data: { status: active ? 'ACTIVE' : 'DISABLED' } });
    if (!active) {
      // End the member's sessions in this organization immediately.
      await this.prisma.session.updateMany({
        where: { userId: member.userId, organizationId: ctx.organizationId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.audit.record(ctx, {
      action: active ? 'team.activate' : 'team.deactivate',
      entityType: 'Membership',
      entityId: id,
    });
    return this.get(ctx, id);
  }

  async remove(ctx: AuthContext, id: string) {
    const member = await this.assertMember(ctx, id);
    if (member.id === ctx.membershipId) throw new ForbiddenException('You cannot remove yourself');
    if (member.role === 'OWNER') await this.assertNotLastOwner(ctx.organizationId);

    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId: member.userId, organizationId: ctx.organizationId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.membership.delete({ where: { id } }),
    ]);
    // Clean up placeholder accounts that never accepted any invitation.
    const user = await this.prisma.user.findUnique({ where: { id: member.userId }, include: { memberships: true } });
    if (user && user.status === 'INVITED' && user.memberships.length === 0)
      await this.prisma.user.delete({ where: { id: user.id } });

    await this.audit.record(ctx, { action: 'team.remove', entityType: 'Membership', entityId: id });
    return { ok: true };
  }

  // ---------------------------------------------------------------------------

  private async stats(membershipIds: string[]): Promise<Map<string, StaffStats>> {
    const [tasks, alerts, resolved] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['assigneeId'],
        where: { assigneeId: { in: membershipIds } },
        _count: { _all: true },
      }),
      this.prisma.alert.groupBy({
        by: ['assignedToId'],
        where: { assignedToId: { in: membershipIds } },
        _count: { _all: true },
      }),
      this.prisma.alert.groupBy({
        by: ['assignedToId'],
        where: { assignedToId: { in: membershipIds }, status: 'RESOLVED' },
        _count: { _all: true },
      }),
    ]);
    const taskBy = new Map(tasks.map((t) => [t.assigneeId, t._count._all]));
    const alertBy = new Map(alerts.map((a) => [a.assignedToId, a._count._all]));
    const resolvedBy = new Map(resolved.map((a) => [a.assignedToId, a._count._all]));
    return new Map(
      membershipIds.map((id) => {
        const assigned = alertBy.get(id) ?? 0;
        return [
          id,
          {
            tasksAssigned: taskBy.get(id) ?? 0,
            alertsAssigned: assigned,
            resolutionRate: assigned ? Math.round(((resolvedBy.get(id) ?? 0) / assigned) * 100) : 0,
          },
        ];
      }),
    );
  }

  private parseRole(label: string): StaffRole {
    if (!ROLE_LABEL_VALUES.includes(label))
      throw new BadRequestException(`Role must be one of: ${ROLE_LABEL_VALUES.join(', ')}`);
    return roleFromLabel(label);
  }

  private async assertMember(ctx: AuthContext, id: string) {
    const member = await this.prisma.membership.findFirst({ where: { id, organizationId: ctx.organizationId } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  private async assertFarm(ctx: AuthContext, farmId: string) {
    const farm = await this.prisma.farm.count({ where: { id: farmId, organizationId: ctx.organizationId } });
    if (!farm) throw new BadRequestException('Farm not found in this organization');
  }

  private async assertNotLastOwner(organizationId: string) {
    const owners = await this.prisma.membership.count({ where: { organizationId, role: 'OWNER', status: 'ACTIVE' } });
    if (owners <= 1) throw new ForbiddenException('The organization must keep at least one active Owner');
  }

  private async sendInvitationEmail(email: string, token: string, organization: string, inviter: string, role: string) {
    const url = `${this.config.get('APP_URL')}/accept-invitation?token=${token}`;
    await this.mail.send({
      to: email,
      subject: `Undangan bergabung dengan ${organization} di Terrava`,
      text: `${inviter} mengundang Anda bergabung dengan ${organization} sebagai ${role}. Terima undangan: ${url}`,
      html: MailService.layout(
        `Undangan dari ${inviter}`,
        `<p>${inviter} mengundang Anda bergabung dengan <b>${organization}</b> di Terrava sebagai <b>${role}</b>. Undangan berlaku ${INVITE_TTL_DAYS} hari.</p>`,
        { label: 'Terima undangan', url },
      ),
    });
  }
}
