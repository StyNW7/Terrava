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
import { useLanguage } from "@/hooks/useLanguage";

const livestockTypes = [...new Set(livestock.map((a) => a.type))];
const healthValues = ["healthy", "attention", "critical", "inactive"];
const deviceValues = ["online", "offline", "low-battery", "unassigned"];

export default function LivestockListPage() {
  const navigate = useNavigate();
  const { t, tt, tRel } = useLanguage();
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

  const typeOptions = livestockTypes.map((type) => ({ value: type, label: tt("livestockType", type) }));
  const healthOptions = healthValues.map((value) => ({ value, label: t("status." + value) }));
  const deviceOptions = deviceValues.map((value) => ({ value, label: t("status." + value) }));

  const columns: ColumnDef<Livestock, unknown>[] = [
    {
      accessorKey: "name",
      header: t("nav.item.livestock"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <img src={row.original.photo} alt={row.original.name} className="h-9 w-9 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-terrava-text">{row.original.name}</p>
            <p className="text-xs text-terrava-muted">{row.original.earTagId}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "code", header: t("livestock.column.id") },
    {
      accessorKey: "type",
      header: t("livestock.column.type"),
      cell: ({ getValue }) => tt("livestockType", getValue() as string),
    },
    { accessorKey: "breed", header: t("livestock.column.breed") },
    {
      accessorFn: (row) => row.ageMonths,
      id: "age",
      header: t("livestock.column.age"),
      cell: ({ getValue }) => t("livestock.months", { count: getValue() as number }),
    },
    {
      accessorKey: "gender",
      header: t("livestock.column.gender"),
      cell: ({ getValue }) => tt("gender", getValue() as string),
    },
    {
      id: "farmBarn",
      header: t("livestock.column.farmBarn"),
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium text-terrava-text">{getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ")}</p>
          <p className="text-terrava-muted">{getBarnById(row.original.barnId)?.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "healthScore",
      header: t("livestock.column.healthScore"),
      cell: ({ getValue }) => <HealthScoreBadge score={getValue() as number} />,
    },
    {
      accessorKey: "healthStatus",
      header: t("livestock.column.status"),
      cell: ({ getValue }) => <StatusBadge status={getValue() as Livestock["healthStatus"]} />,
    },
    {
      accessorKey: "deviceStatus",
      header: t("livestock.column.device"),
      cell: ({ getValue }) => {
        const value = getValue() as Livestock["deviceStatus"];
        return value === "unassigned" ? (
          <span className="text-xs text-terrava-muted">{t("status.unassigned")}</span>
        ) : (
          <DeviceStatusBadge status={value} />
        );
      },
    },
    {
      accessorKey: "lastUpdate",
      header: t("livestock.column.lastUpdate"),
      cell: ({ getValue }) => tRel(getValue() as string),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: t("common.viewDetail"), onClick: () => navigate(`/dashboard/livestock/${row.original.id}`) },
            { label: t("common.edit"), onClick: () => toast.success(t("livestock.toast.edit", { name: row.original.name })) },
            {
              label: t("livestock.action.assignDevice"),
              onClick: () => toast.success(t("livestock.toast.assignDevice", { name: row.original.name })),
            },
            {
              label: t("livestock.action.moveBarn"),
              onClick: () => toast.success(t("livestock.toast.moveBarn", { name: row.original.name })),
            },
            {
              label: t("livestock.action.archive"),
              onClick: () => toast.success(t("livestock.toast.archive", { name: row.original.name })),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("nav.item.livestock")}
        subtitle={t("livestock.subtitle")}
        actions={
          <>
            <ExportButton />
            <button
              type="button"
              onClick={() => navigate("/dashboard/livestock/add")}
              className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              {t("nav.item.addLivestock")}
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t("livestock.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect label={t("filter.type")} value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label={t("filter.health")} value={healthFilter} onChange={setHealthFilter} options={healthOptions} />
        <FilterSelect label={t("filter.device")} value={deviceFilter} onChange={setDeviceFilter} options={deviceOptions} />

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-terrava-border p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-label={t("view.table")}
            className={`rounded-lg p-1.5 ${view === "table" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label={t("view.grid")}
            className={`rounded-lg p-1.5 ${view === "grid" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton variant={view === "table" ? "table" : "cards"} rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("livestock.emptyTitle")} description={t("livestock.emptyDescription")} />
      ) : view === "table" ? (
        <DataTable
          data={filtered}
          columns={columns}
          enableRowSelection
          bulkActions={
            <>
              <button onClick={() => toast.success(t("livestock.toast.bulkMove"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                {t("livestock.action.moveToGroup")}
              </button>
              <button onClick={() => toast.success(t("livestock.toast.bulkAssign"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                {t("livestock.action.assignDevice")}
              </button>
              <button onClick={() => toast.success(t("livestock.toast.bulkExport"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
                {t("common.export")}
              </button>
              <button onClick={() => toast.success(t("livestock.toast.bulkArchive"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-error hover:bg-white">
                {t("livestock.action.archive")}
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
