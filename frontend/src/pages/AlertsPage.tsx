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

const categoryOptions = [
  { value: "health", label: "Health" },
  { value: "behavior", label: "Behavior" },
  { value: "location", label: "Location" },
  { value: "device", label: "Device" },
  { value: "environmental", label: "Environmental" },
  { value: "weather", label: "Weather" },
];

const severityOptions = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function AlertsPage() {
  const navigate = useNavigate();
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
      const matchesSearch = search.trim().length === 0 || alert.title.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severity === "all" || alert.severity === severity;
      const matchesCategory = category === "all" || alert.category === category;
      const matchesFarm = farmFilter === "all" || alert.farmId === farmFilter;
      return matchesTab && matchesSearch && matchesSeverity && matchesCategory && matchesFarm;
    });
  }, [tab, search, severity, category, farmFilter]);

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const resolvedTodayCount = alerts.filter((a) => a.status === "resolved").length;

  const columns: ColumnDef<Alert, unknown>[] = [
    { accessorKey: "severity", header: "Severity", cell: ({ getValue }) => <SeverityBadge severity={getValue() as Alert["severity"]} /> },
    { accessorKey: "title", header: "Alert" },
    { id: "livestock", header: "Livestock", cell: ({ row }) => getLivestockById(row.original.livestockId)?.name ?? "-" },
    { accessorKey: "category", header: "Category", cell: ({ getValue }) => <span className="capitalize">{getValue() as string}</span> },
    { id: "farm", header: "Farm", cell: ({ row }) => getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ") },
    { accessorKey: "detectedAt", header: "Detected At" },
    { id: "assignedTo", header: "Assigned To", cell: ({ row }) => row.original.assignedTo ?? <span className="text-terrava-muted">Unassigned</span> },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as Alert["status"];
        const tone = status === "resolved" ? "bg-terrava-primary/10 text-terrava-primary" : status === "acknowledged" ? "bg-terrava-info/10 text-terrava-info" : "bg-terrava-warning/10 text-terrava-warning";
        return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>{status}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: "View", onClick: () => navigate(`/dashboard/alerts/${row.original.id}`) },
            { label: "Assign", onClick: () => toast.success("Alert ditugaskan.") },
            { label: "Mark as acknowledged", onClick: () => toast.success("Alert ditandai sebagai diketahui.") },
            { label: "Resolve", onClick: () => toast.success("Alert berhasil diselesaikan.") },
            { label: "Create task", onClick: () => toast.success("Task berhasil dibuat.") },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Alerts Center"
        subtitle="Kelola dan tindak lanjuti seluruh peringatan kesehatan, lokasi, dan perangkat."
        actions={<ExportButton />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard icon={BellRing} label="Total Active Alerts" value={activeCount} />
        <MetricCard icon={ShieldAlert} label="Critical" value={criticalCount} tone="error" />
        <MetricCard icon={Flame} label="High" value={highCount} tone="warning" />
        <MetricCard icon={TriangleAlert} label="Warning" value={warningCount} tone="warning" />
        <MetricCard icon={CircleCheck} label="Resolved Today" value={resolvedTodayCount} />
      </div>

      <Tabs
        tabs={[
          { value: "all", label: "All", count: alerts.length },
          { value: "active", label: "Active", count: activeCount },
          { value: "assigned", label: "Assigned to Me", count: alerts.filter((a) => a.assignedTo === "Budi Santoso").length },
          { value: "resolved", label: "Resolved", count: alerts.filter((a) => a.status === "resolved").length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari alert..." className="w-full sm:w-60" />
        <FilterSelect label="Severity" value={severity} onChange={setSeverity} options={severityOptions} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={categoryOptions} />
        <FilterSelect label="Farm" value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        enableRowSelection
        emptyTitle="Tidak ada alert"
        emptyDescription="Tidak ada alert yang sesuai dengan filter saat ini."
        bulkActions={
          <>
            <button onClick={() => toast.success("Alert terpilih berhasil diselesaikan.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
              Bulk Resolve
            </button>
            <button onClick={() => toast.success("Alert terpilih berhasil ditugaskan.")} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-primary hover:bg-white">
              Bulk Assign
            </button>
          </>
        }
        renderMobileCard={(alert) => (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-terrava-text">{alert.title}</p>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="text-xs text-terrava-muted">{getLivestockById(alert.livestockId)?.name} &middot; {alert.detectedAt}</p>
          </div>
        )}
      />
    </div>
  );
}
