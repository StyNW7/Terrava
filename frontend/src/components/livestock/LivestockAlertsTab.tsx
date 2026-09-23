import { useState } from "react";
import { Link } from "react-router-dom";
import type { Livestock } from "@/types/dashboard";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { alerts } from "@/data/mockAlerts";
import { useLanguage } from "@/hooks/useLanguage";

export default function LivestockAlertsTab({ animal }: { animal: Livestock }) {
  const { t, tr, tRel } = useLanguage();
  const [severity, setSeverity] = useState("all");
  const relatedAlerts = alerts.filter((alert) => alert.livestockId === animal.id && (severity === "all" || alert.severity === severity));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <FilterSelect
          label={t("filter.severity")}
          value={severity}
          onChange={setSeverity}
          options={[
            { value: "info", label: t("severity.info") },
            { value: "warning", label: t("severity.warning") },
            { value: "high", label: t("severity.high") },
            { value: "critical", label: t("severity.critical") },
          ]}
        />
      </div>
      {relatedAlerts.length === 0 ? (
        <EmptyState title={t("alerts.emptyTitle")} description={t("livestock.noAlertsDescription")} />
      ) : (
        <div className="space-y-2.5">
          {relatedAlerts.map((alert) => (
            <Link key={alert.id} to={`/dashboard/alerts/${alert.id}`} className="flex items-center justify-between rounded-2xl border border-terrava-border bg-white p-4 hover:bg-terrava-bg">
              <div>
                <p className="text-sm font-medium text-terrava-text">{tr(alert.title)}</p>
                <p className="text-xs text-terrava-muted">
                  {tRel(alert.detectedAt)} &middot; {t("status." + alert.status)}
                </p>
              </div>
              <SeverityBadge severity={alert.severity} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
