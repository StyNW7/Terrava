import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Events, type OrgEvent } from '../../common/events';
import type { JwtPayload } from '../../common/auth-context';

/**
 * Socket.IO gateway for the live dashboard (namespace `/realtime`).
 *
 * Clients connect with `io(url + "/realtime", { auth: { token: accessToken } })`
 * and are placed in their organization room. Optional `subscribe:livestock`
 * narrows a client to one animal for the detail page's live vitals.
 *
 * Server -> client events:
 *   telemetry        latest vitals for an animal (live monitoring page)
 *   environment      barn climate reading
 *   alert:created    new alert (alerts center, notification bell)
 *   alert:updated    status / assignment change
 *   device:updated   device status, battery, signal
 *   livestock:updated health status change
 *   notification     in-app notification for this user
 */
@WebSocketGateway({ namespace: '/realtime', cors: { origin: true, credentials: true } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const raw =
        (client.handshake.auth?.token as string | undefined) ??
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!raw) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(raw);
      client.data.user = payload;
      await client.join([`org:${payload.org}`, `user:${payload.sub}`]);
      client.emit('ready', { organizationId: payload.org });
    } catch {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe:livestock')
  async subscribeLivestock(@ConnectedSocket() client: Socket, @MessageBody() livestockId: string) {
    if (typeof livestockId !== 'string' || !client.data.user) return { ok: false };
    await client.join(`livestock:${client.data.user.org}:${livestockId}`);
    return { ok: true };
  }

  @SubscribeMessage('unsubscribe:livestock')
  async unsubscribeLivestock(@ConnectedSocket() client: Socket, @MessageBody() livestockId: string) {
    if (!client.data.user) return { ok: false };
    await client.leave(`livestock:${client.data.user.org}:${livestockId}`);
    return { ok: true };
  }

  private toOrg(organizationId: string, event: string, payload: unknown) {
    this.server?.to(`org:${organizationId}`).emit(event, payload);
  }

  @OnEvent(Events.TelemetryReceived)
  onTelemetry(event: OrgEvent<{ livestockId: string | null }>) {
    this.toOrg(event.organizationId, 'telemetry', event.payload);
    if (event.payload.livestockId) {
      this.server
        ?.to(`livestock:${event.organizationId}:${event.payload.livestockId}`)
        .emit('telemetry:livestock', event.payload);
    }
  }

  @OnEvent(Events.EnvironmentReceived)
  onEnvironment(event: OrgEvent) {
    this.toOrg(event.organizationId, 'environment', event.payload);
  }

  @OnEvent(Events.AlertCreated)
  onAlertCreated(event: OrgEvent) {
    this.toOrg(event.organizationId, 'alert:created', event.payload);
  }

  @OnEvent(Events.AlertUpdated)
  onAlertUpdated(event: OrgEvent) {
    this.toOrg(event.organizationId, 'alert:updated', event.payload);
  }

  @OnEvent(Events.DeviceUpdated)
  onDevice(event: OrgEvent) {
    this.toOrg(event.organizationId, 'device:updated', event.payload);
  }

  @OnEvent(Events.LivestockUpdated)
  onLivestock(event: OrgEvent) {
    this.toOrg(event.organizationId, 'livestock:updated', event.payload);
  }

  @OnEvent(Events.InsightCreated)
  onInsight(event: OrgEvent) {
    this.toOrg(event.organizationId, 'insight:created', event.payload);
  }

  @OnEvent(Events.NotificationCreated)
  onNotification(event: OrgEvent<{ userId: string }>) {
    // Notifications are personal: push to the recipient's user room only.
    this.server?.to(`user:${event.payload.userId}`).emit('notification', event.payload);
  }
}
