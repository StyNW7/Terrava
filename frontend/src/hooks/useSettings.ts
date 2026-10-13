import { useCallback, useContext } from "react";
import { SettingsContext } from "@/context/settings-context";

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider.");
  return context;
}

/** Formatters that respect the temperature/weight units chosen in Settings. */
export function useUnits() {
  const { settings } = useSettings();
  const { temperatureUnit, weightUnit } = settings.farm;

  const formatTemp = useCallback(
    (celsius: number) => (temperatureUnit === "fahrenheit" ? `${(celsius * 1.8 + 32).toFixed(1)}°F` : `${celsius.toFixed(1)}°C`),
    [temperatureUnit]
  );
  const formatWeight = useCallback((kg: number) => (weightUnit === "lb" ? `${Math.round(kg * 2.20462)} lb` : `${kg} kg`), [weightUnit]);

  return { formatTemp, formatWeight, temperatureUnit, weightUnit };
}
