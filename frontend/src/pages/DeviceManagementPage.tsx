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

const typeTabs = [
  { value: "all", label: "All Devices" },
  { value: "ear-tag", label: "Smart Ear Tags" },
  { value: "gateway", label: "Gateways" },
  { value: "environmental-sensor", label: "Environmental Sensors" },
];

export default function DeviceManagementPage() {
  const navigate = useNavigate();
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

  const columns: ColumnDef<Device, unknown>[] = [
    { accessorKey: "name", header: "Device" },
    { accessorKey: "type", header: "Type", cell: ({ getValue }) => <span className="capitalize">{(getValue() as string).replace("-", " ")}</span> },
    { id: "assigned", header: "Assigned Livestock", cell: ({ row }) => (row.original.assignedLivestockId ? getLivestockById(row.original.assignedLivestockId)?.name : <span className="text-terrava-muted">-</span>) },
    { id: "farm", header: "Farm", cell: ({ row }) => getFarmById(row.original.farmId)?.name.split(" ").slice(0, 2).join(" ") },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <DeviceStatusBadge status={getValue() as Device["status"]} /> },
    { accessorKey: "battery", header: "Battery", cell: ({ getValue }) => `${getValue()}%` },
    { accessorKey: "signal", header: "Signal", cell: ({ getValue }) => `${getValue()}%` },
    { accessorKey: "firmware", header: "Firmware" },
    { accessorKey: "lastSync", header: "Last Sync" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActionsMenu
          actions={[
            { label: "View detail", onClick: () => navigate(`/dashboard/devices/${row.original.id}`) },
            { label: "Assign", onClick: () => toast.success("Perangkat berhasil ditugaskan.") },
            { label: "Unassign", onClick: () => toast.success("Penugasan perangkat dibatalkan.") },
            { label: "Run diagnostics", onClick: () => toast.success("Diagnostik perangkat sedang berjalan.") },
            { label: "Mark maintenance", onClick: () => toast.success("Perangkat ditandai perlu maintenance.") },
            { label: "Restart simulation", onClick: () => toast.success("Simulasi restart perangkat berhasil.") },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Device Management" subtitle="Kelola smart ear tag, gateway, dan sensor lingkungan." />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={Cpu} label="Total Devices" value={devices.length} />
        <MetricCard icon={Radio} label="Online" value={onlineCount} />
        <MetricCard icon={WifiOff} label="Offline" value={offlineCount} tone="error" />
        <MetricCard icon={BatteryLow} label="Low Battery" value={lowBatteryCount} tone="warning" />
        <MetricCard icon={Wrench} label="Maintenance" value={maintenanceCount} tone="warning" />
        <MetricCard icon={Gauge} label="Avg Uptime" value={`${avgUptime}%`} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Device Uptime">
          <DeviceUptimeChart />
        </ChartCard>
        <ChartCard title="Battery Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={batteryDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} isAnimationActive>
                {batteryDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Connectivity Trend">
          <DeviceUptimeChart />
        </ChartCard>
        <ChartCard title="Device Error Category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deviceErrorCategory} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F5F8F6" }} />
              <Bar dataKey="count" fill="#C95B5B" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Tabs tabs={typeTabs} active={tab} onChange={setTab} />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari perangkat..." className="w-full sm:w-64" />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            { value: "low-battery", label: "Low Battery" },
            { value: "maintenance", label: "Maintenance" },
          ]}
        />
        <FilterSelect label="Farm" value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        emptyTitle="Tidak ada perangkat"
        emptyDescription="Tidak ada perangkat yang sesuai dengan filter."
        renderMobileCard={(device) => (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-terrava-text">{device.name}</p>
              <DeviceStatusBadge status={device.status} />
            </div>
            <p className="text-xs text-terrava-muted">Battery {device.battery}% &middot; Signal {device.signal}%</p>
          </div>
        )}
      />
    </div>
  );
}
