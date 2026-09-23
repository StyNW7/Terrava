import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import { farms } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

export default function FarmSettingsTab({ onDirty }: { onDirty: () => void }) {
  const { t } = useLanguage();

  return (
    <SettingsSection title={t("settings.tab.farm")} description={t("settings.farm.description")}>
      <SettingsField label={t("settings.farm.defaultFarm")}>
        <select defaultValue={farms[0].id} onChange={onDirty} className={settingsInputClass}>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.units")}>
        <select defaultValue="metric" onChange={onDirty} className={settingsInputClass}>
          <option value="metric">{t("settings.farm.metric")}</option>
          <option value="imperial">{t("settings.farm.imperial")}</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.namingFormat")}>
        <select defaultValue="code" onChange={onDirty} className={settingsInputClass}>
          <option value="code">{t("settings.farm.formatCode")}</option>
          <option value="name">{t("settings.farm.formatName")}</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.dateFormat")}>
        <select defaultValue="dd-mm-yyyy" onChange={onDirty} className={settingsInputClass}>
          <option value="dd-mm-yyyy">DD-MM-YYYY</option>
          <option value="mm-dd-yyyy">MM-DD-YYYY</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.temperatureUnit")}>
        <select defaultValue="celsius" onChange={onDirty} className={settingsInputClass}>
          <option value="celsius">Celsius</option>
          <option value="fahrenheit">Fahrenheit</option>
        </select>
      </SettingsField>
      <SettingsField label={t("settings.farm.weightUnit")}>
        <select defaultValue="kg" onChange={onDirty} className={settingsInputClass}>
          <option value="kg">Kilogram</option>
          <option value="lb">Pound</option>
        </select>
      </SettingsField>
    </SettingsSection>
  );
}
