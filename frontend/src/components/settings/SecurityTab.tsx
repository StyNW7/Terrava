import toast from "react-hot-toast";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";

const sessions = [
  { id: "1", device: "Chrome - Windows", location: "Boyolali, Indonesia", lastActive: "Aktif sekarang" },
  { id: "2", device: "Terrava Mobile App", location: "Boyolali, Indonesia", lastActive: "2 jam lalu" },
];

const loginHistory = [
  { id: "1", label: "Login berhasil dari Chrome - Windows", timestamp: "Hari ini, 08.12" },
  { id: "2", label: "Login berhasil dari Terrava Mobile App", timestamp: "Kemarin, 19.40" },
];

export default function SecurityTab({ onDirty }: { onDirty: () => void }) {
  return (
    <div className="space-y-6">
      <SettingsSection title="Change Password" description="Perbarui password secara berkala untuk menjaga keamanan akun.">
        <SettingsField label="Current Password">
          <input type="password" onChange={onDirty} className={settingsInputClass} />
        </SettingsField>
        <SettingsField label="New Password">
          <input type="password" onChange={onDirty} className={settingsInputClass} />
        </SettingsField>
      </SettingsSection>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Two-Factor Authentication</h3>
        <SettingsToggleRow label="Enable 2FA" description="Tambahkan lapisan keamanan ekstra saat masuk" checked={false} onChange={onDirty as unknown as (v: boolean) => void} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Active Sessions</h3>
        <ul className="space-y-2.5">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between rounded-xl bg-terrava-bg px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-terrava-text">{session.device}</p>
                <p className="text-xs text-terrava-muted">{session.location} &middot; {session.lastActive}</p>
              </div>
              <button onClick={() => toast.success("Sesi berhasil diakhiri.")} className="text-xs font-semibold text-terrava-error">
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Login History</h3>
        <ul className="space-y-2 text-sm text-terrava-text">
          {loginHistory.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.label}</span>
              <span className="text-xs text-terrava-muted">{item.timestamp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
