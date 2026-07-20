import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";

export default function ProfileTab({ onDirty }: { onDirty: () => void }) {
  return (
    <SettingsSection title="Profile" description="Kelola informasi akun dan preferensi bahasa Anda.">
      <div className="sm:col-span-2 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terrava-light text-lg font-semibold text-terrava-primary">SW</div>
        <button type="button" onClick={onDirty} className="rounded-xl border border-terrava-border px-4 py-2 text-sm font-medium text-terrava-text hover:bg-terrava-bg">
          Change Avatar
        </button>
      </div>
      <SettingsField label="Name">
        <input defaultValue="Stanley Wijaya" onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Email">
        <input type="email" defaultValue="stanley.wijaya@terrava.id" onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Phone">
        <input defaultValue="+62 812 3456 7890" onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Role">
        <input defaultValue="Farm Owner" disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label="Language">
        <select defaultValue="id" onChange={onDirty} className={settingsInputClass}>
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </SettingsField>
      <SettingsField label="Timezone">
        <select defaultValue="wib" onChange={onDirty} className={settingsInputClass}>
          <option value="wib">WIB (UTC+7)</option>
          <option value="wita">WITA (UTC+8)</option>
          <option value="wit">WIT (UTC+9)</option>
        </select>
      </SettingsField>
    </SettingsSection>
  );
}
