import { useState } from "react";
import { SettingsToggleRow } from "@/components/settings/SettingsField";

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
  const [toggles, setToggles] = useState(defaultToggles);

  const update = (key: keyof typeof defaultToggles) => (value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
    onDirty();
  };

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6">
      <h3 className="mb-1 text-base font-semibold text-terrava-text">Notifications</h3>
      <p className="mb-4 text-sm text-terrava-muted">Atur bagaimana dan kapan Anda menerima notifikasi.</p>
      <div className="divide-y divide-terrava-border">
        <SettingsToggleRow label="In-App Notifications" checked={toggles.inApp} onChange={update("inApp")} />
        <SettingsToggleRow label="Email Notifications" checked={toggles.email} onChange={update("email")} />
        <SettingsToggleRow label="WhatsApp Notifications" checked={toggles.whatsapp} onChange={update("whatsapp")} />
        <SettingsToggleRow label="Critical Alerts" description="Selalu aktif untuk kondisi darurat" checked={toggles.criticalAlerts} onChange={update("criticalAlerts")} />
        <SettingsToggleRow label="Device Alerts" checked={toggles.deviceAlerts} onChange={update("deviceAlerts")} />
        <SettingsToggleRow label="Weather Alerts" checked={toggles.weatherAlerts} onChange={update("weatherAlerts")} />
        <SettingsToggleRow label="Daily Summary" checked={toggles.dailySummary} onChange={update("dailySummary")} />
        <SettingsToggleRow label="Weekly Report" checked={toggles.weeklyReport} onChange={update("weeklyReport")} />
      </div>
    </div>
  );
}
