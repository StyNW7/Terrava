import { useEffect, useMemo, useState } from "react";
import { Building2, Warehouse, PawPrint, TriangleAlert, Radio, LayoutGrid, List as ListIcon, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ExportButton from "@/components/dashboard/ExportButton";
import FarmCard from "@/components/farms/FarmCard";
import { farms, barns, getFarmById } from "@/data/mockFarms";

export default function FarmManagementPage() {
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
  }, [search, region]);

  const totalLivestock = farms.reduce((sum, farm) => sum + farm.livestockCount, 0);
  const totalCapacity = farms.reduce((sum, farm) => sum + farm.capacity, 0);
  const totalAlerts = farms.reduce((sum, farm) => sum + farm.activeAlerts, 0);
  const avgCoverage = Math.round(farms.reduce((sum, farm) => sum + farm.deviceCoverage, 0) / farms.length);

  return (
    <div>
      <PageHeader
        title="Farms and Barns"
        subtitle="Kelola seluruh peternakan, kandang, dan kapasitas operasional Anda."
        actions={
          <>
            <ExportButton />
            <button
              type="button"
              onClick={() => toast.success("Form tambah farm baru dibuka.")}
              className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Farm
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={Building2} label="Total Farms" value={farms.length} />
        <MetricCard icon={Warehouse} label="Total Barns" value={barns.length} />
        <MetricCard icon={Warehouse} label="Total Capacity" value={totalCapacity} />
        <MetricCard icon={PawPrint} label="Total Livestock" value={totalLivestock} />
        <MetricCard icon={TriangleAlert} label="Active Alerts" value={totalAlerts} tone="warning" />
        <MetricCard icon={Radio} label="Device Coverage" value={`${avgCoverage}%`} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari farm..." className="w-full sm:w-64" />
        <FilterSelect label="Region" value={region} onChange={setRegion} options={[...new Set(farms.map((f) => f.region))].map((r) => ({ value: r, label: r }))} />
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-terrava-border p-1">
          <button type="button" onClick={() => setView("grid")} aria-label="Grid view" className={`rounded-lg p-1.5 ${view === "grid" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setView("list")} aria-label="List view" className={`rounded-lg p-1.5 ${view === "list" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}>
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`mb-8 grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {filtered.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">Barn Overview</h2>
      <div className="overflow-x-auto rounded-2xl border border-terrava-border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-terrava-bg text-xs uppercase text-terrava-muted">
            <tr>
              <th className="px-4 py-3">Barn</th>
              <th className="px-4 py-3">Farm</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Occupancy</th>
              <th className="px-4 py-3">Health Score</th>
              <th className="px-4 py-3">Temperature</th>
              <th className="px-4 py-3">Humidity</th>
              <th className="px-4 py-3">Alerts</th>
              <th className="px-4 py-3">Manager</th>
            </tr>
          </thead>
          <tbody>
            {barns.map((barn) => (
              <tr key={barn.id} className="border-t border-terrava-border">
                <td className="px-4 py-3 font-medium text-terrava-text">{barn.name}</td>
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
    </div>
  );
}
