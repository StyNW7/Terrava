import toast from "react-hot-toast";
import { Download, Trash2 } from "lucide-react";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";
import { useLanguage } from "@/hooks/useLanguage";

export default function DataPrivacyTab({ onDirty }: { onDirty: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <SettingsSection title={t("settings.privacy.retention")} description={t("settings.privacy.retentionDescription")}>
        <SettingsField label={t("settings.privacy.farmRetention")}>
          <select defaultValue="12" onChange={onDirty} className={settingsInputClass}>
            <option value="6">{t("settings.privacy.months", { count: 6 })}</option>
            <option value="12">{t("settings.privacy.months", { count: 12 })}</option>
            <option value="24">{t("settings.privacy.months", { count: 24 })}</option>
            <option value="unlimited">{t("settings.privacy.unlimited")}</option>
          </select>
        </SettingsField>
      </SettingsSection>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.privacy.consent")}</h3>
        <SettingsToggleRow
          label={t("settings.privacy.aiConsent")}
          description={t("settings.privacy.aiConsentDescription")}
          checked={true}
          onChange={onDirty as unknown as (v: boolean) => void}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.privacy.exportData")}</h3>
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.exportDescription")}</p>
        <button onClick={() => toast.success(t("settings.privacy.exportRequested"))} className="flex items-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
          <Download className="h-4 w-4" aria-hidden="true" />
          {t("settings.privacy.exportButton")}
        </button>
      </div>

      <div className="rounded-2xl border border-terrava-error/30 bg-terrava-error/5 p-6">
        <h3 className="mb-2 text-base font-semibold text-terrava-error">{t("settings.privacy.deleteAccount")}</h3>
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.deleteDescription")}</p>
        <button onClick={() => toast.success(t("settings.privacy.deleteRequested"))} className="flex items-center gap-2 rounded-xl bg-terrava-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-error/90">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t("settings.privacy.deleteAccount")}
        </button>
      </div>
    </div>
  );
}
