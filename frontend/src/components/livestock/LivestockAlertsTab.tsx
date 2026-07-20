import { useState } from "react";
import { Link } from "react-router-dom";
import type { Livestock } from "@/types/dashboard";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { alerts } from "@/data/mockAlerts";

export default function LivestockAlertsTab({ animal }: { animal: Livestock }) {
  const [severity, setSeverity] = useState("all");
  const relatedAlerts = alerts.filter((alert) => alert.livestockId === animal.id && (severity === "all" || alert.severity === severity));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <FilterSelect
          label="Severity"
          value={severity}
          onChange={setSeverity}
          options={[
            { value: "info", label: "Info" },
            { value: "warning", label: "Warning" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
        />
      </div>
      {relatedAlerts.length === 0 ? (
        <EmptyState title="Tidak ada alert" description="Ternak ini tidak memiliki riwayat alert pada filter yang dipilih." />
      ) : (
        <div className="space-y-2.5">
          {relatedAlerts.map((alert) => (
            <Link key={alert.id} to={`/dashboard/alerts/${alert.id}`} className="flex items-center justify-between rounded-2xl border border-terrava-border bg-white p-4 hover:bg-terrava-bg">
              <div>
                <p className="text-sm font-medium text-terrava-text">{alert.title}</p>
                <p className="text-xs text-terrava-muted">{alert.detectedAt} &middot; {alert.status}</p>
              </div>
              <SeverityBadge severity={alert.severity} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
