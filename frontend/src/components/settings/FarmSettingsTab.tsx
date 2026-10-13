import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

type FarmPrefs = SettingsTabProps["draft"]["farm"];

export default function FarmSettingsTab({ draft, update }: SettingsTabProps) {
  const { farms } = useDataStore();
  const { t } = useLanguage();
  const prefs = draft.farm;
  const metric = prefs.temperatureUnit === "celsius" && prefs.weightUnit === "kg";

  return (
    <SettingsSection title={t("settings.tab.farm")} description={t("settings.farm.description")}>
      <SettingsField label={t("settings.farm.defaultFarm")}>
        <select value={prefs.defaultFarmId} onChange={(event) => update("farm", { defaultFarmId: event.target.value })} className={settingsInputClass}>
          <option value="all">{t("dashboard.allFarms")}</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.units")}>
        {/* Shortcut that sets both unit fields below. */}
        <select
          value={metric ? "metric" : "imperial"}
          onChange={(event) =>
            update("farm", event.target.value === "metric" ? { temperatureUnit: "celsius", weightUnit: "kg" } : { temperatureUnit: "fahrenheit", weightUnit: "lb" })
          }
          className={settingsInputClass}
        >
          <option value="metric">{t("settings.farm.metric")}</option>
          <option value="imperial">{t("settings.farm.imperial")}</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.namingFormat")}>
        <select value={prefs.namingFormat} onChange={(event) => update("farm", { namingFormat: event.target.value as FarmPrefs["namingFormat"] })} className={settingsInputClass}>
          <option value="code">{t("settings.farm.formatCode")}</option>
          <option value="name">{t("settings.farm.formatName")}</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.dateFormat")}>
        <select value={prefs.dateFormat} onChange={(event) => update("farm", { dateFormat: event.target.value as FarmPrefs["dateFormat"] })} className={settingsInputClass}>
          <option value="dd-mm-yyyy">DD-MM-YYYY</option>
          <option value="mm-dd-yyyy">MM-DD-YYYY</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.temperatureUnit")}>
        <select value={prefs.temperatureUnit} onChange={(event) => update("farm", { temperatureUnit: event.target.value as FarmPrefs["temperatureUnit"] })} className={settingsInputClass}>
          <option value="celsius">Celsius (°C)</option>
          <option value="fahrenheit">Fahrenheit (°F)</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.weightUnit")}>
        <select value={prefs.weightUnit} onChange={(event) => update("farm", { weightUnit: event.target.value as FarmPrefs["weightUnit"] })} className={settingsInputClass}>
          <option value="kg">Kilogram (kg)</option>
          <option value="lb">Pound (lb)</option>
        </select>
      </SettingsField>
      <p className="text-xs text-terrava-muted sm:col-span-2">{t("settings.farm.appliesHint")}</p>
    </SettingsSection>
  );
}
