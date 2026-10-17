import type {
  AIInsight,
  Alert,
  AlertNote,
  Barn,
  Device,
  DeviceEvent,
  Farm,
  Livestock,
  MaintenanceLog,
  Membership,
  Task,
  User,
} from '../generated/prisma/client';
import { ageInMonths } from '../domain/schedule';
import { genderLabel, roleLabel, toApiEnum } from './utils/enums';
import { asLocalized } from './utils/localized';

/**
 * Serializers turn Prisma rows into the exact shapes the dashboard already
 * consumes (frontend/src/types/dashboard.ts). Keeping this mapping in one place
 * is what lets the frontend swap its local data store for this API later
 * without touching components.
 */

const isoDate = (value: Date | null | undefined) => (value ? value.toISOString().slice(0, 10) : null);
const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null);
const round1 = (value: number) => Math.round(value * 10) / 10;

export interface FarmStats {
  livestockCount: number;
  barnCount: number;
  healthScore: number;
  deviceCoverage: number;
  activeAlerts: number;
  staffCount: number;
  capacity: number;
}

export function serializeFarm(farm: Farm & { manager?: (Membership & { user: User }) | null }, stats: FarmStats) {
  return {
    id: farm.id,
    name: farm.name,
    location: farm.location,
    region: farm.region,
    address: farm.address,
    manager: farm.manager?.user.name ?? '-',
    managerId: farm.managerId,
    image: farm.imageUrl ?? '',
    status: toApiEnum(farm.status) as 'active' | 'inactive',
    coordinates: farm.latitude != null && farm.longitude != null ? { lat: farm.latitude, lng: farm.longitude } : null,
    areaHectares: farm.areaHectares,
    ...stats,
    createdAt: iso(farm.createdAt),
  };
}

export interface BarnStats {
  occupancy: number;
  healthScore: number;
  temperature: number;
  humidity: number;
  alertCount: number;
}

export function serializeBarn(barn: Barn & { manager?: (Membership & { user: User }) | null }, stats: BarnStats) {
  return {
    id: barn.id,
    name: barn.name,
    farmId: barn.farmId,
    capacity: barn.capacity,
    manager: barn.manager?.user.name ?? '-',
    managerId: barn.managerId,
    ...stats,
    temperature: round1(stats.temperature),
  };
}

export function serializeLivestock(animal: Livestock & { device?: Device | null }) {
  const device = animal.device ?? null;
  return {
    id: animal.id,
    code: animal.code,
    name: animal.name,
    earTagId: animal.earTagId,
    rfid: animal.rfid,
    registrationNumber: animal.registrationNumber,
    photo: animal.photoUrl ?? '',
    type: animal.type,
    breed: animal.breed,
    gender: genderLabel(animal.gender),
    dateOfBirth: isoDate(animal.dateOfBirth),
    ageMonths: ageInMonths(animal.dateOfBirth),
    weightKg: animal.weightKg,
    bodyConditionScore: animal.bodyConditionScore,
    markings: animal.markings,
    farmId: animal.farmId,
    barnId: animal.barnId,
    herdGroup: animal.herdGroup,
    healthStatus: toApiEnum(animal.healthStatus),
    healthScore: animal.healthScore,
    temperature: animal.temperature ?? 0,
    heartRate: animal.heartRate ?? 0,
    activityLevel: animal.activityLevel ?? 0,
    oxygenLevel: animal.oxygenLevel ?? 0,
    deviceId: animal.deviceId,
    deviceStatus: device ? toApiEnum(device.status) : 'unassigned',
    batteryLevel: device?.battery ?? 0,
    lastUpdate: iso(animal.lastReadingAt ?? animal.updatedAt),
    location: { lat: animal.latitude ?? 0, lng: animal.longitude ?? 0 },
    vaccinationStatus: toApiEnum(animal.vaccinationStatus),
    arrivalDate: isoDate(animal.arrivalDate),
    acquisitionSource: animal.acquisitionSource,
    knownConditions: animal.knownConditions,
    notes: asLocalized(animal.notes),
    archived: animal.archived,
  };
}

export function serializeDeviceEvent(event: DeviceEvent) {
  return { id: event.id, type: toApiEnum(event.type), message: asLocalized(event.message), at: iso(event.createdAt) };
}

