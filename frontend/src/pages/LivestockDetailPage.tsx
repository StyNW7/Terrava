import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Thermometer, HeartPulse, Activity, MapPin, BatteryFull } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Tabs from "@/components/dashboard/Tabs";
import StatusBadge from "@/components/dashboard/StatusBadge";
import HealthScoreBadge from "@/components/dashboard/HealthScoreBadge";
import ErrorState from "@/components/dashboard/ErrorState";
import RowActionsMenu from "@/components/dashboard/RowActionsMenu";
import LivestockOverviewTab from "@/components/livestock/LivestockOverviewTab";
import LivestockVitalSignsTab from "@/components/livestock/LivestockVitalSignsTab";
import LivestockHealthRecordsTab from "@/components/livestock/LivestockHealthRecordsTab";
import LivestockAlertsTab from "@/components/livestock/LivestockAlertsTab";
import LivestockLocationTab from "@/components/livestock/LivestockLocationTab";
import LivestockDeviceTab from "@/components/livestock/LivestockDeviceTab";
import LivestockTimelineTab from "@/components/livestock/LivestockTimelineTab";
import { getLivestockById } from "@/data/mockLivestock";
import { getFarmById, getBarnById } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

const tabValues = ["overview", "vitals", "records", "alerts", "location", "device", "timeline"];

export default function LivestockDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, tRel } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const animal = id ? getLivestockById(id) : undefined;

  useEffect(() => {
    document.title = animal ? `${animal.name} | Terrava` : "Livestock Detail | Terrava";
  }, [animal]);

  if (!animal) {
    return (
      <ErrorState
        title={t("livestock.notFound")}
        description={t("livestock.notFoundDescription")}
        onRetry={() => navigate("/dashboard/livestock")}
      />
    );
  }

  const tabs = tabValues.map((value) => ({ value, label: t("livestock.tab." + value) }));
  const farm = getFarmById(animal.farmId);
  const barn = getBarnById(animal.barnId);

  return (
    <div>
      <Breadcrumb items={[{ label: t("nav.item.livestock"), href: "/dashboard/livestock" }, { label: animal.name }]} />

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-terrava-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/livestock")} aria-label={t("common.back")} className="rounded-lg p-2 text-terrava-muted hover:bg-terrava-bg">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <img src={animal.photo} alt={animal.name} className="h-16 w-16 rounded-xl object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-terrava-text">{animal.name}</h1>
              <StatusBadge status={animal.healthStatus} />
            </div>
            <p className="text-sm text-terrava-muted">
              {animal.code} &middot; {farm?.name} &middot; {barn?.name} &middot;{" "}
              {t("monitoring.updated", { time: tRel(animal.lastUpdate) })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => toast.success(t("livestock.toast.edit", { name: animal.name }))} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.edit")}
          </button>
          <RowActionsMenu
            actions={[
              { label: t("livestock.action.assignDevice"), onClick: () => toast.success(t("livestock.toast.deviceAssigned")) },
              { label: t("livestock.action.moveBarn"), onClick: () => toast.success(t("livestock.toast.barnMoved")) },
              { label: t("livestock.action.archive"), onClick: () => toast.success(t("livestock.toast.archived")), danger: true },
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={HeartPulse} label={t("livestock.column.healthScore")} value={<HealthScoreBadge score={animal.healthScore} />} />
        <SummaryCard icon={Thermometer} label={t("vitals.temperature")} value={`${animal.temperature}°C`} />
        <SummaryCard icon={HeartPulse} label={t("vitals.heartRate")} value={`${animal.heartRate} bpm`} />
        <SummaryCard icon={Activity} label={t("vitals.activity")} value={`${animal.activityLevel}/100`} />
        <SummaryCard icon={MapPin} label={t("category.location")} value={t("livestock.inBarn")} />
        <SummaryCard icon={BatteryFull} label={t("devices.deviceBattery")} value={animal.deviceId ? `${animal.batteryLevel}%` : "-"} />
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <LivestockOverviewTab animal={animal} />}
      {activeTab === "vitals" && <LivestockVitalSignsTab animal={animal} />}
      {activeTab === "records" && <LivestockHealthRecordsTab animal={animal} />}
      {activeTab === "alerts" && <LivestockAlertsTab animal={animal} />}
      {activeTab === "location" && <LivestockLocationTab animal={animal} />}
      {activeTab === "device" && <LivestockDeviceTab animal={animal} />}
      {activeTab === "timeline" && <LivestockTimelineTab animal={animal} />}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof MoreVertical; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-4">
      <Icon className="mb-2 h-4 w-4 text-terrava-primary" aria-hidden="true" />
      <p className="text-xs text-terrava-muted">{label}</p>
      <div className="mt-1 text-sm font-bold text-terrava-text">{value}</div>
    </div>
  );
}
