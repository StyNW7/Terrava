import { Link } from "react-router-dom";
import { BrainCircuit, Syringe } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useUnits } from "@/hooks/useSettings";

export default function LivestockOverviewTab({ animal }: { animal: Livestock }) {
  const { alerts, getFarmById, getBarnById } = useDataStore();
  const { formatWeight } = useUnits();
  const { t, tr, tt } = useLanguage();
  const relatedAlerts = alerts.filter((alert) => alert.livestockId === animal.id).slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-terrava-border bg-terrava-light p-5">
          <div className="mb-2 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">{t("livestock.aiHealthSummary")}</span>
          </div>
          <p className="text-sm text-terrava-dark">
            {t("livestock.aiSummaryText", {
              name: animal.name,
              condition:
                animal.healthStatus === "healthy" ? t("livestock.conditionStable") : t("livestock.conditionWatch"),
              range: animal.healthStatus === "critical" ? t("livestock.outsideRange") : t("livestock.withinRange"),
            })}
          </p>
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">{t("livestock.latestObservations")}</h3>
          <ul className="space-y-2 text-sm text-terrava-text">
            <li>{t("livestock.observation.temperature", { value: animal.temperature })}</li>
            <li>{t("livestock.observation.activity", { value: animal.activityLevel })}</li>
            <li>{t("livestock.observation.oxygen", { value: animal.oxygenLevel })}</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-terrava-text">{t("overview.recentAlerts")}</h3>
            <Link to="#" className="text-xs font-semibold text-terrava-primary">
              {t("common.viewAll")}
            </Link>
          </div>
          {relatedAlerts.length === 0 ? (
            <p className="text-sm text-terrava-muted">{t("livestock.noRecentAlerts")}</p>
          ) : (
            <ul className="space-y-2">
              {relatedAlerts.map((alert) => (
                <li key={alert.id}>
                  <Link to={`/dashboard/alerts/${alert.id}`} className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-terrava-bg">
                    <span className="text-sm text-terrava-text">{tr(alert.title)}</span>
                    <SeverityBadge severity={alert.severity} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("livestock.basicProfile")}</h3>
          <DetailInfoRow label={t("livestock.column.breed")} value={animal.breed} />
          <DetailInfoRow label={t("livestock.column.gender")} value={tt("gender", animal.gender)} />
          <DetailInfoRow label={t("livestock.column.age")} value={t("livestock.months", { count: animal.ageMonths })} />
          <DetailInfoRow label={t("livestock.weight")} value={formatWeight(animal.weightKg)} />
          <DetailInfoRow label={t("livestock.bodyCondition")} value={`${animal.bodyConditionScore}/5`} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("livestock.farmAssignment")}</h3>
          <DetailInfoRow label={t("filter.farm")} value={getFarmById(animal.farmId)?.name} />
          <DetailInfoRow label={t("farms.barn")} value={getBarnById(animal.barnId)?.name} />
          <DetailInfoRow label={t("livestock.herdGroup")} value={animal.herdGroup} />
          <DetailInfoRow label={t("livestock.arrivalDate")} value={animal.arrivalDate} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <Syringe className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-terrava-text">{t("livestock.upcomingCare")}</h3>
          </div>
          <p className="text-sm text-terrava-muted">{t("livestock.nextCheckup")}</p>
        </div>
      </div>
    </div>
  );
}
