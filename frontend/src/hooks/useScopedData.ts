import { useMemo } from "react";
import { useDataStore } from "@/hooks/useDataStore";
import { useDashboardFilters } from "@/context/DashboardContext";

/** Store data narrowed to the farm picked in the dashboard header ("All farms" by default). */
export function useScopedData() {
  const store = useDataStore();
  const { selectedFarmId } = useDashboardFilters();

  return useMemo(() => {
    const inFarm = (farmId: string) => selectedFarmId === "all" || farmId === selectedFarmId;
    const livestock = store.activeLivestock.filter((animal) => inFarm(animal.farmId));
    const livestockIds = new Set(livestock.map((animal) => animal.id));
    return {
      farmId: selectedFarmId,
      farm: selectedFarmId === "all" ? undefined : store.getFarmById(selectedFarmId),
      livestock,
      alerts: store.alerts.filter((alert) => inFarm(alert.farmId)),
      devices: store.devices.filter((device) => inFarm(device.farmId)),
      tasks: store.tasks.filter((task) => inFarm(task.farmId)),
      insights: store.insights.filter((insight) => selectedFarmId === "all" || insight.affectedLivestock.some((id) => livestockIds.has(id))),
    };
  }, [store, selectedFarmId]);
}
