import toast from "react-hot-toast";
import { SettingsSection, SettingsField, settingsInputClass } from "@/components/settings/SettingsField";
import UserAvatar from "@/components/dashboard/UserAvatar";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileTab({ onDirty }: { onDirty: () => void }) {
  const { user, updateUser } = useAuth();

  return (
    <SettingsSection title="Profile" description="Kelola informasi akun dan preferensi bahasa Anda.">
      <div className="sm:col-span-2 flex items-center gap-4">
        <UserAvatar initials={user?.initials ?? "TV"} size="lg" online={false} />
        <div>
          <button
            type="button"
            onClick={() => toast.success("Unggah avatar tersedia pada versi produksi.")}
            className="rounded-xl border border-terrava-border px-4 py-2 text-sm font-medium text-terrava-text transition-colors hover:bg-terrava-bg"
          >
            Change Avatar
          </button>
          <p className="mt-1.5 text-xs text-terrava-muted">PNG atau JPG, maksimal 2 MB.</p>
        </div>
      </div>
      <SettingsField label="Name">
        <input
          key={user?.id}
          defaultValue={user?.name ?? ""}
          onChange={(event) => {
            onDirty();
            const name = event.target.value.trim();
            if (name) updateUser({ name });
          }}
          className={settingsInputClass}
        />
      </SettingsField>
      <SettingsField label="Email">
        <input type="email" key={user?.email} defaultValue={user?.email ?? ""} onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Phone">
        <input defaultValue="+62 812 3456 7890" onChange={onDirty} className={settingsInputClass} />
      </SettingsField>
      <SettingsField label="Role">
        <input value={user?.role ?? "Farm Owner"} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
      </SettingsField>
      <SettingsField label="Farm">
        <input value={user?.farmName ?? ""} readOnly disabled className={`${settingsInputClass} bg-terrava-bg text-terrava-muted`} />
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
