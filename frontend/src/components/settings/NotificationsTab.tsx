import { useState } from "react";
import { SettingsToggleRow } from "@/components/settings/SettingsField";
import { useLanguage } from "@/hooks/useLanguage";

const defaultToggles = {
  inApp: true,
  email: true,
  whatsapp: false,
  criticalAlerts: true,
  deviceAlerts: true,
  weatherAlerts: false,
  dailySummary: true,
  weeklyReport: false,
};

export default function NotificationsTab({ onDirty }: { onDirty: () => void }) {
  const { t } = useLanguage();
  const [toggles, setToggles] = useState(defaultToggles);

  const update = (key: keyof typeof defaultToggles) => (value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
    onDirty();
  };

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6">
      <h3 className="mb-1 text-base font-semibold text-terrava-text">{t("settings.tab.notifications")}</h3>
      <p className="mb-4 text-sm text-terrava-muted">{t("settings.notifications.description")}</p>
      <div className="divide-y divide-terrava-border">
        <SettingsToggleRow label={t("settings.notifications.inApp")} checked={toggles.inApp} onChange={update("inApp")} />
        <SettingsToggleRow label={t("settings.notifications.email")} checked={toggles.email} onChange={update("email")} />
        <SettingsToggleRow label={t("settings.notifications.whatsapp")} checked={toggles.whatsapp} onChange={update("whatsapp")} />
        <SettingsToggleRow label={t("settings.notifications.criticalAlerts")} description={t("settings.notifications.criticalAlertsDescription")} checked={toggles.criticalAlerts} onChange={update("criticalAlerts")} />
        <SettingsToggleRow label={t("settings.notifications.deviceAlerts")} checked={toggles.deviceAlerts} onChange={update("deviceAlerts")} />
        <SettingsToggleRow label={t("settings.notifications.weatherAlerts")} checked={toggles.weatherAlerts} onChange={update("weatherAlerts")} />
        <SettingsToggleRow label={t("settings.notifications.dailySummary")} checked={toggles.dailySummary} onChange={update("dailySummary")} />
        <SettingsToggleRow label={t("settings.notifications.weeklyReport")} checked={toggles.weeklyReport} onChange={update("weeklyReport")} />
      </div>
    </div>
  );
}
