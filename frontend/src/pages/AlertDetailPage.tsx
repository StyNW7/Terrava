import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BrainCircuit,
  Thermometer,
  HeartPulse,
  Activity,
  Droplets,
  CheckCircle2,
  UserPlus,
  MessageSquarePlus,
  ClipboardList,
  BellRing,
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import Timeline from "@/components/dashboard/Timeline";
import ErrorState from "@/components/dashboard/ErrorState";
import Modal from "@/components/dashboard/Modal";
import { getAlertById } from "@/data/mockAlerts";
import { getLivestockById } from "@/data/mockLivestock";
import { getFarmById, getBarnById } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

export default function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, tr, tt, tRel } = useLanguage();
  const alert = id ? getAlertById(id) : undefined;
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    document.title = alert ? `${tr(alert.title)} | Terrava` : "Alert Detail | Terrava";
  }, [alert, tr]);

  if (!alert) {
    return <ErrorState title={t("alerts.notFound")} onRetry={() => navigate("/dashboard/alerts")} />;
  }

  const animal = getLivestockById(alert.livestockId);
  const farm = getFarmById(alert.farmId);
  const barn = getBarnById(alert.barnId);

  const timelineItems = [
    { id: "1", label: t("alerts.timeline.detected"), timestamp: tRel(alert.detectedAt), icon: BellRing },
    { id: "2", label: t("alerts.timeline.aiAnalysis"), timestamp: tRel(alert.detectedAt), icon: BrainCircuit },
    { id: "3", label: t("alerts.timeline.staffNotified"), timestamp: t("alerts.timeline.momentsLater"), icon: UserPlus },
    ...(alert.assignedTo
      ? [
          {
            id: "4",
            label: t("alerts.timeline.staffAssigned", { name: alert.assignedTo }),
            timestamp: t("alerts.timeline.momentsLater"),
            icon: UserPlus,
          },
        ]
      : []),
    ...(alert.status === "resolved"
      ? [{ id: "5", label: t("status.resolved"), timestamp: t("alerts.timeline.recently"), icon: CheckCircle2 }]
      : []),
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: t("nav.item.alerts"), href: "/dashboard/alerts" }, { label: tr(alert.title) }]} />

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-terrava-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs text-terrava-muted">{alert.id}</span>
          </div>
          <h1 className="text-xl font-bold text-terrava-text">{tr(alert.title)}</h1>
          <p className="text-sm text-terrava-muted">
            {t("alerts.detectedAt", { time: tRel(alert.detectedAt) })} &middot; {t("livestock.column.status")}:{" "}
            {t("status." + alert.status)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => toast.success(t("alerts.toast.acknowledged"))} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("alerts.action.acknowledge")}
          </button>
          <button onClick={() => toast.success(t("alerts.toast.assigned"))} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("alerts.action.assign")}
          </button>
          <button onClick={() => toast.success(t("alerts.toast.resolved"))} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {t("alerts.action.resolve")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-2 text-sm font-semibold text-terrava-text">{t("alerts.overview")}</h3>
            <p className="text-sm text-terrava-muted">{tr(alert.description)}</p>
          </div>

          {animal && (
            <div className="flex items-center gap-4 rounded-2xl border border-terrava-border bg-white p-5">
              <img src={animal.photo} alt={animal.name} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-terrava-text">{animal.name}</p>
                <p className="text-xs text-terrava-muted">{animal.code} &middot; {farm?.name} &middot; {barn?.name}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("alerts.dataAtDetection")}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Thermometer className="mx-auto mb-1 h-4 w-4 text-terrava-error" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.temperature}°C</p>
                <p className="text-[11px] text-terrava-muted">{t("vitals.temperature")}</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <HeartPulse className="mx-auto mb-1 h-4 w-4 text-terrava-info" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.heartRate}</p>
                <p className="text-[11px] text-terrava-muted">{t("vitals.heartRate")}</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Activity className="mx-auto mb-1 h-4 w-4 text-terrava-primary" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.activity}</p>
                <p className="text-[11px] text-terrava-muted">{t("vitals.activity")}</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Droplets className="mx-auto mb-1 h-4 w-4 text-terrava-info" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.oxygen}%</p>
                <p className="text-[11px] text-terrava-muted">{t("vitals.oxygen")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-terrava-light p-5">
            <div className="mb-2 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">{t("alerts.aiAnalysis")}</span>
              <span className="ml-auto text-xs font-semibold text-terrava-primary">
                {t("alerts.confidencePercent", { value: alert.aiConfidence })}
              </span>
            </div>
            <p className="text-sm text-terrava-dark">{tr(alert.aiCause)}</p>
            <p className="mt-2 text-xs text-terrava-muted">
              {t("solutions.ai.disclaimer")}
            </p>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("alerts.recommendedActions")}</h3>
            <ul className="space-y-2">
              {alert.recommendations.map((rec) => (
                <li key={rec} className="flex items-center gap-2.5 rounded-xl bg-terrava-bg px-3.5 py-2.5 text-sm text-terrava-text">
                  <ClipboardList className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
                  {tt("action", rec)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("alerts.eventTimeline")}</h3>
            <Timeline items={timelineItems} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("alerts.statusPanel")}</h3>
            <DetailInfoRow label={t("livestock.column.status")} value={t("status." + alert.status)} />
            <DetailInfoRow label={t("alerts.assignee")} value={alert.assignedTo ?? t("alerts.unassigned")} />
            <DetailInfoRow label={t("filter.farm")} value={farm?.name} />
            <DetailInfoRow label={t("farms.barn")} value={barn?.name} />
            <DetailInfoRow label={t("devices.column.device")} value={animal?.deviceId ?? "-"} />
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("alerts.relatedRecords")}</h3>
            <p className="text-sm text-terrava-muted">{t("alerts.noRelatedRecords")}</p>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-terrava-text">{t("alerts.notes")}</h3>
              <button onClick={() => setNoteOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-terrava-primary">
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                {t("alerts.addNote")}
              </button>
            </div>
            <p className="text-sm text-terrava-muted">{t("alerts.noNotes")}</p>
          </div>
        </div>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={t("alerts.addNoteTitle")}
        footer={
          <>
            <button onClick={() => setNoteOpen(false)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text">
              {t("common.cancel")}
            </button>
            <button
              onClick={() => {
                toast.success(t("alerts.toast.noteAdded"));
                setNote("");
                setNoteOpen(false);
              }}
              className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              {t("alerts.saveNote")}
            </button>
          </>
        }
      >
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder={t("alerts.notePlaceholder")}
          className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none"
        />
      </Modal>
    </div>
  );
}
