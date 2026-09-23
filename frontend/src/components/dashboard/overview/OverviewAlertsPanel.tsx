import { Link } from "react-router-dom";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { alerts } from "@/data/mockAlerts";
import { getLivestockById } from "@/data/mockLivestock";
import { useLanguage } from "@/hooks/useLanguage";

export default function OverviewAlertsPanel() {
  const { t, tr, tRel } = useLanguage();
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" || alert.severity === "high").slice(0, 5);

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.criticalAlerts")}</h3>
        <Link to="/dashboard/alerts" className="text-xs font-semibold text-terrava-primary">
          {t("common.viewAll")}
        </Link>
      </div>
      <ul className="space-y-1">
        {criticalAlerts.map((alert) => {
          const animal = getLivestockById(alert.livestockId);
          return (
            <li key={alert.id}>
              <Link to={`/dashboard/alerts/${alert.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 hover:bg-terrava-bg">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-terrava-text">{tr(alert.title)}</p>
                  <p className="truncate text-xs text-terrava-muted">
                    {animal?.name} ({animal?.code}) &middot; {tRel(alert.detectedAt)}
                    {alert.assignedTo ? ` · ${alert.assignedTo}` : ""}
                  </p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
