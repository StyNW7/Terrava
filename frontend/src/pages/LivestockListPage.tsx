import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive, LayoutGrid, List as ListIcon, PlusCircle } from "lucide-react";
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
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import LivestockGridCard from "@/components/livestock/LivestockGridCard";
import MoveLivestockModal from "@/components/livestock/MoveLivestockModal";
import AssignDeviceModal from "@/components/livestock/AssignDeviceModal";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import type { Livestock } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { downloadCsv } from "@/lib/download";
import { fileStamp } from "@/utils/time";
import { cn } from "@/lib/utils";

const healthValues = ["healthy", "attention", "critical", "inactive"];
const deviceValues = ["online", "offline", "low-battery", "unassigned"];
const bulkButton = "rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white";

export default function LivestockListPage() {
  const navigate = useNavigate();
  const { t, tt, tRel } = useLanguage();
  const { livestock, farms, getBarnById, getFarmById, updateLivestock } = useDataStore();
  // Filters can be pre-set from links such as /dashboard/livestock?health=attention.
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [farmFilter, setFarmFilter] = useState(params.get("farm") ?? "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState(params.get("health") ?? "all");
  const [deviceFilter, setDeviceFilter] = useState(params.get("device") ?? "all");
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [loading, setLoading] = useState(true);
  const [moveIds, setMoveIds] = useState<string[] | null>(null);
  const [moveDone, setMoveDone] = useState<(() => void) | undefined>();
  const [deviceFor, setDeviceFor] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<{ ids: string[]; onDone?: () => void } | null>(null);

  useEffect(() => {
    document.title = "Livestock | Terrava";
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const archivedCount = livestock.filter((animal) => animal.archived).length;
  const livestockTypes = useMemo(() => [...new Set(livestock.map((a) => a.type))], [livestock]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return livestock.filter((animal) => {
      if (Boolean(animal.archived) !== showArchived) return false;
      const matchesSearch =
        query.length === 0 ||
        animal.name.toLowerCase().includes(query) ||
        animal.code.toLowerCase().includes(query) ||
        animal.id.toLowerCase().includes(query) ||
        animal.earTagId.toLowerCase().includes(query);
      const matchesFarm = farmFilter === "all" || animal.farmId === farmFilter;
      const matchesType = typeFilter === "all" || animal.type === typeFilter;
      const matchesHealth = healthFilter === "all" || animal.healthStatus === healthFilter;
      const matchesDevice = deviceFilter === "all" || animal.deviceStatus === deviceFilter;
      return matchesSearch && matchesFarm && matchesType && matchesHealth && matchesDevice;
    });
  }, [livestock, search, farmFilter, typeFilter, healthFilter, deviceFilter, showArchived]);

  const typeOptions = livestockTypes.map((type) => ({ value: type, label: tt("livestockType", type) }));
  const healthOptions = healthValues.map((value) => ({ value, label: t("status." + value) }));
  const deviceOptions = deviceValues.map((value) => ({ value, label: t("status." + value) }));

  const exportRows = (rows: Livestock[]) => {
    downloadCsv(`terrava-livestock_${fileStamp()}.csv`, rows, [
      { header: t("livestock.column.id"), value: (a) => a.id },
      { header: "Code", value: (a) => a.code },
      { header: t("rpt.col.name"), value: (a) => a.name },
      { header: t("addLivestock.field.earTagId"), value: (a) => a.earTagId },
      { header: t("livestock.column.type"), value: (a) => tt("livestockType", a.type) },
      { header: t("livestock.column.breed"), value: (a) => a.breed },
      { header: t("livestock.column.gender"), value: (a) => tt("gender", a.gender) },
      { header: t("livestock.column.age"), value: (a) => a.ageMonths },
      { header: t("addLivestock.field.weight"), value: (a) => a.weightKg },
      { header: t("filter.farm"), value: (a) => getFarmById(a.farmId)?.name },
      { header: t("farms.barn"), value: (a) => getBarnById(a.barnId)?.name },
      { header: t("livestock.herdGroup"), value: (a) => a.herdGroup },
      { header: t("livestock.column.healthScore"), value: (a) => a.healthScore },
      { header: t("livestock.column.status"), value: (a) => t("status." + a.healthStatus) },
      { header: `${t("vitals.temperature")} (°C)`, value: (a) => a.temperature },
      { header: `${t("vitals.heartRate")} (bpm)`, value: (a) => a.heartRate },
      { header: t("livestock.column.device"), value: (a) => a.deviceId ?? t("status.unassigned") },
      { header: t("rpt.col.vaccination"), value: (a) => t("status." + a.vaccinationStatus) },
      { header: "Latitude", value: (a) => a.location.lat },
      { header: "Longitude", value: (a) => a.location.lng },
    ]);
    return rows.length;
  };

  const archive = (ids: string[]) => {
    updateLivestock(ids, { archived: true });
    toast.success(ids.length > 1 ? t("livestock.toast.archivedMany", { count: ids.length }) : t("livestock.toast.archived"));
  };
  const restore = (ids: string[]) => {
    updateLivestock(ids, { archived: false });
    toast.success(t("livestock.toast.restored", { count: ids.length }));
  };

  const openMove = (ids: string[], onDone?: () => void) => {
    setMoveDone(() => onDone);
    setMoveIds(ids);
  };

  const columns: ColumnDef<Livestock, unknown>[] = [
    {
      accessorKey: "name",
      header: t("nav.item.livestock"),
      cell: ({ row }) => (
        <button type="button" onClick={() => navigate(`/dashboard/livestock/${row.original.id}`)} className="group flex items-center gap-2.5 text-left">
          <img src={row.original.photo} alt="" className="h-9 w-9 rounded-lg object-cover" />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-terrava-text group-hover:text-terrava-primary group-hover:underline">{row.original.name}</span>
            <span className="block text-xs text-terrava-muted">{row.original.earTagId}</span>
          </span>
        </button>
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
        return value === "unassigned" ? <span className="text-xs text-terrava-muted">{t("status.unassigned")}</span> : <DeviceStatusBadge status={value} />;
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
          actions={
            row.original.archived
              ? [
                  { label: t("common.viewDetail"), onClick: () => navigate(`/dashboard/livestock/${row.original.id}`) },
                  { label: t("livestock.action.restore"), onClick: () => restore([row.original.id]) },
                ]
              : [
                  { label: t("common.viewDetail"), onClick: () => navigate(`/dashboard/livestock/${row.original.id}`) },
                  { label: t("common.edit"), onClick: () => navigate(`/dashboard/livestock/${row.original.id}/edit`) },
                  { label: t("livestock.action.assignDevice"), onClick: () => setDeviceFor(row.original.id) },
                  { label: t("livestock.action.moveBarn"), onClick: () => openMove([row.original.id]) },
                  { label: t("livestock.action.archive"), onClick: () => setArchiveTarget({ ids: [row.original.id] }), danger: true },
                ]
          }
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
            <ExportButton onExport={() => exportRows(filtered)} />
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

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3 shadow-card">
        <SearchInput value={search} onChange={setSearch} placeholder={t("livestock.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect label={t("filter.type")} value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterSelect label={t("filter.health")} value={healthFilter} onChange={setHealthFilter} options={healthOptions} />
        <FilterSelect label={t("filter.device")} value={deviceFilter} onChange={setDeviceFilter} options={deviceOptions} />
        <button
          type="button"
          aria-pressed={showArchived}
          onClick={() => setShowArchived((value) => !value)}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors",
            showArchived ? "border-terrava-primary/30 bg-terrava-light text-terrava-primary" : "border-terrava-border text-terrava-text hover:bg-terrava-bg"
          )}
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          {t("livestock.archived")} ({archivedCount})
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-terrava-border p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-label={t("view.table")}
            aria-pressed={view === "table"}
            className={`rounded-lg p-1.5 ${view === "table" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label={t("view.grid")}
            aria-pressed={view === "grid"}
            className={`rounded-lg p-1.5 ${view === "grid" ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted"}`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton variant={view === "table" ? "table" : "cards"} rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={showArchived ? t("livestock.archiveEmpty") : t("livestock.emptyTitle")}
          description={showArchived ? t("livestock.archiveEmptyDescription") : t("livestock.emptyDescription")}
        />
      ) : view === "table" ? (
        <DataTable
          data={filtered}
          columns={columns}
          enableRowSelection
          bulkActions={(selected, clear) =>
            showArchived ? (
              <button
                type="button"
                onClick={() => {
                  restore(selected.map((a) => a.id));
                  clear();
                }}
                className={bulkButton}
              >
                {t("livestock.action.restore")}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => openMove(selected.map((a) => a.id), clear)} className={bulkButton}>
                  {t("livestock.action.moveToGroup")}
                </button>
                <button type="button" onClick={() => toast.success(t("dashboard.exportDoneCount", { count: exportRows(selected) }))} className={bulkButton}>
                  {t("common.export")}
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveTarget({ ids: selected.map((a) => a.id), onDone: clear })}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-error hover:bg-white"
                >
                  {t("livestock.action.archive")}
                </button>
              </>
            )
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

      <MoveLivestockModal ids={moveIds} onClose={() => setMoveIds(null)} onDone={moveDone} />
      <AssignDeviceModal livestockId={deviceFor} onClose={() => setDeviceFor(null)} />
      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (!archiveTarget) return;
          archive(archiveTarget.ids);
          archiveTarget.onDone?.();
        }}
        title={t("livestock.archiveConfirmTitle", { count: archiveTarget?.ids.length ?? 0 })}
        description={t("livestock.archiveConfirmDescription")}
        confirmLabel={t("livestock.action.archive")}
        tone="danger"
      />
    </div>
  );
}
