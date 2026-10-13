import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import Tabs from "@/components/dashboard/Tabs";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ExportButton from "@/components/dashboard/ExportButton";
import DataTable from "@/components/dashboard/DataTable";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import AssignStaffModal from "@/components/dashboard/AssignStaffModal";
import CreateTaskModal, { type TaskDraft } from "@/components/dashboard/CreateTaskModal";
import { BellRing, TriangleAlert, Flame, ShieldAlert, CircleCheck } from "lucide-react";
import type { Alert } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useAuth } from "@/hooks/useAuth";
import { downloadCsv } from "@/lib/download";
import { fileStamp } from "@/utils/time";

const categoryValues = ["health", "behavior", "location", "device", "environmental", "weather"];
const severityValues = ["info", "warning", "high", "critical"];

const bulkButton = "rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white";

export default function AlertsPage() {
  const navigate = useNavigate();
  const { t, tr, tRel } = useLanguage();
  const { user } = useAuth();
  const { alerts, farms, getFarmById, getLivestockById, updateAlerts } = useDataStore();
  const me = user?.name ?? "";
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") ?? "all");
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [severity, setSeverity] = useState(params.get("severity") ?? "all");
  const [category, setCategory] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");
  const [assignTarget, setAssignTarget] = useState<{ ids: string[]; current?: string | null; onDone?: () => void } | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);

  useEffect(() => {
    document.title = "Alerts Center | Terrava";
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alerts.filter((alert) => {
      const matchesTab =
        tab === "all" ||
        (tab === "active" && alert.status === "active") ||
        (tab === "assigned" && alert.assignedTo === me) ||
        (tab === "resolved" && alert.status === "resolved");
      const animalName = getLivestockById(alert.livestockId)?.name.toLowerCase() ?? "";
      const matchesSearch = query.length === 0 || tr(alert.title).toLowerCase().includes(query) || animalName.includes(query) || alert.id.toLowerCase().includes(query);
      const matchesSeverity = severity === "all" || alert.severity === severity;
      const matchesCategory = category === "all" || alert.category === category;
      const matchesFarm = farmFilter === "all" || alert.farmId === farmFilter;
      return matchesTab && matchesSearch && matchesSeverity && matchesCategory && matchesFarm;
    });
  }, [alerts, tab, search, severity, category, farmFilter, tr, me, getLivestockById]);

  const now = () => new Date().toISOString();
  const acknowledge = (ids: string[]) => {
    updateAlerts(ids, { status: "acknowledged", acknowledgedAt: now() });
    toast.success(ids.length > 1 ? t("alerts.toast.bulkAcknowledged", { count: ids.length }) : t("alerts.toast.acknowledged"));
  };
  const resolve = (ids: string[]) => {
    updateAlerts(ids, { status: "resolved", resolvedAt: now() });
    toast.success(ids.length > 1 ? t("alerts.toast.bulkResolvedCount", { count: ids.length }) : t("alerts.toast.resolved"));
  };
  const reopen = (id: string) => {
    updateAlerts([id], { status: "active", resolvedAt: undefined, acknowledgedAt: undefined });
    toast.success(t("alerts.toast.reopened"));
  };

  const exportAlerts = () => {
    downloadCsv(`terrava-alerts_${fileStamp()}.csv`, filtered, [
      { header: "ID", value: (a) => a.id },
      { header: t("alerts.column.alert"), value: (a) => tr(a.title) },
      { header: t("alerts.column.severity"), value: (a) => t("severity." + a.severity) },
      { header: t("alerts.column.category"), value: (a) => t("category." + a.category) },
      { header: t("nav.item.livestock"), value: (a) => getLivestockById(a.livestockId)?.name },
      { header: t("filter.farm"), value: (a) => getFarmById(a.farmId)?.name },
      { header: t("alerts.column.detectedAt"), value: (a) => tRel(a.detectedAt) },
      { header: t("alerts.column.assignedTo"), value: (a) => a.assignedTo ?? t("alerts.unassigned") },
      { header: t("livestock.column.status"), value: (a) => t("status." + a.status) },
      { header: t("insights.confidence"), value: (a) => `${a.aiConfidence}%` },
    ]);
    return filtered.length;
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const openAlerts = alerts.filter((a) => a.status !== "resolved");
  const criticalCount = openAlerts.filter((a) => a.severity === "critical").length;
  const highCount = openAlerts.filter((a) => a.severity === "high").length;
  const warningCount = openAlerts.filter((a) => a.severity === "warning").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;
  const assignedToMeCount = alerts.filter((a) => a.assignedTo === me).length;

  const categoryOptions = categoryValues.map((value) => ({ value, label: t("category." + value) }));
  const severityOptions = severityValues.map((value) => ({ value, label: t("severity." + value) }));

  const columns: ColumnDef<Alert, unknown>[] = [
    {
      accessorKey: "severity",
      header: t("alerts.column.severity"),
      cell: ({ getValue }) => <SeverityBadge severity={getValue() as Alert["severity"]} />,
    },
    {
      id: "title",
      header: t("alerts.column.alert"),
      cell: ({ row }) => (
        <button type="button" onClick={() => navigate(`/dashboard/alerts/${row.original.id}`)} className="text-left font-medium hover:text-terrava-primary hover:underline">
          {tr(row.original.title)}
        </button>
      ),
    },
    { id: "livestock", header: t("nav.item.livestock"), cell: ({ row }) => getLivestockById(row.original.livestockId)?.name ?? "-" },
    {
      accessorKey: "category",
      header: t("alerts.column.category"),
      cell: ({ getValue }) => t("category." + (getValue() as string)),
    },
    { id: "farm", header: t("filter.farm"), cell: ({ row }) => getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ") },
    { accessorKey: "detectedAt", header: t("alerts.column.detectedAt"), cell: ({ getValue }) => tRel(getValue() as string) },
    {
      id: "assignedTo",
      header: t("alerts.column.assignedTo"),
      cell: ({ row }) => row.original.assignedTo ?? <span className="text-terrava-muted">{t("alerts.unassigned")}</span>,
    },
    {
      accessorKey: "status",
      header: t("livestock.column.status"),
      cell: ({ getValue }) => {
        const status = getValue() as Alert["status"];
        const tone =
          status === "resolved"
            ? "bg-terrava-primary/10 text-terrava-primary"
            : status === "acknowledged"
            ? "bg-terrava-info/10 text-terrava-info"
            : "bg-terrava-warning/10 text-terrava-warning";
        return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{t("status." + status)}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: t("common.viewDetail"), onClick: () => navigate(`/dashboard/alerts/${row.original.id}`) },
            { label: t("alerts.action.assign"), onClick: () => setAssignTarget({ ids: [row.original.id], current: row.original.assignedTo }) },
            ...(row.original.status === "active" ? [{ label: t("alerts.action.acknowledge"), onClick: () => acknowledge([row.original.id]) }] : []),
            ...(row.original.status !== "resolved"
              ? [{ label: t("alerts.action.resolve"), onClick: () => resolve([row.original.id]) }]
              : [{ label: t("alerts.action.reopen"), onClick: () => reopen(row.original.id) }]),
            {
              label: t("insights.createTask"),
              onClick: () =>
                setTaskDraft({
                  title: t("tasks.followUp", { title: tr(row.original.title), name: getLivestockById(row.original.livestockId)?.name ?? "" }),
                  farmId: row.original.farmId,
                  assignee: row.original.assignedTo,
                  source: { type: "alert", id: row.original.id },
                }),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("alerts.title")} subtitle={t("alerts.subtitle")} actions={<ExportButton onExport={exportAlerts} />} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard icon={BellRing} label={t("alerts.metric.totalActive")} value={activeCount} />
        <MetricCard icon={ShieldAlert} label={t("severity.critical")} value={criticalCount} tone="error" />
        <MetricCard icon={Flame} label={t("severity.high")} value={highCount} tone="warning" />
        <MetricCard icon={TriangleAlert} label={t("severity.warning")} value={warningCount} tone="warning" />
        <MetricCard icon={CircleCheck} label={t("status.resolved")} value={resolvedCount} />
      </div>

      <Tabs
        tabs={[
          { value: "all", label: t("common.all"), count: alerts.length },
          { value: "active", label: t("status.active"), count: activeCount },
          { value: "assigned", label: t("alerts.tab.assignedToMe"), count: assignedToMeCount },
          { value: "resolved", label: t("status.resolved"), count: resolvedCount },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3 shadow-card">
        <SearchInput value={search} onChange={setSearch} placeholder={t("alerts.searchPlaceholder")} className="w-full sm:w-60" />
        <FilterSelect label={t("filter.severity")} value={severity} onChange={setSeverity} options={severityOptions} />
        <FilterSelect label={t("filter.category")} value={category} onChange={setCategory} options={categoryOptions} />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        enableRowSelection
        emptyTitle={t("alerts.emptyTitle")}
        emptyDescription={t("alerts.emptyDescription")}
        bulkActions={(selected, clear) => (
          <>
            <button
              type="button"
              onClick={() => {
                acknowledge(selected.map((a) => a.id));
                clear();
              }}
              className={bulkButton}
            >
              {t("alerts.action.acknowledge")}
            </button>
            <button
              type="button"
              onClick={() => {
                resolve(selected.map((a) => a.id));
                clear();
              }}
              className={bulkButton}
            >
              {t("alerts.action.bulkResolve")}
            </button>
            <button type="button" onClick={() => setAssignTarget({ ids: selected.map((a) => a.id), onDone: clear })} className={bulkButton}>
              {t("alerts.action.bulkAssign")}
            </button>
          </>
        )}
        renderMobileCard={(alert) => (
          <button type="button" onClick={() => navigate(`/dashboard/alerts/${alert.id}`)} className="block w-full text-left">
            <span className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-terrava-text">{tr(alert.title)}</span>
              <SeverityBadge severity={alert.severity} />
            </span>
            <span className="block text-xs text-terrava-muted">
              {getLivestockById(alert.livestockId)?.name} &middot; {tRel(alert.detectedAt)} &middot; {t("status." + alert.status)}
            </span>
          </button>
        )}
      />

      <AssignStaffModal
        open={!!assignTarget}
        title={assignTarget && assignTarget.ids.length > 1 ? t("alerts.bulkAssignTitle", { count: assignTarget.ids.length }) : t("alerts.assignTitle")}
        current={assignTarget?.current}
        onClose={() => setAssignTarget(null)}
        onAssign={(name) => {
          if (!assignTarget) return;
          updateAlerts(assignTarget.ids, { assignedTo: name });
          assignTarget.onDone?.();
          toast.success(t("alerts.toast.assignedTo", { count: assignTarget.ids.length, name }));
        }}
      />
      <CreateTaskModal draft={taskDraft} onClose={() => setTaskDraft(null)} />
    </div>
  );
}
