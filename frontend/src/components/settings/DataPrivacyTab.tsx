import toast from "react-hot-toast";
import { Download, Trash2 } from "lucide-react";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";

export default function DataPrivacyTab({ onDirty }: { onDirty: () => void }) {
  return (
    <div className="space-y-6">
      <SettingsSection title="Data Retention" description="Atur berapa lama data peternakan disimpan.">
        <SettingsField label="Farm Data Retention">
          <select defaultValue="12" onChange={onDirty} className={settingsInputClass}>
            <option value="6">6 bulan</option>
            <option value="12">12 bulan</option>
            <option value="24">24 bulan</option>
            <option value="unlimited">Tanpa batas</option>
          </select>
        </SettingsField>
      </SettingsSection>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Consent</h3>
        <SettingsToggleRow
          label="Izinkan penggunaan data untuk peningkatan model AI"
          description="Data akan dianonimkan sebelum digunakan"
          checked={true}
          onChange={onDirty as unknown as (v: boolean) => void}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Export Personal Data</h3>
        <p className="mb-3 text-sm text-terrava-muted">Unduh salinan data pribadi dan aktivitas akun Anda.</p>
        <button onClick={() => toast.success("Permintaan ekspor data sedang diproses.")} className="flex items-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
          <Download className="h-4 w-4" aria-hidden="true" />
          Export My Data
        </button>
      </div>

      <div className="rounded-2xl border border-terrava-error/30 bg-terrava-error/5 p-6">
        <h3 className="mb-2 text-base font-semibold text-terrava-error">Delete Account</h3>
        <p className="mb-3 text-sm text-terrava-muted">Tindakan ini akan menghapus akun dan seluruh data terkait secara permanen.</p>
        <button onClick={() => toast.success("Permintaan penghapusan akun telah dikirim ke tim Terrava.")} className="flex items-center gap-2 rounded-xl bg-terrava-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-error/90">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
