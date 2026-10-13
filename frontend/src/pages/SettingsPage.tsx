import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import Tabs from "@/components/dashboard/Tabs";
import ProfileTab from "@/components/settings/ProfileTab";
import FarmSettingsTab from "@/components/settings/FarmSettingsTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import AlertThresholdsTab from "@/components/settings/AlertThresholdsTab";
import AppearanceTab from "@/components/settings/AppearanceTab";
import SecurityTab from "@/components/settings/SecurityTab";
import DataPrivacyTab from "@/components/settings/DataPrivacyTab";
import type { SettingsDraft, UpdateDraft } from "@/components/settings/settingsDraft";
import { useLanguage } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/data/demoAccounts";

const tabKeys = ["profile", "farm", "notifications", "thresholds", "appearance", "security", "privacy"];
const tabValues = new Set(tabKeys);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPage() {
  const { t } = useLanguage();
  const { settings, saveSettings } = useSettings();
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = requestedTab && tabValues.has(requestedTab) ? requestedTab : "profile";

  const saved = useMemo<SettingsDraft>(
    () => ({ ...settings, account: { name: user?.name ?? "", email: user?.email ?? "" } }),
    [settings, user?.name, user?.email]
  );
  const [draft, setDraft] = useState<SettingsDraft>(saved);
  // Sessions are revoked immediately, so the draft always mirrors the saved list.
  const comparable = (value: SettingsDraft) => JSON.stringify({ ...value, security: { ...value.security, sessions: [] } });
  const isDirty = comparable(draft) !== comparable(saved);

  useEffect(() => {
    document.title = "Settings | Terrava";
  }, []);

  // Warn before leaving the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const update = useCallback<UpdateDraft>((section, patch) => {
    setDraft((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
  }, []);

  const setActiveTab = (value: string) => {
    setSearchParams(value === "profile" ? {} : { tab: value }, { replace: true });
  };

  const handleSave = () => {
    const name = draft.account.name.trim();
    const email = draft.account.email.trim().toLowerCase();
    if (name.length < 2) {
      toast.error(t("settings.error.name"));
      setActiveTab("profile");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      toast.error(t("validation.emailFormat"));
      setActiveTab("profile");
      return;
    }
    const th = draft.thresholds;
    if (th.tempLow >= th.tempHigh) {
      toast.error(t("settings.error.tempRange"));
      setActiveTab("thresholds");
      return;
    }
    const { account, ...prefs } = draft;
    void account;
    saveSettings({ ...prefs, security: { ...prefs.security, sessions: settings.security.sessions } });
    if (name !== user?.name || email !== user?.email) updateUser({ name, email, initials: getInitials(name) });
    toast.success(t("settings.saved"));
  };

  const discard = () => setDraft(saved);

  const tabs = tabKeys.map((value) => ({ value, label: t("settings.tab." + value) }));
  const props = { draft, update };

  return (
    <div className="pb-6">
      <PageHeader title={t("nav.item.settings")} subtitle={t("settings.subtitle")} />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && <ProfileTab {...props} />}
      {activeTab === "farm" && <FarmSettingsTab {...props} />}
      {activeTab === "notifications" && <NotificationsTab {...props} />}
      {activeTab === "thresholds" && <AlertThresholdsTab {...props} />}
      {activeTab === "appearance" && <AppearanceTab {...props} />}
      {activeTab === "security" && <SecurityTab {...props} />}
      {activeTab === "privacy" && <DataPrivacyTab {...props} />}

      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="sticky bottom-4 z-40 mt-6"
          >
            <div className="glass flex flex-col gap-3 rounded-2xl px-4 py-3.5 shadow-lift sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-terrava-text">{t("settings.unsavedChanges")}</p>
              <div className="flex gap-2.5">
                <button type="button" onClick={discard} className="rounded-xl border border-terrava-border bg-white px-4 py-2 text-sm font-semibold text-terrava-text transition-colors hover:bg-terrava-bg">
                  {t("settings.discard")}
                </button>
                <button type="button" onClick={handleSave} className="rounded-xl bg-terrava-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terrava-hover">
                  {t("common.saveChanges")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
