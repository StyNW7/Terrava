import { Link } from "react-router-dom";
import HealthScoreBadge from "@/components/dashboard/HealthScoreBadge";
import { livestock } from "@/data/mockLivestock";
import { getBarnById } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

export default function OverviewAttentionPanel() {
  const { t } = useLanguage();
  const needsAttention = livestock
    .filter((animal) => animal.healthStatus === "attention" || animal.healthStatus === "critical")
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.requiringAttention")}</h3>
        <Link to="/dashboard/livestock?health=attention" className="text-xs font-semibold text-terrava-primary">
          {t("common.viewAll")}
        </Link>
      </div>
      <ul className="space-y-1">
        {needsAttention.map((animal) => (
          <li key={animal.id}>
            <Link to={`/dashboard/livestock/${animal.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 hover:bg-terrava-bg">
              <div className="flex min-w-0 items-center gap-2.5">
                <img src={animal.photo} alt={animal.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-terrava-text">{animal.name}</p>
                  <p className="truncate text-xs text-terrava-muted">{animal.code} &middot; {getBarnById(animal.barnId)?.name}</p>
                </div>
              </div>
              <HealthScoreBadge score={animal.healthScore} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
