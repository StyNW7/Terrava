import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { LayoutGrid, List as ListIcon, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ExportButton from "@/components/dashboard/ExportButton";
import DataTable from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import HealthScoreBadge from "@/components/dashboard/HealthScoreBadge";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import LivestockGridCard from "@/components/livestock/LivestockGridCard";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { livestock } from "@/data/mockLivestock";
import { farms, getBarnById, getFarmById } from "@/data/mockFarms";
import type { Livestock } from "@/types/dashboard";

const typeOptions = [...new Set(livestock.map((a) => a.type))].map((type) => ({ value: type, label: type }));
const healthOptions = [
  { value: "healthy", label: "Healthy" },
  { value: "attention", label: "Needs Attention" },
  { value: "critical", label: "Critical" },
  { value: "inactive", label: "Inactive" },
];
const deviceOptions = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "low-battery", label: "Low Battery" },
  { value: "unassigned", label: "Unassigned" },
];

export default function LivestockListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Livestock | Terrava";
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return livestock.filter((animal) => {
      const matchesSearch =
        search.trim().length === 0 ||
        animal.name.toLowerCase().includes(search.toLowerCase()) ||
        animal.code.toLowerCase().includes(search.toLowerCase()) ||
        animal.earTagId.toLowerCase().includes(search.toLowerCase());
      const matchesFarm = farmFilter === "all" || animal.farmId === farmFilter;
      const matchesType = typeFilter === "all" || animal.type === typeFilter;
      const matchesHealth = healthFilter === "all" || animal.healthStatus === healthFilter;
      const matchesDevice = deviceFilter === "all" || animal.deviceStatus === deviceFilter;
      return matchesSearch && matchesFarm && matchesType && matchesHealth && matchesDevice;
    });
  }, [search, farmFilter, typeFilter, healthFilter, deviceFilter]);

  const columns: ColumnDef<Livestock, unknown>[] = [
    {
      accessorKey: "name",
      header: "Livestock",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <img src={row.original.photo} alt={row.original.name} className="h-9 w-9 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-terrava-text">{row.original.name}</p>
            <p className="truncate text-xs text-terrava-muted">{row.original.earTagId}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "code", header: "ID" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "breed", header: "Breed" },
    { accessorFn: (row) => `${row.ageMonths} mo`, id: "age", header: "Age" },
    { accessorKey: "gender", header: "Gender" },
    {
      id: "farmBarn",
      header: "Farm / Barn",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium text-terrava-text">{getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ")}</p>
          <p className="text-terrava-muted">{getBarnById(row.original.barnId)?.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "healthScore",
      header: "Health Score",
      cell: ({ getValue }) => <HealthScoreBadge score={getValue() as number} />,
    },
    {
      accessorKey: "healthStatus",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue() as Livestock["healthStatus"]} />,
    },
    {
      accessorKey: "deviceStatus",
      header: "Device",
      cell: ({ getValue }) => {
        const value = getValue() as Livestock["deviceStatus"];
        return value === "unassigned" ? <span className="text-xs text-terrava-muted">Unassigned</span> : <DeviceStatusBadge status={value} />;
      },
    },
    { accessorKey: "lastUpdate", header: "Last Update" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: "View detail", onClick: () => navigate(`/dashboard/livestock/${row.original.id}`) },
            { label: "Edit", onClick: () => toast.success(`Membuka form edit ${row.original.name}.`) },
            { label: "Assign device", onClick: () => toast.success(`Perangkat ditugaskan ke ${row.original.name}.`) },
            { label: "Move barn", onClick: () => toast.success(`${row.original.name} dipindahkan ke kandang baru.`) },
            { label: "Archive", onClick: () => toast.success(`${row.original.name} diarsipkan.`), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Livestock"
        subtitle="Kelola seluruh data ternak dan status kesehatannya."
        actions={
          <>
            <ExportButton label="Export CSV" />
            <button
              type="button"
              onClick={() => navigate("/dashboard/livestock/add")}
              className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Livestock
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, ID, atau ear tag..." className="w-full sm:w-64" />
        <FilterSelect label="Farm" value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label="Health" value={healthFilter} onChange={setHealthFilter} options={healthOptions} />
        <FilterSelect label="Device" value={deviceFilter} onChange={setDeviceFilter} options={deviceOptions} />

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-terrava-border p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-label="Table view"
            className={`rounded-lg p-1.5 ${view === "table" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={`rounded-lg p-1.5 ${view === "grid" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton variant={view === "table" ? "table" : "cards"} rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada ternak ditemukan" description="Coba ubah filter atau kata kunci pencarian Anda." />
      ) : view === "table" ? (
        <DataTable
          data={filtered}
          columns={columns}
          enableRowSelection
          bulkActions={
            <>
              <button onClick={() => toast.success("Ternak dipindahkan ke grup baru.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                Move to group
              </button>
              <button onClick={() => toast.success("Perangkat ditugaskan ke ternak terpilih.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                Assign device
              </button>
              <button onClick={() => toast.success("Data ternak terpilih diekspor.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                Export
              </button>
              <button onClick={() => toast.success("Ternak terpilih diarsipkan.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-error hover:bg-white">
                Archive
              </button>
            </>
          }
          renderMobileCard={(animal) => <LivestockGridCard animal={animal} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((animal) => (
            <LivestockGridCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  );
}
