import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import { useLanguage } from "@/hooks/useLanguage";

export default function AlertThresholdsTab({ onDirty }: { onDirty: () => void }) {
  const { t } = useLanguage();

  return (
    <SettingsSection title={t("settings.tab.thresholds")} description={t("settings.thresholds.description")}>
      <SettingsField label={t("settings.thresholds.tempHigh")}>
        <input type="number" defaultValue={39.5} step={0.1} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.tempLow")}>
        <input type="number" defaultValue={37.5} step={0.1} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.heartRate")}>
        <input type="number" defaultValue={100} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.activityDrop")}>
        <input type="number" defaultValue={30} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.batteryLow")}>
        <input type="number" defaultValue={20} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.signalWeak")}>
        <input type="number" defaultValue={25} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label={t("settings.thresholds.geofenceDuration")}>
        <input type="number" defaultValue={15} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
    </SettingsSection>
  );
}
