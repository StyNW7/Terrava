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
  notes: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  livestockId: string;
  farmId: string;
  barnId: string;
  detectedAt: string;
  assignedTo: string | null;
  description: string;
  aiConfidence: number;
  aiCause: string;
  recommendations: string[];
  dataAtDetection: {
    temperature: number;
    heartRate: number;
    activity: number;
    oxygen: number;
  };
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
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  type: "connected" | "data-sent" | "warning" | "firmware-updated" | "offline";
  message: string;
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
  title: string;
  summary: string;
  affectedLivestock: string[];
  confidence: number;
  recommendation: string;
  generatedAt: string;
  reviewed: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  actor?: string;
}