export function serializeDevice(
  device: Device & {
    assignedLivestock?: Pick<Livestock, 'id'> | null;
    events?: DeviceEvent[];
    maintenanceLogs?: MaintenanceLog[];
  },
) {
  return {
    id: device.id,
    serial: device.serial,
    devEui: device.devEui,
    name: device.name,
    type: toApiEnum(device.type),
    status: toApiEnum(device.status),
    assignedLivestockId: device.assignedLivestock?.id ?? null,
    farmId: device.farmId,
    barnId: device.barnId,
    battery: device.battery,
    signal: device.signal,
    rssi: device.rssi,
    snr: device.snr,
    firmware: device.firmware,
    reportInterval: device.reportInterval,
    lastSync: iso(device.lastSyncAt),
    uptime: round1(device.uptime),
    dataPackets: device.dataPackets,
    location:
      device.latitude != null && device.longitude != null ? { lat: device.latitude, lng: device.longitude } : null,
    hasApiKey: Boolean(device.apiKeyHash),
    events: device.events?.map(serializeDeviceEvent),
    maintenanceLog: device.maintenanceLogs?.map((log) => ({
      id: log.id,
      note: log.note,
      by: log.byName,
      at: iso(log.createdAt),
    })),
  };
}

export function serializeAlert(
  alert: Alert & { notes?: AlertNote[]; assignedTo?: (Membership & { user: User }) | null },
) {
  return {
    id: alert.id,
    title: asLocalized(alert.title),
    severity: toApiEnum(alert.severity),
    category: toApiEnum(alert.category),
    status: toApiEnum(alert.status),
    source: toApiEnum(alert.source),
    ruleKey: alert.ruleKey,
    livestockId: alert.livestockId,
    farmId: alert.farmId,
    barnId: alert.barnId,
    deviceId: alert.deviceId,
    detectedAt: iso(alert.detectedAt),
    assignedTo: alert.assignedTo?.user.name ?? null,
    assignedToId: alert.assignedToId,
    description: asLocalized(alert.description),
    aiConfidence: alert.aiConfidence,
    aiCause: asLocalized(alert.aiCause),
    recommendations: alert.recommendations,
    dataAtDetection: alert.dataAtDetection as {
      temperature: number;
      heartRate: number;
      activity: number;
      oxygen: number;
    },
    notes: alert.notes?.map((note) => ({
      id: note.id,
      text: note.text,
      author: note.authorName,
      createdAt: iso(note.createdAt),
    })),
    acknowledgedAt: iso(alert.acknowledgedAt),
    acknowledgedBy: alert.acknowledgedBy,
    resolvedAt: iso(alert.resolvedAt),
    resolvedBy: alert.resolvedBy,
    resolutionNote: alert.resolutionNote,
  };
}

export interface StaffStats {
  tasksAssigned: number;
  alertsAssigned: number;
  resolutionRate: number;
}

export function serializeStaff(member: Membership & { user: User }, stats: StaffStats) {
  return {
    id: member.id,
    userId: member.userId,
    name: member.user.name,
    email: member.user.email,
    phone: member.user.phone,
    avatar: member.user.avatarUrl ?? '',
    role: roleLabel(member.role),
    title: member.title ?? undefined,
    farmId: member.farmId ?? 'all',
    status: toApiEnum(member.status),
    lastActive: iso(member.user.lastActiveAt),
    ...stats,
  };
}

export function serializeInsight(insight: AIInsight) {
  return {
    id: insight.id,
    priority: toApiEnum(insight.priority),
    category: toApiEnum(insight.category),
    title: asLocalized(insight.title),
    summary: asLocalized(insight.summary),
    affectedLivestock: insight.affectedLivestock,
    confidence: insight.confidence,
    recommendation: asLocalized(insight.recommendation),
    generatedAt: iso(insight.generatedAt),
    reviewed: insight.reviewed,
    dismissed: insight.dismissed,
    farmId: insight.farmId,
    source: insight.source,
  };
}

export function serializeTask(task: Task) {
  return {
    id: task.id,
    title: task.title ?? undefined,
    titleKey: task.titleKey ?? undefined,
    description: task.description,
    kind: toApiEnum(task.kind),
    farmId: task.farmId,
    livestockId: task.livestockId,
    assignee: task.assigneeName,
    assigneeId: task.assigneeId,
    dueDate: isoDate(task.dueDate),
    done: task.done,
    completedAt: iso(task.completedAt),
    source: task.sourceType && task.sourceId ? { type: toApiEnum(task.sourceType), id: task.sourceId } : undefined,
    createdAt: iso(task.createdAt),
  };
}
