import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import { farms } from "@/data/mockFarms";

export default function FarmSettingsTab({ onDirty }: { onDirty: () => void }) {
  return (
    <SettingsSection title="Farm Settings" description="Atur preferensi default untuk seluruh peternakan Anda.">
      <SettingsField label="Default Farm">
        <select defaultValue={farms[0].id} onChange={onDirty} className={settingsInputClass}>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </SettingsField>
      <SettingsField label="Measurement Units">
        <select defaultValue="metric" onChange={onDirty} className={settingsInputClass}>
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
      </SettingsField>
      <SettingsField label="Livestock Naming Format">
        <select defaultValue="code" onChange={onDirty} className={settingsInputClass}>
          <option value="code">Code (TRV-001)</option>
          <option value="name">Name</option>
        </select>
      </SettingsField>
      <SettingsField label="Date Format">
        <select defaultValue="dd-mm-yyyy" onChange={onDirty} className={settingsInputClass}>
          <option value="dd-mm-yyyy">DD-MM-YYYY</option>
          <option value="mm-dd-yyyy">MM-DD-YYYY</option>
        </select>
      </SettingsField>
      <SettingsField label="Temperature Unit">
        <select defaultValue="celsius" onChange={onDirty} className={settingsInputClass}>
          <option value="celsius">Celsius</option>
          <option value="fahrenheit">Fahrenheit</option>
        </select>
      </SettingsField>
      <SettingsField label="Weight Unit">
        <select defaultValue="kg" onChange={onDirty} className={settingsInputClass}>
          <option value="kg">Kilogram</option>
          <option value="lb">Pound</option>
        </select>
      </SettingsField>
    </SettingsSection>
  );
}
