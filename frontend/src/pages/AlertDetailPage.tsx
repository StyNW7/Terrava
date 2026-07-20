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

export default function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const alert = id ? getAlertById(id) : undefined;
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    document.title = alert ? `${alert.title} | Terrava` : "Alert Detail | Terrava";
  }, [alert]);

  if (!alert) {
    return <ErrorState title="Alert tidak ditemukan" onRetry={() => navigate("/dashboard/alerts")} />;
  }

  const animal = getLivestockById(alert.livestockId);
  const farm = getFarmById(alert.farmId);
  const barn = getBarnById(alert.barnId);

  const timelineItems = [
    { id: "1", label: "Alert detected", timestamp: alert.detectedAt, icon: BellRing },
    { id: "2", label: "AI analysis completed", timestamp: alert.detectedAt, icon: BrainCircuit },
    { id: "3", label: "Staff notified", timestamp: "beberapa saat kemudian", icon: UserPlus },
    ...(alert.assignedTo ? [{ id: "4", label: `Staff assigned: ${alert.assignedTo}`, timestamp: "beberapa saat kemudian", icon: UserPlus }] : []),
    ...(alert.status === "resolved" ? [{ id: "5", label: "Resolved", timestamp: "baru-baru ini", icon: CheckCircle2 }] : []),
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Alerts", href: "/dashboard/alerts" }, { label: alert.title }]} />

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-terrava-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs text-terrava-muted">{alert.id}</span>
          </div>
          <h1 className="text-xl font-bold text-terrava-text">{alert.title}</h1>
          <p className="text-sm text-terrava-muted">Detected {alert.detectedAt} &middot; Status: {alert.status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => toast.success("Alert ditandai sebagai diketahui.")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Acknowledge
          </button>
          <button onClick={() => toast.success("Alert ditugaskan ke staff.")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Assign
          </button>
          <button onClick={() => toast.success("Alert berhasil diselesaikan.")} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            Resolve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-2 text-sm font-semibold text-terrava-text">Alert Overview</h3>
            <p className="text-sm text-terrava-muted">{alert.description}</p>
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
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">Data at Detection</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Thermometer className="mx-auto mb-1 h-4 w-4 text-terrava-error" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.temperature}°C</p>
                <p className="text-[11px] text-terrava-muted">Temperature</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <HeartPulse className="mx-auto mb-1 h-4 w-4 text-terrava-info" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.heartRate}</p>
                <p className="text-[11px] text-terrava-muted">Heart Rate</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Activity className="mx-auto mb-1 h-4 w-4 text-terrava-primary" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.activity}</p>
                <p className="text-[11px] text-terrava-muted">Activity</p>
              </div>
              <div className="rounded-xl bg-terrava-bg p-3 text-center">
                <Droplets className="mx-auto mb-1 h-4 w-4 text-terrava-info" aria-hidden="true" />
                <p className="text-sm font-bold text-terrava-text">{alert.dataAtDetection.oxygen}%</p>
                <p className="text-[11px] text-terrava-muted">Oxygen</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-terrava-light p-5">
            <div className="mb-2 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">AI Analysis</span>
              <span className="ml-auto text-xs font-semibold text-terrava-primary">{alert.aiConfidence}% confidence</span>
            </div>
            <p className="text-sm text-terrava-dark">{alert.aiCause}</p>
            <p className="mt-2 text-xs text-terrava-muted">
              AI Terrava membantu proses pengambilan keputusan dan tidak menggantikan diagnosis profesional dokter hewan.
            </p>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">Recommended Actions</h3>
            <ul className="space-y-2">
              {alert.recommendations.map((rec) => (
                <li key={rec} className="flex items-center gap-2.5 rounded-xl bg-terrava-bg px-3.5 py-2.5 text-sm text-terrava-text">
                  <ClipboardList className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">Event Timeline</h3>
            <Timeline items={timelineItems} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">Alert Status</h3>
            <DetailInfoRow label="Status" value={<span className="capitalize">{alert.status}</span>} />
            <DetailInfoRow label="Assignee" value={alert.assignedTo ?? "Unassigned"} />
            <DetailInfoRow label="Farm" value={farm?.name} />
            <DetailInfoRow label="Barn" value={barn?.name} />
            <DetailInfoRow label="Device" value={animal?.deviceId ?? "-"} />
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-terrava-text">Related Records</h3>
            <p className="text-sm text-terrava-muted">Tidak ada catatan tambahan terkait alert ini.</p>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-terrava-text">Notes</h3>
              <button onClick={() => setNoteOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-terrava-primary">
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                Add note
              </button>
            </div>
            <p className="text-sm text-terrava-muted">Belum ada catatan untuk alert ini.</p>
          </div>
        </div>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add Note"
        footer={
          <>
            <button onClick={() => setNoteOpen(false)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text">
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success("Catatan berhasil ditambahkan.");
                setNote("");
                setNoteOpen(false);
              }}
              className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              Save Note
            </button>
          </>
        }
      >
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Tulis catatan tindak lanjut..."
          className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none"
        />
      </Modal>
    </div>
  );
}
