import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import type { AuthContext } from '../../common/auth-context';
import {
  orgSettingsSchema,
  preferencesSchema,
  readOrgSettings,
  readPreferences,
  thresholdsSchema,
} from './settings.schema';
import type { UpdateOrganizationDto, UpdatePreferencesDto, UpdateProfileDto } from './settings.dto';

/**
 * Settings page backend. `GET /settings` returns the same structure as the
 * dashboard's AppSettings so the Settings tabs can bind to it directly.
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly auth: AuthService,
  ) {}

  async get(ctx: AuthContext) {
    const [user, organization, sessions] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId } }),
      this.prisma.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } }),
      this.auth.listSessions(ctx.userId, ctx.sessionId),
    ]);
    const prefs = readPreferences(user.preferences);
    const org = readOrgSettings(organization.settings);
    return {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        timezone: user.timezone,
        locale: user.locale,
        avatarUrl: user.avatarUrl,
      },
      farm: prefs.farm,
      notifications: prefs.notifications,
      thresholds: org.thresholds,
      appearance: prefs.appearance,
      privacy: prefs.privacy,
      security: { twoFactor: user.twoFactorEnabled, sessions },
      organization: { id: organization.id, name: organization.name, timezone: org.timezone },
    };
  }

  async updateProfile(ctx: AuthContext, dto: UpdateProfileDto) {
    if (
      dto.avatarUrl &&
      dto.avatarUrl.startsWith('data:') &&
      !/^data:image\/(png|jpe?g|webp);base64,/.test(dto.avatarUrl)
    ) {
      throw new BadRequestException('Avatar must be a PNG, JPEG or WebP image');
    }
    await this.prisma.user.update({
      where: { id: ctx.userId },
      data: { name: dto.name, phone: dto.phone, timezone: dto.timezone, locale: dto.locale, avatarUrl: dto.avatarUrl },
    });
    return this.get(ctx);
  }

  async updatePreferences(ctx: AuthContext, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: ctx.userId }, select: { preferences: true } });
    const current = readPreferences(user.preferences);
    const merged = {
      farm: { ...current.farm, ...dto.farm },
      notifications: { ...current.notifications, ...dto.notifications },
      appearance: { ...current.appearance, ...dto.appearance },
      privacy: { ...current.privacy, ...dto.privacy },
    };
    const parsed = preferencesSchema.safeParse(merged);
    if (!parsed.success)
      throw new BadRequestException(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
    await this.prisma.user.update({ where: { id: ctx.userId }, data: { preferences: parsed.data } });
    return this.get(ctx);
  }

  async updateThresholds(ctx: AuthContext, patch: Record<string, unknown>) {
    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } });
    const current = readOrgSettings(organization.settings);
    const parsed = thresholdsSchema.safeParse({ ...current.thresholds, ...patch });
    if (!parsed.success)
      throw new BadRequestException(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
    const settings = orgSettingsSchema.parse({ ...current, thresholds: parsed.data });
    await this.prisma.organization.update({ where: { id: ctx.organizationId }, data: { settings } });
    await this.audit.record(ctx, {
      action: 'settings.thresholds.update',
      entityType: 'Organization',
      entityId: ctx.organizationId,
      metadata: parsed.data,
    });
    return parsed.data;
  }

  async getOrganization(ctx: AuthContext) {
    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } });
    return { ...organization, type: organization.type.toLowerCase(), settings: readOrgSettings(organization.settings) };
  }

  async updateOrganization(ctx: AuthContext, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } });
    const settings = { ...readOrgSettings(organization.settings), ...(dto.timezone ? { timezone: dto.timezone } : {}) };
    await this.prisma.organization.update({
      where: { id: ctx.organizationId },
      data: { name: dto.name, province: dto.province, city: dto.city, settings },
    });
    await this.audit.record(ctx, {
      action: 'organization.update',
      entityType: 'Organization',
      entityId: ctx.organizationId,
    });
    return this.getOrganization(ctx);
  }

  /** Data and Privacy -> "Export my data": everything the organization holds, as JSON. */
  async exportData(ctx: AuthContext) {
    const org = ctx.organizationId;
    const [organization, farms, barns, livestock, devices, alerts, insights, tasks, members] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({ where: { id: org } }),
      this.prisma.farm.findMany({ where: { organizationId: org } }),
      this.prisma.barn.findMany({ where: { farm: { organizationId: org } } }),
      this.prisma.livestock.findMany({ where: { organizationId: org }, include: { healthRecords: true } }),
      this.prisma.device.findMany({ where: { organizationId: org }, omit: { apiKeyHash: true } }),
      this.prisma.alert.findMany({ where: { organizationId: org }, include: { notes: true } }),
      this.prisma.aIInsight.findMany({ where: { organizationId: org } }),
      this.prisma.task.findMany({ where: { organizationId: org } }),
      this.prisma.membership.findMany({
        where: { organizationId: org },
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
    ]);
    await this.audit.record(ctx, { action: 'settings.export', entityType: 'Organization', entityId: org });
    return {
      exportedAt: new Date().toISOString(),
      exportedBy: ctx.email,
      organization,
      farms,
      barns,
      livestock,
      devices,
      alerts,
      insights,
      tasks,
      members,
    };
  }

  /** Data and Privacy -> "Delete account". The last Owner must transfer ownership first. */
  async deleteAccount(ctx: AuthContext) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId: ctx.userId, role: 'OWNER', status: 'ACTIVE' },
    });
    for (const membership of memberships) {
      const owners = await this.prisma.membership.count({
        where: { organizationId: membership.organizationId, role: 'OWNER', status: 'ACTIVE' },
      });
      if (owners <= 1) {
        throw new ForbiddenException(
          'You are the last Owner of an organization. Assign another Owner before deleting your account.',
        );
      }
    }
    await this.audit.record(ctx, { action: 'user.delete', entityType: 'User', entityId: ctx.userId });
    await this.prisma.user.delete({ where: { id: ctx.userId } });
    return { ok: true };
  }
}
