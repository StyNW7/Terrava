import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";

export default function AlertThresholdsTab({ onDirty }: { onDirty: () => void }) {
  return (
    <SettingsSection title="Alert Thresholds" description="Tentukan ambang batas yang memicu peringatan otomatis.">
      <SettingsField label="Temperature High (°C)">
        <input type="number" defaultValue={39.5} step={0.1} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Temperature Low (°C)">
        <input type="number" defaultValue={37.5} step={0.1} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Heart Rate Threshold (bpm)">
        <input type="number" defaultValue={100} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Activity Drop (%)">
        <input type="number" defaultValue={30} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Battery Low (%)">
        <input type="number" defaultValue={20} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Signal Weak (%)">
        <input type="number" defaultValue={25} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Geofence Duration (minutes)">
        <input type="number" defaultValue={15} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
    </SettingsSection>
  );
}
