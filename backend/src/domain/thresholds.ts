/**
 * Alert thresholds, the same fields as Settings -> Alert Thresholds in the
 * dashboard (AppSettings["thresholds"]). Stored per organization.
 */
export interface AlertThresholds {
  /** Body temperature (°C) at or above which a fever alert fires. */
  tempHigh: number;
  /** Body temperature (°C) at or below which a hypothermia alert fires. */
  tempLow: number;
  /** Heart rate (bpm) at or above which a tachycardia alert fires. */
  heartRate: number;
  /** Activity drop (%) versus the animal's baseline that counts as abnormal. */
  activityDrop: number;
  /** Battery (%) at or below which a device alert fires. */
  batteryLow: number;
  /** Signal quality (%) at or below which a weak-link alert fires. */
  signalWeak: number;
  /** Minutes outside a geofence before a location alert fires. */
  geofenceDuration: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  tempHigh: 39.5,
  tempLow: 37.5,
  heartRate: 100,
  activityDrop: 30,
  batteryLow: 20,
  signalWeak: 25,
  geofenceDuration: 15,
};

/** Reference physiology for adult cattle, used for scoring and explanations. */
export const CATTLE_NORMALS = {
  temperature: { min: 38.0, max: 39.3 },
  heartRate: { min: 48, max: 84 },
  oxygen: { min: 95, max: 100 },
  activity: { min: 40, max: 100 },
} as const;
