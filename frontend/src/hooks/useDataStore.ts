import { useContext } from "react";
import { DataStoreContext } from "@/context/data-store-context";

/** Shared demo data (livestock, alerts, devices, team...) with actions that persist across pages. */
export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error("useDataStore must be used within a DataStoreProvider.");
  }
  return context;
}
