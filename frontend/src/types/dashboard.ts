import type { Localized } from "@/i18n/types";

export type HealthStatus = "healthy" | "attention" | "critical" | "inactive";

export type AlertSeverity = "info" | "warning" | "high" | "critical";

export type AlertCategory =
  | "health"
  | "behavior"
  | "location"
  | "device"
  | "environmental"
  | "weather";

export type AlertStatus = "active" | "acknowledged" | "resolved";

export type DeviceStatus = "online" | "offline" | "low-battery" | "maintenance";

export type DeviceType = "ear-tag" | "gateway" | "environmental-sensor";

export type StaffRole =
  | "Owner"
  | "Farm Manager"
  | "Operational"
  | "Staff"
  | "Veterinarian"
  | "Cooperative Admin"
  | "Viewer";

export type StaffStatus = "active" | "invited" | "disabled";

export interface Farm {
  id: string;
  name: string;
  location: string;
  region: string;
  manager: string;
  image: string;
  status: "active" | "inactive";
  livestockCount: number;
  barnCount: number;
  healthScore: number;
  deviceCoverage: number;
  activeAlerts: number;
  staffCount: number;
  capacity: number;
}

export interface Barn {
  id: string;
  name: string;
  farmId: string;
  capacity: number;
  occupancy: number;
  healthScore: number;
  temperature: number;
  humidity: number;
  alertCount: number;
  manager: string;
}

export interface Livestock {
  id: string;
  code: string;
  name: string;
  earTagId: string;
  photo: string;
  type: string;
  breed: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  ageMonths: number;
  weightKg: number;
  bodyConditionScore: number;
  farmId: string;
  barnId: string;
  herdGroup: string;
  healthStatus: HealthStatus;
  healthScore: number;
  temperature: number;
  heartRate: number;
  activityLevel: number;
  oxygenLevel: number;
  deviceId: string | null;
  deviceStatus: DeviceStatus | "unassigned";
  batteryLevel: number;
  lastUpdate: string;
  location: { lat: number; lng: number };
  vaccinationStatus: "up-to-date" | "due" | "overdue";
  arrivalDate: string;
  acquisitionSource: string;
  notes: Localized;
  /** Archived animals are hidden from lists, charts and the map but kept for records. */
  archived?: boolean;
}

export interface AlertNote {
  id: string;
  text: string;
  author: string;
  /** ISO timestamp. */
  createdAt: string;
}

export interface Alert {
  id: string;
  title: Localized;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  livestockId: string;
  farmId: string;
  barnId: string;
  detectedAt: string;
  assignedTo: string | null;
  description: Localized;
  aiConfidence: number;
  aiCause: Localized;
  /** Canonical English action labels, localized at render with `tt("action", ...)`. */
  recommendations: string[];
  dataAtDetection: {
    temperature: number;
    heartRate: number;
    activity: number;
    oxygen: number;
  };
  notes?: AlertNote[];
  /** ISO timestamps recorded when the alert changes state in the app. */
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  assignedLivestockId: string | null;
  farmId: string;
  battery: number;
  signal: number;
  firmware: string;
  lastSync: string;
  uptime: number;
  dataPackets: number;
  /** Events recorded in the app (restarts, diagnostics...), newest first. */
  events?: DeviceEvent[];
  maintenanceLog?: { id: string; note: string; by: string; at: string }[];
}

export interface DeviceEvent {
  id: string;
  type: "connected" | "data-sent" | "warning" | "firmware-updated" | "offline";
  message: Localized;
  /** ISO timestamp. */
  at: string;
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  type: "connected" | "data-sent" | "warning" | "firmware-updated" | "offline";
  message: Localized;
  timestamp: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: StaffRole;
  farmId: string;
  status: StaffStatus;
  lastActive: string;
  tasksAssigned: number;
  alertsAssigned: number;
  resolutionRate: number;
}

export interface AIInsight {
  id: string;
  priority: "low" | "medium" | "high";
  category: "health" | "behavior" | "environment" | "productivity" | "devices";
  title: Localized;
  summary: Localized;
  affectedLivestock: string[];
  confidence: number;
  recommendation: Localized;
  generatedAt: string;
  reviewed: boolean;
  /** Hidden from the insight feed by the user. */
  dismissed?: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  actor?: string;
}
