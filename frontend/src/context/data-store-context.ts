import { createContext } from "react";
import type { AIInsight, Alert, Barn, Device, Farm, Livestock, StaffMember } from "@/types/dashboard";

/** A report the user generated, kept so it can be downloaded again from the history list. */
export interface GeneratedReport {
  id: string;
  reportType: string;
  format: "pdf" | "csv";
  generatedAt: string; // ISO timestamp
  filters: ReportFilters;
}

export interface ReportFilters {
  farmId: string;
  livestockType: string;
  health: string;
  compare: "previous-period" | "previous-year";
}

export interface ReportSchedule {
  reportType: string;
  frequency: "daily" | "weekly" | "monthly";
  /** 1-7 (Mon-Sun) for weekly, 1-28 for monthly; unused for daily. */
  day: number;
  time: string; // HH:mm
  format: "pdf" | "csv";
  recipients: string[];
  createdAt: string;
}

export interface FarmTask {
  id: string;
  /** Free text typed by the user; seeded tasks use `titleKey` so they follow the language. */
  title?: string;
  titleKey?: string;
  kind: "vaccination" | "vet" | "weighing" | "inspection" | "follow-up";
  farmId: string;
  assignee: string;
  /** YYYY-MM-DD */
  dueDate: string;
  done: boolean;
  source?: { type: "alert" | "insight"; id: string };
  createdAt: string;
}

export interface DataState {
  version: number;
  farms: Farm[];
  barns: Barn[];
  livestock: Livestock[];
  alerts: Alert[];
  devices: Device[];
  staff: StaffMember[];
  insights: AIInsight[];
  tasks: FarmTask[];
  reportHistory: GeneratedReport[];
  reportSchedules: ReportSchedule[];
}

export interface DataStoreContextValue extends DataState {
  /** Livestock that has not been archived; what every list and chart should show. */
  activeLivestock: Livestock[];

  getFarmById: (id: string) => Farm | undefined;
  getBarnById: (id: string) => Barn | undefined;
  getBarnsByFarm: (farmId: string) => Barn[];
  getLivestockById: (id: string) => Livestock | undefined;
  getLivestockByFarm: (farmId: string) => Livestock[];
  getDeviceById: (id: string) => Device | undefined;
  getAlertById: (id: string) => Alert | undefined;

  updateAlerts: (ids: string[], patch: Partial<Alert>) => void;
  addAlertNote: (id: string, text: string, author: string) => void;

  addLivestock: (animal: Livestock) => void;
  updateLivestock: (ids: string[], patch: Partial<Livestock>) => void;
  /** Pair a device with an animal, releasing it from any previous owner. */
  assignDevice: (livestockId: string, deviceId: string | null) => void;

  updateDevices: (ids: string[], patch: Partial<Device>) => void;
  /** Functional update for a single device (append events, toggle status...). */
  mutateDevice: (id: string, recipe: (device: Device) => Partial<Device>) => void;

  addFarm: (farm: Farm, barns: Barn[]) => void;
  updateFarm: (id: string, patch: Partial<Farm>) => void;
  addBarn: (barn: Barn) => void;

  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;

  updateInsight: (id: string, patch: Partial<AIInsight>) => void;

  addTask: (task: FarmTask) => void;
  updateTask: (id: string, patch: Partial<FarmTask>) => void;

  addReportHistory: (entry: GeneratedReport) => void;
  setReportSchedule: (schedule: ReportSchedule) => void;
  removeReportSchedule: (reportType: string) => void;

  /** Restore the original demo dataset. */
  resetDemoData: () => void;
}

export const DATA_STORE_KEY = "terrava-demo-data";

export const DataStoreContext = createContext<DataStoreContextValue | undefined>(undefined);
