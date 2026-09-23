import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { BellRing, TriangleAlert, Flame, ShieldAlert, CircleCheck } from "lucide-react";
import { alerts } from "@/data/mockAlerts";
import { getLivestockById } from "@/data/mockLivestock";
import { farms, getFarmById } from "@/data/mockFarms";
import type { Alert } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const categoryValues = ["health", "behavior", "location", "device", "environmental", "weather"];
const severityValues = ["info", "warning", "high", "critical"];

export default function AlertsPage() {
  const navigate = useNavigate();
  const { t, tr, tRel } = useLanguage();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [category, setCategory] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");

  useEffect(() => {
    document.title = "Alerts Center | Terrava";
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesTab =
        tab === "all" ||
        (tab === "active" && alert.status === "active") ||
        (tab === "assigned" && alert.assignedTo === "Budi Santoso") ||
        (tab === "resolved" && alert.status === "resolved");
      const matchesSearch = search.trim().length === 0 || tr(alert.title).toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severity === "all" || alert.severity === severity;
      const matchesCategory = category === "all" || alert.category === category;
      const matchesFarm = farmFilter === "all" || alert.farmId === farmFilter;
      return matchesTab && matchesSearch && matchesSeverity && matchesCategory && matchesFarm;
    });
  }, [tab, search, severity, category, farmFilter, tr]);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const resolvedTodayCount = alerts.filter((a) => a.status === "resolved").length;

  const categoryOptions = categoryValues.map((value) => ({ value, label: t("category." + value) }));
  const severityOptions = severityValues.map((value) => ({ value, label: t("severity." + value) }));

  const columns: ColumnDef<Alert, unknown>[] = [
    {
      accessorKey: "severity",
      header: t("alerts.column.severity"),
      cell: ({ getValue }) => <SeverityBadge severity={getValue() as Alert["severity"]} />,
    },
    { id: "title", header: t("alerts.column.alert"), cell: ({ row }) => tr(row.original.title) },
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
        const tone = status === "resolved" ? "bg-terrava-primary/10 text-terrava-primary" : status === "acknowledged" ? "bg-terrava-info/10 text-terrava-info" : "bg-terrava-warning/10 text-terrava-warning";
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
            { label: t("alerts.action.assign"), onClick: () => toast.success(t("alerts.toast.assigned")) },
            { label: t("alerts.action.acknowledge"), onClick: () => toast.success(t("alerts.toast.acknowledged")) },
            { label: t("alerts.action.resolve"), onClick: () => toast.success(t("alerts.toast.resolved")) },
            { label: t("insights.createTask"), onClick: () => toast.success(t("insights.taskCreated")) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        actions={<ExportButton />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard icon={BellRing} label={t("alerts.metric.totalActive")} value={activeCount} />
        <MetricCard icon={ShieldAlert} label={t("severity.critical")} value={criticalCount} tone="error" />
        <MetricCard icon={Flame} label={t("severity.high")} value={highCount} tone="warning" />
        <MetricCard icon={TriangleAlert} label={t("severity.warning")} value={warningCount} tone="warning" />
        <MetricCard icon={CircleCheck} label={t("alerts.metric.resolvedToday")} value={resolvedTodayCount} />
      </div>

      <Tabs
        tabs={[
          { value: "all", label: t("common.all"), count: alerts.length },
          { value: "active", label: t("status.active"), count: activeCount },
          { value: "assigned", label: t("alerts.tab.assignedToMe"), count: alerts.filter((a) => a.assignedTo === "Budi Santoso").length },
          { value: "resolved", label: t("status.resolved"), count: alerts.filter((a) => a.status === "resolved").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
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
        bulkActions={
          <>
            <button onClick={() => toast.success(t("alerts.toast.bulkResolved"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
              {t("alerts.action.bulkResolve")}
            </button>
            <button onClick={() => toast.success(t("alerts.toast.bulkAssigned"))} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
              {t("alerts.action.bulkAssign")}
            </button>
          </>
        }
        renderMobileCard={(alert) => (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-terrava-text">{tr(alert.title)}</p>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="text-xs text-terrava-muted">
              {getLivestockById(alert.livestockId)?.name} &middot; {tRel(alert.detectedAt)}
            </p>
          </div>
        )}
      />
    </div>
  );
}
