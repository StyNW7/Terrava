import { useEffect, useState } from "react";
import {
  Pause,
  Play,
  Maximize2,
  Minimize2,
  TriangleAlert,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ChartCard from "@/components/charts/ChartCard";
import TemperatureTrendChart from "@/components/charts/TemperatureTrendChart";
import ActivityTrendChart from "@/components/charts/ActivityTrendChart";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import LiveLivestockCard from "@/components/dashboard/monitoring/LiveLivestockCard";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { livestock } from "@/data/mockLivestock";
import { alerts } from "@/data/mockAlerts";
import { farms } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

export default function MonitoringPage() {
  const { lang, t, tr, tRel } = useLanguage();
  const [paused, setPaused] = useState(false);
  const [compact, setCompact] = useState(false);
  const [tableMode, setTableMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [farmFilter, setFarmFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [tick, setTick] = useState(0);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    document.title = "Live Monitoring | Terrava";
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
      setLastSync(new Date());
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  const filtered = livestock.filter(
    (animal) => (farmFilter === "all" || animal.farmId === farmFilter) && (healthFilter === "all" || animal.healthStatus === healthFilter)
  );

  const criticalCount = livestock.filter((a) => a.healthStatus === "critical").length;
  const activeAlerts = alerts.filter((a) => a.status === "active").slice(0, 6);

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 overflow-y-auto bg-terrava-bg p-6" : ""}>
      <PageHeader
        title={t("monitoring.title")}
        subtitle={t("monitoring.subtitle")}
        actions={
          <>
            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
            >
              {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              {paused ? t("monitoring.resume") : t("monitoring.pause")}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
              {fullscreen ? t("monitoring.exitFullscreen") : t("monitoring.controlRoom")}
            </button>
          </>
        }
      />

      {criticalCount > 0 && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-terrava-error/30 bg-terrava-error/5 px-4 py-3 text-sm font-medium text-terrava-error">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          {t("monitoring.criticalNotice", { count: criticalCount })}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <span className="flex items-center gap-1.5 rounded-full bg-terrava-primary/10 px-3 py-1.5 text-xs font-semibold text-terrava-primary">
          <span className={`h-2 w-2 rounded-full bg-terrava-primary ${paused ? "" : "animate-pulse"}`} aria-hidden="true" />
          {paused ? t("monitoring.paused") : t("monitoring.live")}
        </span>
        <span className="text-xs text-terrava-muted">
          {t("monitoring.lastSync", { time: lastSync.toLocaleTimeString(lang === "id" ? "id-ID" : "en-GB") })}
        </span>
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect
          label={t("filter.health")}
          value={healthFilter}
          onChange={setHealthFilter}
          options={[
            { value: "healthy", label: t("status.healthy") },
            { value: "attention", label: t("status.attention") },
            { value: "critical", label: t("status.critical") },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCompact((prev) => !prev)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${compact ? "bg-terrava-light text-terrava-primary" : "border border-terrava-border text-terrava-text"}`}
          >
            {t("monitoring.compact")}
          </button>
          <button
            type="button"
            onClick={() => setTableMode(false)}
            aria-label={t("view.grid")}
            className={`rounded-lg p-1.5 ${!tableMode ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setTableMode(true)}
            aria-label={t("view.table")}
            className={`rounded-lg p-1.5 ${tableMode ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <TableIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {tableMode ? (
            <div className="overflow-x-auto rounded-2xl border border-terrava-border bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-terrava-bg text-xs uppercase text-terrava-muted">
                  <tr>
                    <th className="px-4 py-3">{t("monitoring.column.name")}</th>
                    <th className="px-4 py-3">{t("monitoring.column.temp")}</th>
                    <th className="px-4 py-3">{t("monitoring.column.heartRate")}</th>
                    <th className="px-4 py-3">{t("monitoring.column.activity")}</th>
                    <th className="px-4 py-3">{t("monitoring.column.battery")}</th>
                    <th className="px-4 py-3">{t("monitoring.column.updated")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((animal) => (
                    <tr key={animal.id} className="border-t border-terrava-border">
                      <td className="px-4 py-3 font-medium text-terrava-text">{animal.name}</td>
                      <td className="px-4 py-3">{animal.temperature}°C</td>
                      <td className="px-4 py-3">{animal.heartRate} bpm</td>
                      <td className="px-4 py-3">{animal.activityLevel}</td>
                      <td className="px-4 py-3">{animal.deviceId ? `${animal.batteryLevel}%` : "-"}</td>
                      <td className="px-4 py-3 text-terrava-muted">{tRel(animal.lastUpdate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {filtered.map((animal) => (
                <LiveLivestockCard key={`${animal.id}-${tick}`} animal={animal} compact={compact} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ChartCard title={t("chart.liveTemperature")}>
            <TemperatureTrendChart height={200} />
          </ChartCard>
          <ChartCard title={t("chart.avgBarnHealth")}>
            <HealthScoreChart height={200} />
          </ChartCard>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("monitoring.alertPanel")}</h3>
            <ul className="space-y-2">
              {activeAlerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between rounded-xl bg-terrava-bg px-3 py-2">
                  <span className="truncate text-xs text-terrava-text">{tr(alert.title)}</span>
                  <SeverityBadge severity={alert.severity} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ChartCard title={t("chart.activityOverTime")}>
          <ActivityTrendChart height={220} />
        </ChartCard>
      </div>
    </div>
  );
}
