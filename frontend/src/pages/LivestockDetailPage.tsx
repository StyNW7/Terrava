import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Thermometer, HeartPulse, Activity, MapPin, BatteryFull, Archive } from "lucide-react";
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
import MoveLivestockModal from "@/components/livestock/MoveLivestockModal";
import AssignDeviceModal from "@/components/livestock/AssignDeviceModal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useUnits } from "@/hooks/useSettings";

const tabValues = ["overview", "vitals", "records", "alerts", "location", "device", "timeline"];

export default function LivestockDetailPage() {
  const { getLivestockById, getFarmById, getBarnById, updateLivestock } = useDataStore();
  const { formatTemp } = useUnits();
  const [moveOpen, setMoveOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
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

      {animal.archived && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-terrava-warning/30 bg-terrava-warning/10 px-4 py-3 text-sm text-terrava-text">
          <Archive className="h-4 w-4 text-terrava-warning" aria-hidden="true" />
          <span className="flex-1">{t("livestock.archivedBanner")}</span>
          <button
            type="button"
            onClick={() => {
              updateLivestock([animal.id], { archived: false });
              toast.success(t("livestock.toast.restored", { count: 1 }));
            }}
            className="text-xs font-semibold text-terrava-primary hover:underline"
          >
            {t("livestock.action.restore")}
          </button>
        </div>
      )}

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
          <button
            type="button"
            onClick={() => navigate(`/dashboard/livestock/${animal.id}/edit`)}
            className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
          >
            {t("common.edit")}
          </button>
          <RowActionsMenu
            actions={[
              { label: t("livestock.action.assignDevice"), onClick: () => setDeviceOpen(true) },
              { label: t("livestock.action.moveBarn"), onClick: () => setMoveOpen(true) },
              ...(animal.archived ? [] : [{ label: t("livestock.action.archive"), onClick: () => setArchiveOpen(true), danger: true }]),
            ]}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={HeartPulse} label={t("livestock.column.healthScore")} value={<HealthScoreBadge score={animal.healthScore} />} />
        <SummaryCard icon={Thermometer} label={t("vitals.temperature")} value={formatTemp(animal.temperature)} />
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

      <MoveLivestockModal ids={moveOpen ? [animal.id] : null} onClose={() => setMoveOpen(false)} />
      <AssignDeviceModal livestockId={deviceOpen ? animal.id : null} onClose={() => setDeviceOpen(false)} />
      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          updateLivestock([animal.id], { archived: true });
          toast.success(t("livestock.toast.archived"));
          navigate("/dashboard/livestock");
        }}
        title={t("livestock.archiveConfirmTitle", { count: 1 })}
        description={t("livestock.archiveConfirmDescription")}
        confirmLabel={t("livestock.action.archive")}
        tone="danger"
      />
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
