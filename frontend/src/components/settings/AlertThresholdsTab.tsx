import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import { useLanguage } from "@/hooks/useLanguage";
import { defaultSettings } from "@/context/settings-context";

type Key = keyof SettingsTabProps["draft"]["thresholds"];

const fields: { key: Key; label: string; step?: number; min: number; max: number }[] = [
  { key: "tempHigh", label: "settings.thresholds.tempHigh", step: 0.1, min: 38, max: 42 },
  { key: "tempLow", label: "settings.thresholds.tempLow", step: 0.1, min: 35, max: 39 },
  { key: "heartRate", label: "settings.thresholds.heartRate", min: 60, max: 160 },
  { key: "activityDrop", label: "settings.thresholds.activityDrop", min: 5, max: 90 },
  { key: "batteryLow", label: "settings.thresholds.batteryLow", min: 5, max: 50 },
  { key: "signalWeak", label: "settings.thresholds.signalWeak", min: 5, max: 60 },
  { key: "geofenceDuration", label: "settings.thresholds.geofenceDuration", min: 1, max: 120 },
];

export default function AlertThresholdsTab({ draft, update }: SettingsTabProps) {
  const { t } = useLanguage();
  const invalidRange = draft.thresholds.tempLow >= draft.thresholds.tempHigh;

  return (
    <SettingsSection title={t("settings.tab.thresholds")} description={t("settings.thresholds.description")}>
      {fields.map((field) => {
        const value = draft.thresholds[field.key];
        const outOfRange = value < field.min || value > field.max;
        const error = outOfRange || ((field.key === "tempLow" || field.key === "tempHigh") && invalidRange);
        return (
          <SettingsField key={field.key} label={t(field.label)}>
            <input
              type="number"
              value={Number.isFinite(value) ? value : ""}
              step={field.step ?? 1}
              min={field.min}
              max={field.max}
              aria-invalid={error}
              onChange={(event) => update("thresholds", { [field.key]: event.target.value === "" ? NaN : Number(event.target.value) })}
              onBlur={() => {
                // Clamp on blur so a typo never saves an impossible threshold.
                const clamped = Number.isFinite(value) ? Math.min(field.max, Math.max(field.min, value)) : defaultSettings.thresholds[field.key];
                if (clamped !== value) update("thresholds", { [field.key]: clamped });
              }}
              className={`${settingsInputClass} ${error ? "border-terrava-error" : ""}`}
            />
            <p className={`mt-1 text-[11px] ${error ? "text-terrava-error" : "text-terrava-muted"}`}>
              {field.key !== "tempHigh" && field.key !== "tempLow" ? t("settings.thresholds.range", { min: field.min, max: field.max }) : invalidRange ? t("settings.error.tempRange") : t("settings.thresholds.range", { min: field.min, max: field.max })}
            </p>
          </SettingsField>
        );
      })}
      <div className="flex items-end sm:col-span-1">
        <button
          type="button"
          onClick={() => update("thresholds", defaultSettings.thresholds)}
          className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
        >
          {t("settings.thresholds.restoreDefaults")}
        </button>
      </div>
      <p className="text-xs text-terrava-muted sm:col-span-2">{t("settings.thresholds.appliesHint")}</p>
    </SettingsSection>
  );
}
