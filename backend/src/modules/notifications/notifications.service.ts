import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { Events, type OrgEvent } from '../../common/events';
import { hasPermission, Permission } from '../../common/permissions';
import { asLocalized, type Localized } from '../../common/utils/localized';
import { readPreferences } from '../settings/settings.schema';
import type { NotificationType, Prisma } from '../../generated/prisma/client';
import { MailService } from './channels/mail.service';
import { WhatsAppService } from './channels/whatsapp.service';
import type { serializeAlert } from '../../common/serializers';

type AlertPayload = ReturnType<typeof serializeAlert>;

export interface NotifyInput {
  organizationId: string;
  userIds: string[];
  type: NotificationType;
  title: Localized;
  body: Localized;
  link?: string;
  entityId?: string;
  /** Respect this preference flag (e.g. "criticalAlerts") before delivering. */
  preference?: 'criticalAlerts' | 'deviceAlerts' | 'weatherAlerts' | 'dailySummary' | 'weeklyReport';
  /** Allow email / WhatsApp in addition to in-app. */
  external?: boolean;
}

/**
 * Notification fan-out: in-app (stored + pushed over WebSocket), email and
 * WhatsApp, each gated by the recipient's notification preferences.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly whatsapp: WhatsAppService,
    private readonly events: EventEmitter2,
    private readonly config: AppConfigService,
  ) {}

  async notify(input: NotifyInput) {
    if (!input.userIds.length) return 0;
    const users = await this.prisma.user.findMany({
      where: { id: { in: input.userIds }, status: 'ACTIVE' },
      select: { id: true, email: true, phone: true, locale: true, preferences: true },
    });

    let delivered = 0;
    for (const user of users) {
      const prefs = readPreferences(user.preferences).notifications;
      if (input.preference && !prefs[input.preference]) continue;

      const lang = user.locale === 'en' ? 'en' : 'id';
      const channels: string[] = [];
      if (prefs.inApp) channels.push('in-app');

      if (input.external && prefs.email) {
        const link = input.link ? `${this.config.get('APP_URL')}${input.link}` : undefined;
        const ok = await this.mail.send({
          to: user.email,
          subject: `Terrava · ${input.title[lang]}`,
          text: `${input.body[lang]}${link ? `\n\n${link}` : ''}`,
          html: MailService.layout(
            input.title[lang],
            `<p>${input.body[lang]}</p>`,
            link ? { label: lang === 'id' ? 'Buka di Terrava' : 'Open in Terrava', url: link } : undefined,
          ),
        });
        if (ok) channels.push('email');
      }
      if (input.external && prefs.whatsapp && user.phone) {
        const ok = await this.whatsapp.send(user.phone, `*${input.title[lang]}*\n${input.body[lang]}`);
        if (ok) channels.push('whatsapp');
      }
      if (!channels.length) continue;

      const notification = await this.prisma.notification.create({
        data: {
          userId: user.id,
          organizationId: input.organizationId,
          type: input.type,
          title: input.title as unknown as Prisma.InputJsonValue,
          body: input.body as unknown as Prisma.InputJsonValue,
          link: input.link,
          entityId: input.entityId,
          channels,
        },
      });
      delivered += 1;
      if (channels.includes('in-app')) {
        this.events.emit(Events.NotificationCreated, {
          organizationId: input.organizationId,
          payload: this.serialize(notification),
        });
      }
    }
    return delivered;
  }

  /** Members allowed to act on alerts receive alert notifications. */
  @OnEvent(Events.AlertCreated, { async: true })
  async onAlertCreated(event: OrgEvent<AlertPayload>) {
    const alert = event.payload;
    if (alert.severity !== 'critical' && alert.severity !== 'high') return;
    try {
      const members = await this.prisma.membership.findMany({
        where: { organizationId: event.organizationId, status: 'ACTIVE' },
        select: { userId: true, role: true, farmId: true },
      });
      const recipients = members
        .filter((m) => hasPermission(m.role, Permission.MANAGE_ALERTS))
        .filter((m) => !m.farmId || m.farmId === alert.farmId || m.role === 'OWNER')
        .map((m) => m.userId);

      const preference =
        alert.category === 'device'
          ? 'deviceAlerts'
          : alert.category === 'weather'
            ? 'weatherAlerts'
            : 'criticalAlerts';
      await this.notify({
        organizationId: event.organizationId,
        userIds: recipients,
        type: 'ALERT',
        title: alert.title,
        body: alert.description,
        link: `/dashboard/alerts/${alert.id}`,
        entityId: alert.id,
        preference,
        external: alert.severity === 'critical',
      });
    } catch (error) {
      this.logger.error(`Alert notification fan-out failed: ${(error as Error).message}`);
    }
  }

  async list(userId: string, opts: { unreadOnly?: boolean; take?: number }) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, ...(opts.unreadOnly ? { readAt: null } : {}) },
        orderBy: { createdAt: 'desc' },
        take: Math.min(opts.take ?? 30, 100),
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { data: items.map((item) => this.serialize(item)), unread };
  }

  async markRead(userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (!result.count) {
      const exists = await this.prisma.notification.count({ where: { id, userId } });
      if (!exists) throw new NotFoundException('Notification not found');
    }
    return { ok: true };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async remove(userId: string, id: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
    return { ok: true };
  }

  serialize(notification: {
    id: string;
    userId: string;
    type: string;
    title: unknown;
    body: unknown;
    link: string | null;
    channels: string[];
    entityId: string | null;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type.toLowerCase(),
      title: asLocalized(notification.title),
      body: asLocalized(notification.body),
      link: notification.link,
      channels: notification.channels,
      entityId: notification.entityId,
      read: notification.readAt !== null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
