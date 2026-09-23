import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Cpu, Radio, WifiOff, BatteryLow, Wrench, Gauge } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import Tabs from "@/components/dashboard/Tabs";
import SearchInput from "@/components/dashboard/SearchInput";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import DataTable from "@/components/dashboard/DataTable";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import ChartCard from "@/components/charts/ChartCard";
import DeviceUptimeChart from "@/components/charts/DeviceUptimeChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { devices } from "@/data/mockDevices";
import { batteryDistribution, deviceErrorCategory } from "@/data/dashboardChartData";
import { farms, getFarmById } from "@/data/mockFarms";
import { getLivestockById } from "@/data/mockLivestock";
import type { Device } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const typeTabValues = ["all", "ear-tag", "gateway", "environmental-sensor"];

export default function DeviceManagementPage() {
  const navigate = useNavigate();
  const { t, tRel } = useLanguage();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [farmFilter, setFarmFilter] = useState("all");

  useEffect(() => {
    document.title = "Device Management | Terrava";
  }, []);

  const filtered = useMemo(() => {
    return devices.filter((device) => {
      const matchesTab = tab === "all" || device.type === tab;
      const matchesSearch = search.trim().length === 0 || device.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || device.status === status;
      const matchesFarm = farmFilter === "all" || device.farmId === farmFilter;
      return matchesTab && matchesSearch && matchesStatus && matchesFarm;
    });
  }, [tab, search, status, farmFilter]);

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const lowBatteryCount = devices.filter((d) => d.status === "low-battery").length;
  const maintenanceCount = devices.filter((d) => d.status === "maintenance").length;
  const avgUptime = Math.round(devices.reduce((sum, d) => sum + d.uptime, 0) / devices.length);

  const typeTabs = typeTabValues.map((value) => ({
    value,
    label: value === "all" ? t("devices.tab.all") : t("devices.tab." + value),
  }));

  const columns: ColumnDef<Device, unknown>[] = [
    { accessorKey: "name", header: t("devices.column.device") },
    {
      accessorKey: "type",
      header: t("livestock.column.type"),
      cell: ({ getValue }) => t("deviceType." + (getValue() as string)),
    },
    {
      id: "assigned",
      header: t("devices.column.assigned"),
      cell: ({ row }) =>
        row.original.assignedLivestockId ? getLivestockById(row.original.assignedLivestockId)?.name : <span className="text-terrava-muted">-</span>,
    },
    { id: "farm", header: t("filter.farm"), cell: ({ row }) => getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ") },
    { accessorKey: "status", header: t("livestock.column.status"), cell: ({ getValue }) => <DeviceStatusBadge status={getValue() as Device["status"]} /> },
    { accessorKey: "battery", header: t("devices.battery"), cell: ({ getValue }) => `${getValue()}%` },
    { accessorKey: "signal", header: t("devices.signal"), cell: ({ getValue }) => `${getValue()}%` },
    { accessorKey: "firmware", header: t("devices.firmware") },
    { accessorKey: "lastSync", header: t("devices.lastSync"), cell: ({ getValue }) => tRel(getValue() as string) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: t("common.viewDetail"), onClick: () => navigate(`/dashboard/devices/${row.original.id}`) },
            { label: t("devices.action.assign"), onClick: () => toast.success(t("devices.toast.assigned")) },
            { label: t("devices.action.unassign"), onClick: () => toast.success(t("devices.toast.unassigned")) },
            { label: t("devices.action.diagnostics"), onClick: () => toast.success(t("devices.toast.diagnostics")) },
            { label: t("devices.action.markMaintenance"), onClick: () => toast.success(t("devices.toast.maintenance")) },
            { label: t("devices.action.restart"), onClick: () => toast.success(t("devices.toast.restarted")) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t("devices.title")} subtitle={t("devices.subtitle")} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={Cpu} label={t("devices.metric.total")} value={devices.length} />
        <MetricCard icon={Radio} label={t("status.online")} value={onlineCount} />
        <MetricCard icon={WifiOff} label={t("status.offline")} value={offlineCount} tone="error" />
        <MetricCard icon={BatteryLow} label={t("status.low-battery")} value={lowBatteryCount} tone="warning" />
        <MetricCard icon={Wrench} label={t("status.maintenance")} value={maintenanceCount} tone="warning" />
        <MetricCard icon={Gauge} label={t("devices.metric.avgUptime")} value={`${avgUptime}%`} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("chart.deviceUptime")}>
          <DeviceUptimeChart />
        </ChartCard>
        <ChartCard title={t("chart.batteryDistribution")}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={batteryDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} isAnimationActive>
                {batteryDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("chart.connectivityTrend")}>
          <DeviceUptimeChart />
        </ChartCard>
        <ChartCard title={t("chart.deviceErrorCategory")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deviceErrorCategory} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Bar dataKey="count" fill="#C95B5B" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Tabs tabs={typeTabs} active={tab} onChange={setTab} />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t("devices.searchPlaceholder")} className="w-full sm:w-64" />
        <FilterSelect
          label={t("livestock.column.status")}
          value={status}
          onChange={setStatus}
          options={[
            { value: "online", label: t("status.online") },
            { value: "offline", label: t("status.offline") },
            { value: "low-battery", label: t("status.low-battery") },
            { value: "maintenance", label: t("status.maintenance") },
          ]}
        />
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        emptyTitle={t("devices.emptyTitle")}
        emptyDescription={t("devices.emptyDescription")}
        renderMobileCard={(device) => (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-terrava-text">{device.name}</p>
              <DeviceStatusBadge status={device.status} />
            </div>
            <p className="text-xs text-terrava-muted">
              {t("devices.battery")} {device.battery}% &middot; {t("devices.signal")} {device.signal}%
            </p>
          </div>
        )}
      />
    </div>
  );
}
