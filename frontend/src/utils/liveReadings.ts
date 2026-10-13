import type { Livestock } from "@/types/dashboard";
import type { AppSettings } from "@/context/settings-context";

export interface LiveReading {
  temperature: number;
  heartRate: number;
  activity: number;
  battery: number;
}

export type Breach = "tempHigh" | "tempLow" | "heartRate" | "activity" | "battery";

/** Small deterministic pseudo-random number in [-1, 1] for an id and tick. */
function noise(id: string, tick: number, salt: number) {
  let hash = 2166136261 ^ (tick * 31 + salt);
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 2001) / 1000 - 1;
}

/**
 * Simulated sensor stream: each tick nudges an animal's vitals around its
 * recorded baseline, the way a live ear-tag feed would fluctuate.
 */
export function liveReading(animal: Livestock, tick: number): LiveReading {
  if (tick === 0 || !animal.deviceId) {
    return { temperature: animal.temperature, heartRate: animal.heartRate, activity: animal.activityLevel, battery: animal.batteryLevel };
  }
  return {
    temperature: Math.round((animal.temperature + noise(animal.id, tick, 1) * 0.15) * 10) / 10,
    heartRate: Math.max(30, Math.round(animal.heartRate + noise(animal.id, tick, 2) * 3)),
    activity: Math.min(100, Math.max(0, Math.round(animal.activityLevel + noise(animal.id, tick, 3) * 4))),
    // Batteries only ever drain, a fraction of a percent per tick.
    battery: Math.max(0, Math.round(animal.batteryLevel - tick * 0.02)),
  };
}

/** Which thresholds from Settings a reading crosses. */
export function findBreaches(reading: LiveReading, thresholds: AppSettings["thresholds"], hasDevice: boolean): Breach[] {
  const breaches: Breach[] = [];
  if (reading.temperature >= thresholds.tempHigh) breaches.push("tempHigh");
  if (reading.temperature <= thresholds.tempLow) breaches.push("tempLow");
  if (reading.heartRate >= thresholds.heartRate) breaches.push("heartRate");
  if (reading.activity <= thresholds.activityDrop) breaches.push("activity");
  if (hasDevice && reading.battery <= thresholds.batteryLow) breaches.push("battery");
  return breaches;
}
