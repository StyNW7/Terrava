import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSettings } from "@/hooks/useSettings";

interface DashboardContextValue {
  selectedFarmId: string;
  setSelectedFarmId: (farmId: string) => void;
  /** Canonical date-range value; the header renders it through `t()`. */
  dateRangeLabel: string;
  setDateRangeLabel: (label: string) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [selectedFarmId, setSelectedFarmId] = useState(settings.farm.defaultFarmId || "all");
  const [dateRangeLabel, setDateRangeLabel] = useState("last-30-days");

  const value = useMemo(
    () => ({ selectedFarmId, setSelectedFarmId, dateRangeLabel, setDateRangeLabel }),
    [selectedFarmId, dateRangeLabel]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardFilters() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboardFilters must be used within DashboardProvider");
  return context;
}
