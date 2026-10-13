import type { DataStoreContextValue } from "@/context/data-store-context";

export interface FarmStats {
  livestock: number;
  barns: number;
  capacity: number;
  occupancy: number;
  healthScore: number;
  activeAlerts: number;
  deviceCoverage: number;
  staff: number;
}

type StatsSource = Pick<DataStoreContextValue, "activeLivestock" | "barns" | "alerts" | "staff">;

/** Live figures for a farm, derived from the current data instead of the seeded counters. */
export function computeFarmStats(farmId: string, data: StatsSource): FarmStats {
  const animals = data.activeLivestock.filter((animal) => animal.farmId === farmId);
  const barns = data.barns.filter((barn) => barn.farmId === farmId);
  const withDevice = animals.filter((animal) => animal.deviceId).length;
  return {
    livestock: animals.length,
    barns: barns.length,
    capacity: barns.reduce((sum, barn) => sum + barn.capacity, 0),
    occupancy: barns.reduce((sum, barn) => sum + barn.occupancy, 0),
    healthScore: animals.length ? Math.round(animals.reduce((sum, animal) => sum + animal.healthScore, 0) / animals.length) : 0,
    activeAlerts: data.alerts.filter((alert) => alert.farmId === farmId && alert.status !== "resolved").length,
    deviceCoverage: animals.length ? Math.round((withDevice / animals.length) * 100) : 0,
    staff: data.staff.filter((member) => member.farmId === farmId && member.status !== "disabled").length,
  };
}
