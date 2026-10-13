import { Link } from "react-router-dom";
import { MapPin, Users, HeartPulse, Radio, TriangleAlert } from "lucide-react";
import type { Farm } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { computeFarmStats } from "@/lib/farmStats";

export default function FarmCard({ farm }: { farm: Farm }) {
  const { t } = useLanguage();
  const stats = computeFarmStats(farm.id, useDataStore());

  return (
    <Link
      to={`/dashboard/farms/${farm.id}`}
      className="block overflow-hidden rounded-2xl border border-terrava-border bg-white shadow-card transition-transform hover:-translate-y-1"
    >
      <img src={farm.image} alt={farm.name} className="h-36 w-full object-cover" />
      <div className="p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-terrava-text">
          {farm.name}
          {farm.status === "inactive" && <span className="rounded-full bg-terrava-neutral/15 px-2 py-0.5 text-[10px] font-semibold text-terrava-muted">{t("status.inactive")}</span>}
        </p>
        <p className="mb-3 flex items-center gap-1 text-xs text-terrava-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {farm.location}
        </p>
        <p className="mb-3 flex items-center gap-1 text-xs text-terrava-muted">
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> {farm.manager}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-terrava-bg p-2">
            <p className="font-semibold text-terrava-text">{stats.livestock}</p>
            <p className="text-terrava-muted">{t("nav.item.livestock")}</p>
          </div>
          <div className="rounded-lg bg-terrava-bg p-2">
            <p className="font-semibold text-terrava-text">{stats.barns}</p>
            <p className="text-terrava-muted">{t("farms.tab.barns")}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-2.5 text-xs">
          <span className="flex items-center gap-1 text-terrava-primary">
            <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" /> {stats.healthScore || "–"}
          </span>
          <span className="flex items-center gap-1 text-terrava-info">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" /> {stats.deviceCoverage}%
          </span>
          <span className="flex items-center gap-1 text-terrava-warning">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" /> {stats.activeAlerts}
          </span>
        </div>
      </div>
    </Link>
  );
}
