import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { SettingsSection, SettingsField, settingsInputClass, SettingsToggleRow } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { downloadJson } from "@/lib/download";
import { fileStamp } from "@/utils/time";
import { PASSWORD_OVERRIDES_KEY } from "@/data/demoAccounts";

type Retention = SettingsTabProps["draft"]["privacy"]["retention"];

export default function DataPrivacyTab({ draft, update }: SettingsTabProps) {
  const { t, lang } = useLanguage();
  const store = useDataStore();
  const { settings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const confirmWord = lang === "id" ? "HAPUS" : "DELETE";

  const exportData = () => {
    const { farms, barns, livestock, alerts, devices, staff, insights, tasks, reportHistory, reportSchedules } = store;
    downloadJson(`terrava-data-export_${fileStamp()}.json`, {
      exportedAt: new Date().toISOString(),
      account: user ? { name: user.name, email: user.email, role: user.role, farmName: user.farmName } : null,
      settings: { ...settings, profile: { ...settings.profile, avatarUrl: settings.profile.avatarUrl ? "[image]" : null } },
      data: { farms, barns, livestock, alerts, devices, staff, insights, tasks, reportHistory, reportSchedules },
    });
    toast.success(t("settings.privacy.exportDone"));
  };

  const deleteAccount = () => {
    store.resetDemoData();
    resetSettings();
    try {
      localStorage.removeItem(PASSWORD_OVERRIDES_KEY);
      localStorage.removeItem("terrava-livestock-draft");
    } catch {
      // ignore
    }
    logout();
    toast.success(t("settings.privacy.deleted"));
    navigate("/", { replace: true });
  };

  return (
    <div className="space-y-6">
      <SettingsSection title={t("settings.privacy.retention")} description={t("settings.privacy.retentionDescription")}>
        <SettingsField label={t("settings.privacy.farmRetention")}>
          <select value={draft.privacy.retention} onChange={(event) => update("privacy", { retention: event.target.value as Retention })} className={settingsInputClass}>
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
          checked={draft.privacy.aiConsent}
          onChange={(value) => update("privacy", { aiConsent: value })}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.privacy.exportData")}</h3>
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.exportDescription")}</p>
        <button type="button" onClick={exportData} className="flex items-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
          <Download className="h-4 w-4" aria-hidden="true" />
          {t("settings.privacy.exportButton")}
        </button>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-2 text-base font-semibold text-terrava-text">{t("settings.privacy.resetDemo")}</h3>
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.resetDemoDescription")}</p>
        <button type="button" onClick={() => setResetOpen(true)} className="flex items-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("settings.privacy.resetDemo")}
        </button>
      </div>

      <div className="rounded-2xl border border-terrava-error/30 bg-terrava-error/5 p-6">
        <h3 className="mb-2 text-base font-semibold text-terrava-error">{t("settings.privacy.deleteAccount")}</h3>
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.deleteDescription")}</p>
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setDeleteOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-terrava-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-error/90"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t("settings.privacy.deleteAccount")}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          store.resetDemoData();
          toast.success(t("settings.privacy.resetDone"));
        }}
        title={t("settings.privacy.resetDemo")}
        description={t("settings.privacy.resetConfirm")}
        confirmLabel={t("common.reset")}
        tone="danger"
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("settings.privacy.deleteAccount")}
        widthClassName="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={confirmText.trim().toUpperCase() !== confirmWord}
              onClick={deleteAccount}
              className="rounded-xl bg-terrava-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-error/90 disabled:opacity-50"
            >
              {t("settings.privacy.deleteForever")}
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-terrava-muted">{t("settings.privacy.deleteConfirm", { word: confirmWord })}</p>
        <input
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={confirmWord}
          aria-label={t("settings.privacy.deleteConfirm", { word: confirmWord })}
          className={settingsInputClass}
          autoFocus
        />
      </Modal>
    </div>
  );
}
