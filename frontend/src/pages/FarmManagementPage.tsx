import { useEffect, useMemo, useState } from "react";
import { Building2, Warehouse, PawPrint, TriangleAlert, Radio, LayoutGrid, List as ListIcon, PlusCircle } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ExportButton from "@/components/dashboard/ExportButton";
import FarmCard from "@/components/farms/FarmCard";
import FarmFormModal from "@/components/farms/FarmFormModal";
import { computeFarmStats } from "@/lib/farmStats";
import { downloadCsv } from "@/lib/download";
import { fileStamp } from "@/utils/time";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function FarmManagementPage() {
  const store = useDataStore();
  const { farms, barns, getFarmById } = store;
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    document.title = "Farms and Barns | Terrava";
  }, []);

  const filtered = useMemo(() => {
    return farms.filter((farm) => {
      const matchesSearch = search.trim().length === 0 || farm.name.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = region === "all" || farm.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [farms, search, region]);

  const stats = farms.map((farm) => ({ farm, ...computeFarmStats(farm.id, store) }));
  const totalLivestock = stats.reduce((sum, s) => sum + s.livestock, 0);
  const totalCapacity = barns.reduce((sum, barn) => sum + barn.capacity, 0);
  const totalAlerts = stats.reduce((sum, s) => sum + s.activeAlerts, 0);
  const withDevice = store.activeLivestock.filter((animal) => animal.deviceId).length;
  const avgCoverage = store.activeLivestock.length ? Math.round((withDevice / store.activeLivestock.length) * 100) : 0;

  const exportFarms = () => {
    const rows = stats.filter((s) => filtered.includes(s.farm));
    downloadCsv(`terrava-farms_${fileStamp()}.csv`, rows, [
      { header: "ID", value: (s) => s.farm.id },
      { header: t("farms.form.name"), value: (s) => s.farm.name },
      { header: t("rpt.col.location"), value: (s) => s.farm.location },
      { header: t("filter.region"), value: (s) => s.farm.region },
      { header: t("farms.manager"), value: (s) => s.farm.manager },
      { header: t("livestock.column.status"), value: (s) => t("status." + s.farm.status) },
      { header: t("nav.item.livestock"), value: (s) => s.livestock },
      { header: t("rpt.farm.barns"), value: (s) => s.barns },
      { header: t("farms.capacity"), value: (s) => s.capacity },
      { header: t("farms.occupancy"), value: (s) => s.occupancy },
      { header: t("metric.avgHealthScore"), value: (s) => s.healthScore },
      { header: t("dashboard.activeAlerts"), value: (s) => s.activeAlerts },
      { header: t("farms.metric.deviceCoverage"), value: (s) => `${s.deviceCoverage}%` },
    ]);
    return rows.length;
  };

  return (
    <div>
      <PageHeader
        title={t("nav.item.farms")}
        subtitle={t("farms.subtitle")}
        actions={
          <>
            <ExportButton onExport={exportFarms} />
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              {t("farms.addFarm")}
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={Building2} label={t("farms.metric.totalFarms")} value={farms.length} />
        <MetricCard icon={Warehouse} label={t("farms.metric.totalBarns")} value={barns.length} />
        <MetricCard icon={Warehouse} label={t("farms.metric.totalCapacity")} value={totalCapacity} />
        <MetricCard icon={PawPrint} label={t("metric.totalLivestock")} value={totalLivestock} />
        <MetricCard icon={TriangleAlert} label={t("dashboard.activeAlerts")} value={totalAlerts} tone="warning" />
        <MetricCard icon={Radio} label={t("farms.metric.deviceCoverage")} value={`${avgCoverage}%`} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3 shadow-card">
        <SearchInput value={search} onChange={setSearch} placeholder={t("farms.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect label={t("filter.region")} value={region} onChange={setRegion} options={[...new Set(farms.map((f) => f.region))].map((r) => ({ value: r, label: r }))} />
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-terrava-border p-1">
          <button type="button" onClick={() => setView("grid")} aria-label={t("view.grid")} className={`rounded-lg p-1.5 ${view === "grid" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setView("list")} aria-label={t("view.list")} className={`rounded-lg p-1.5 ${view === "list" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}>
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`mb-8 grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {filtered.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
        {filtered.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-terrava-border bg-white p-8 text-center text-sm text-terrava-muted">{t("farms.empty")}</p>}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">{t("farms.barnOverview")}</h2>
      <div className="overflow-x-auto rounded-2xl border border-terrava-border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-terrava-bg text-xs uppercase text-terrava-muted">
            <tr>
              <th className="px-4 py-3">{t("farms.barn")}</th>
              <th className="px-4 py-3">{t("filter.farm")}</th>
              <th className="px-4 py-3">{t("farms.capacity")}</th>
              <th className="px-4 py-3">{t("farms.occupancy")}</th>
              <th className="px-4 py-3">{t("livestock.column.healthScore")}</th>
              <th className="px-4 py-3">{t("vitals.temperature")}</th>
              <th className="px-4 py-3">{t("vitals.humidity")}</th>
              <th className="px-4 py-3">{t("nav.item.alerts")}</th>
              <th className="px-4 py-3">{t("farms.manager")}</th>
            </tr>
          </thead>
          <tbody>
            {barns.map((barn) => (
              <tr key={barn.id} className="border-t border-terrava-border hover:bg-terrava-bg/60">
                <td className="px-4 py-3 font-medium text-terrava-text">
                  <button type="button" onClick={() => navigate("/dashboard/farms/" + barn.farmId)} className="hover:text-terrava-primary hover:underline">
                    {barn.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-terrava-muted">{getFarmById(barn.farmId)?.name.split(" ").slice(0, 2).join(" ")}</td>
                <td className="px-4 py-3">{barn.capacity}</td>
                <td className="px-4 py-3">{barn.occupancy}</td>
                <td className="px-4 py-3">{barn.healthScore}</td>
                <td className="px-4 py-3">{barn.temperature}°C</td>
                <td className="px-4 py-3">{barn.humidity}%</td>
                <td className="px-4 py-3">{barn.alertCount}</td>
                <td className="px-4 py-3 text-terrava-muted">{barn.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FarmFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={(farm) => navigate("/dashboard/farms/" + farm.id)} />
    </div>
  );
}
