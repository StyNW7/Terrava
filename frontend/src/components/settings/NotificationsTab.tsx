import { SettingsToggleRow } from "@/components/settings/SettingsField";
import type { SettingsTabProps } from "@/components/settings/settingsDraft";
import { useLanguage } from "@/hooks/useLanguage";

type Key = keyof SettingsTabProps["draft"]["notifications"];

const rows: { key: Key; description?: string }[] = [
  { key: "inApp" },
  { key: "email" },
  { key: "whatsapp" },
  { key: "criticalAlerts", description: "settings.notifications.criticalAlertsDescription" },
  { key: "deviceAlerts" },
  { key: "weatherAlerts" },
  { key: "dailySummary" },
  { key: "weeklyReport" },
];

export default function NotificationsTab({ draft, update }: SettingsTabProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6">
      <h3 className="mb-1 text-base font-semibold text-terrava-text">{t("settings.tab.notifications")}</h3>
      <p className="mb-4 text-sm text-terrava-muted">{t("settings.notifications.description")}</p>
      <div className="divide-y divide-terrava-border">
        {rows.map((row) => (
          <SettingsToggleRow
            key={row.key}
            label={t("settings.notifications." + row.key)}
            description={row.description ? t(row.description) : undefined}
            checked={draft.notifications[row.key]}
            onChange={(value) => update("notifications", { [row.key]: value })}
          />
        ))}
      </div>
    </div>
  );
}
