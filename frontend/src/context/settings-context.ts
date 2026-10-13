import { createContext } from "react";

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  /** ISO timestamp of the last activity; the current session is always "now". */
  lastActive: string;
  current?: boolean;
}

export interface AppSettings {
  profile: { phone: string; timezone: "wib" | "wita" | "wit"; avatarUrl: string | null };
  farm: {
    defaultFarmId: string;
    namingFormat: "code" | "name";
    dateFormat: "dd-mm-yyyy" | "mm-dd-yyyy";
    temperatureUnit: "celsius" | "fahrenheit";
    weightUnit: "kg" | "lb";
  };
  notifications: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
    criticalAlerts: boolean;
    deviceAlerts: boolean;
    weatherAlerts: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
  };
  thresholds: {
    tempHigh: number;
    tempLow: number;
    heartRate: number;
    activityDrop: number;
    batteryLow: number;
    signalWeak: number;
    geofenceDuration: number;
  };
  appearance: { compact: boolean; sidebarExpanded: boolean; animations: boolean };
  privacy: { retention: "6" | "12" | "24" | "unlimited"; aiConsent: boolean };
  security: { twoFactor: boolean; sessions: ActiveSession[] };
}

export const defaultSettings: AppSettings = {
  profile: { phone: "+62 812 3456 7890", timezone: "wib", avatarUrl: null },
  farm: { defaultFarmId: "all", namingFormat: "code", dateFormat: "dd-mm-yyyy", temperatureUnit: "celsius", weightUnit: "kg" },
  notifications: {
    inApp: true,
    email: true,
    whatsapp: false,
    criticalAlerts: true,
    deviceAlerts: true,
    weatherAlerts: false,
    dailySummary: true,
    weeklyReport: false,
  },
  thresholds: { tempHigh: 39.5, tempLow: 37.5, heartRate: 100, activityDrop: 30, batteryLow: 20, signalWeak: 25, geofenceDuration: 15 },
  appearance: { compact: false, sidebarExpanded: true, animations: true },
  privacy: { retention: "12", aiConsent: true },
  security: {
    twoFactor: false,
    sessions: [
      { id: "current", device: "Chrome - Windows", location: "Boyolali, Indonesia", lastActive: new Date().toISOString(), current: true },
      { id: "mobile", device: "Terrava Mobile App", location: "Boyolali, Indonesia", lastActive: new Date(Date.now() - 2 * 3600_000).toISOString() },
      { id: "tablet", device: "Safari - iPad", location: "Semarang, Indonesia", lastActive: new Date(Date.now() - 3 * 86_400_000).toISOString() },
    ],
  },
};

export interface SettingsContextValue {
  settings: AppSettings;
  saveSettings: (next: AppSettings) => void;
  resetSettings: () => void;
}

export const SETTINGS_STORAGE_KEY = "terrava-settings";
export const SIDEBAR_STORAGE_KEY = "terrava-dashboard-sidebar-collapsed";

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
