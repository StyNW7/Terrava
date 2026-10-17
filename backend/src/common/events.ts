/**
 * Internal domain events (EventEmitter2). Modules publish these instead of
 * calling each other directly; the realtime gateway and notification fan-out
 * subscribe to them.
 */
export const Events = {
  TelemetryReceived: 'telemetry.received',
  EnvironmentReceived: 'environment.received',
  AlertCreated: 'alert.created',
  AlertUpdated: 'alert.updated',
  DeviceUpdated: 'device.updated',
  LivestockUpdated: 'livestock.updated',
  TaskCreated: 'task.created',
  InsightCreated: 'insight.created',
  NotificationCreated: 'notification.created',
  ReportGenerated: 'report.generated',
} as const;

export interface OrgEvent<T = unknown> {
  organizationId: string;
  payload: T;
}
