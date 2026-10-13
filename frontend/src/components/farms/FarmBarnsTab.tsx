import type { Farm } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function FarmBarnsTab({ farm }: { farm: Farm }) {
  const { getBarnsByFarm } = useDataStore();
  const { t } = useLanguage();
  const farmBarns = getBarnsByFarm(farm.id);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {farmBarns.map((barn) => (
        <div key={barn.id} className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{barn.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.occupancy}/{barn.capacity}</p>
              <p className="text-terrava-muted">{t("farms.occupancy")}</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.healthScore}</p>
              <p className="text-terrava-muted">{t("livestock.column.healthScore")}</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.temperature}°C</p>
              <p className="text-terrava-muted">{t("vitals.temperature")}</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.humidity}%</p>
              <p className="text-terrava-muted">{t("vitals.humidity")}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-terrava-muted">
            {t("farms.activeAlertsCount", { count: barn.alertCount })} &middot; {t("farms.manager")}: {barn.manager}
          </p>
        </div>
      ))}
    </div>
  );
}
