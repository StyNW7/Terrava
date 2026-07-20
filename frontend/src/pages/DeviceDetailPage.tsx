import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BatteryFull, Radio, Gauge, Clock, Cpu, Database } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Tabs from "@/components/dashboard/Tabs";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import ErrorState from "@/components/dashboard/ErrorState";
import DeviceOverviewTab from "@/components/devices/DeviceOverviewTab";
import DeviceSensorDataTab from "@/components/devices/DeviceSensorDataTab";
import DeviceConnectivityTab from "@/components/devices/DeviceConnectivityTab";
import DeviceLogsTab from "@/components/devices/DeviceLogsTab";
import DeviceMaintenanceTab from "@/components/devices/DeviceMaintenanceTab";
import { getDeviceById } from "@/data/mockDevices";
import { getLivestockById } from "@/data/mockLivestock";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "sensor", label: "Sensor Data" },
  { value: "connectivity", label: "Connectivity" },
  { value: "logs", label: "Logs" },
  { value: "maintenance", label: "Maintenance" },
];

export default function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const device = id ? getDeviceById(id) : undefined;

  useEffect(() => {
    document.title = device ? `${device.name} | Terrava` : "Device Detail | Terrava";
  }, [device]);

  if (!device) {
    return <ErrorState title="Perangkat tidak ditemukan" onRetry={() => navigate("/dashboard/devices")} />;
  }

  const animal = device.assignedLivestockId ? getLivestockById(device.assignedLivestockId) : undefined;

  return (
    <div>
      <Breadcrumb items={[{ label: "Devices", href: "/dashboard/devices" }, { label: device.name }]} />

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-terrava-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-terrava-text">{device.name}</h1>
            <DeviceStatusBadge status={device.status} />
          </div>
          <p className="text-sm text-terrava-muted">
            {device.id} &middot; <span className="capitalize">{device.type.replace("-", " ")}</span>
            {animal ? ` · Assigned to ${animal.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => toast.success("Diagnostik perangkat sedang berjalan.")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Run Diagnostics
          </button>
          <button onClick={() => toast.success("Simulasi restart berhasil.")} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            Restart Simulation
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={BatteryFull} label="Battery" value={`${device.battery}%`} />
        <SummaryCard icon={Radio} label="Signal" value={`${device.signal}%`} />
        <SummaryCard icon={Gauge} label="Uptime" value={`${device.uptime}%`} />
        <SummaryCard icon={Clock} label="Last Sync" value={device.lastSync} />
        <SummaryCard icon={Cpu} label="Firmware" value={device.firmware} />
        <SummaryCard icon={Database} label="Data Packets" value={device.dataPackets.toLocaleString("id-ID")} />
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <DeviceOverviewTab device={device} />}
      {activeTab === "sensor" && <DeviceSensorDataTab device={device} />}
      {activeTab === "connectivity" && <DeviceConnectivityTab />}
      {activeTab === "logs" && <DeviceLogsTab device={device} />}
      {activeTab === "maintenance" && <DeviceMaintenanceTab device={device} />}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof BatteryFull; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-4">
      <Icon className="mb-2 h-4 w-4 text-terrava-primary" aria-hidden="true" />
      <p className="text-xs text-terrava-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-terrava-text">{value}</p>
    </div>
  );
}
