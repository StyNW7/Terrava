import { useEffect, useState } from "react";
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

const tabs = [
  { value: "profile", label: "Profile" },
  { value: "farm", label: "Farm Settings" },
  { value: "notifications", label: "Notifications" },
  { value: "thresholds", label: "Alert Thresholds" },
  { value: "appearance", label: "Appearance" },
  { value: "security", label: "Security" },
  { value: "privacy", label: "Data and Privacy" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    document.title = "Settings | Terrava";
  }, []);

  const markDirty = () => setIsDirty(true);

  const handleSave = () => {
    setIsDirty(false);
    toast.success("Settings updated.");
  };

  return (
    <div className="pb-20">
      <PageHeader title="Settings" subtitle="Kelola profil, preferensi farm, dan keamanan akun Anda." />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && <ProfileTab onDirty={markDirty} />}
      {activeTab === "farm" && <FarmSettingsTab onDirty={markDirty} />}
      {activeTab === "notifications" && <NotificationsTab onDirty={markDirty} />}
      {activeTab === "thresholds" && <AlertThresholdsTab onDirty={markDirty} />}
      {activeTab === "appearance" && <AppearanceTab onDirty={markDirty} />}
      {activeTab === "security" && <SecurityTab onDirty={markDirty} />}
      {activeTab === "privacy" && <DataPrivacyTab onDirty={markDirty} />}

      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-terrava-border bg-white/95 px-4 py-3.5 backdrop-blur lg:left-[270px]">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-sm text-terrava-text">Anda memiliki perubahan yang belum disimpan.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setIsDirty(false)} className="rounded-xl border border-terrava-border px-4 py-2 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
                Discard
              </button>
              <button onClick={handleSave} className="rounded-xl bg-terrava-primary px-4 py-2 text-sm font-semibold text-white hover:bg-terrava-hover">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
