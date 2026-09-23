import { useEffect, useState } from "react";
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
import { useLanguage } from "@/hooks/useLanguage";

const tabKeys = ["profile", "farm", "notifications", "thresholds", "appearance", "security", "privacy"];

const tabValues = new Set(tabKeys);

export default function SettingsPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = requestedTab && tabValues.has(requestedTab) ? requestedTab : "profile";
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    document.title = "Settings | Terrava";
  }, []);

  const setActiveTab = (value: string) => {
    setSearchParams(value === "profile" ? {} : { tab: value }, { replace: true });
  };

  const markDirty = () => setIsDirty(true);

  const handleSave = () => {
    setIsDirty(false);
    toast.success(t("settings.saved"));
  };

  const tabs = tabKeys.map((value) => ({ value, label: t("settings.tab." + value) }));

  return (
    <div className="pb-6">
      <PageHeader title={t("nav.item.settings")} subtitle={t("settings.subtitle")} />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && <ProfileTab onDirty={markDirty} />}
      {activeTab === "farm" && <FarmSettingsTab onDirty={markDirty} />}
      {activeTab === "notifications" && <NotificationsTab onDirty={markDirty} />}
      {activeTab === "thresholds" && <AlertThresholdsTab onDirty={markDirty} />}
      {activeTab === "appearance" && <AppearanceTab onDirty={markDirty} />}
      {activeTab === "security" && <SecurityTab onDirty={markDirty} />}
      {activeTab === "privacy" && <DataPrivacyTab onDirty={markDirty} />}

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
                <button onClick={() => setIsDirty(false)} className="rounded-xl border border-terrava-border bg-white px-4 py-2 text-sm font-semibold text-terrava-text transition-colors hover:bg-terrava-bg">
                  {t("settings.discard")}
                </button>
                <button onClick={handleSave} className="rounded-xl bg-terrava-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terrava-hover">
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
