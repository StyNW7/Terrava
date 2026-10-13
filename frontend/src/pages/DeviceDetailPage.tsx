import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BatteryFull, Radio, Gauge, Clock, Cpu, Database } from "lucide-react";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Tabs from "@/components/dashboard/Tabs";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import ErrorState from "@/components/dashboard/ErrorState";
import DeviceOverviewTab from "@/components/devices/DeviceOverviewTab";
import DeviceSensorDataTab from "@/components/devices/DeviceSensorDataTab";
import DeviceConnectivityTab from "@/components/devices/DeviceConnectivityTab";
import DeviceLogsTab from "@/components/devices/DeviceLogsTab";
import DeviceMaintenanceTab from "@/components/devices/DeviceMaintenanceTab";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useDeviceActions } from "@/hooks/useDeviceActions";
import DeviceDiagnosticsModal from "@/components/devices/DeviceDiagnosticsModal";
import AssignToLivestockModal from "@/components/devices/AssignToLivestockModal";

const tabValues = ["overview", "sensor", "connectivity", "logs", "maintenance"];

export default function DeviceDetailPage() {
  const { getDeviceById, getLivestockById } = useDataStore();
  const actions = useDeviceActions();
  const [diagnosing, setDiagnosing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t, tRel } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const device = id ? getDeviceById(id) : undefined;

  useEffect(() => {
    document.title = device ? `${device.name} | Terrava` : "Device Detail | Terrava";
  }, [device]);

  if (!device) {
    return <ErrorState title={t("devices.notFound")} onRetry={() => navigate("/dashboard/devices")} />;
  }

  const tabs = tabValues.map((value) => ({ value, label: t("devices.tab.detail." + value) }));
  const animal = device.assignedLivestockId ? getLivestockById(device.assignedLivestockId) : undefined;

  return (
    <div>
      <Breadcrumb items={[{ label: t("nav.item.devices"), href: "/dashboard/devices" }, { label: device.name }]} />

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-terrava-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-terrava-text">{device.name}</h1>
            <DeviceStatusBadge status={device.status} />
          </div>
          <p className="text-sm text-terrava-muted">
            {device.id} &middot; {t("deviceType." + device.type)}
            {animal ? ` · ${t("devices.assignedTo", { name: animal.name })}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {device.type === "ear-tag" && (
            <button
              type="button"
              onClick={() => (device.assignedLivestockId ? actions.unassign(device) : setAssigning(true))}
              className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
            >
              {device.assignedLivestockId ? t("devices.action.unassign") : t("devices.action.assign")}
            </button>
          )}
          <button type="button" onClick={() => actions.toggleMaintenance(device)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {device.status === "maintenance" ? t("devices.action.endMaintenance") : t("devices.action.markMaintenance")}
          </button>
          <button type="button" onClick={() => setDiagnosing(true)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("devices.action.diagnostics")}
          </button>
          <button type="button" onClick={() => actions.restart(device)} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {t("devices.action.restart")}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={BatteryFull} label={t("devices.battery")} value={`${device.battery}%`} />
        <SummaryCard icon={Radio} label={t("devices.signal")} value={`${device.signal}%`} />
        <SummaryCard icon={Gauge} label={t("devices.uptime")} value={`${device.uptime}%`} />
        <SummaryCard icon={Clock} label={t("devices.lastSync")} value={tRel(device.lastSync)} />
        <SummaryCard icon={Cpu} label={t("devices.firmware")} value={device.firmware} />
        <SummaryCard
          icon={Database}
          label={t("devices.dataPackets")}
          value={device.dataPackets.toLocaleString(lang === "id" ? "id-ID" : "en-GB")}
        />
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <DeviceOverviewTab device={device} />}
      {activeTab === "sensor" && <DeviceSensorDataTab device={device} />}
      {activeTab === "connectivity" && <DeviceConnectivityTab />}
      {activeTab === "logs" && <DeviceLogsTab device={device} />}
      {activeTab === "maintenance" && <DeviceMaintenanceTab device={device} />}

      <DeviceDiagnosticsModal device={diagnosing ? device : null} onClose={() => setDiagnosing(false)} onFinished={actions.logDiagnostics} />
      <AssignToLivestockModal device={assigning ? device : null} onClose={() => setAssigning(false)} />
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
