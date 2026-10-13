import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import type { ReportSchedule } from "@/context/data-store-context";
import { cn } from "@/lib/utils";
import { nextRun } from "@/lib/schedule";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

interface ScheduleReportModalProps {
  reportType: string | null;
  title: string;
  onClose: () => void;
}

export default function ScheduleReportModal({ reportType, title, onClose }: ScheduleReportModalProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { reportSchedules, setReportSchedule, removeReportSchedule } = useDataStore();
  const existing = reportSchedules.find((schedule) => schedule.reportType === reportType);

  const [frequency, setFrequency] = useState<ReportSchedule["frequency"]>("weekly");
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("07:00");
  const [format, setFormat] = useState<ReportSchedule["format"]>("pdf");
  const [recipients, setRecipients] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load the saved schedule (or sensible defaults) whenever the modal opens for a report.
  useEffect(() => {
    if (!reportType) return;
    setFrequency(existing?.frequency ?? "weekly");
    setDay(existing?.day ?? 1);
    setTime(existing?.time ?? "07:00");
    setFormat(existing?.format ?? "pdf");
    setRecipients(existing?.recipients.join(", ") ?? user?.email ?? "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  if (!reportType) return null;

  const save = () => {
    const list = recipients
      .split(/[,;\s]+/)
      .map((email) => email.trim())
      .filter(Boolean);
    if (list.length === 0 || list.some((email) => !EMAIL_PATTERN.test(email))) {
      setError(t("reports.recipientsInvalid"));
      return;
    }
    setReportSchedule({ reportType, frequency, day, time, format, recipients: list, createdAt: new Date().toISOString() });
    toast.success(t("reports.toast.scheduled", { title }));
    onClose();
  };

  const preview = nextRun({ frequency, day, time }).toLocaleString(lang === "id" ? "id-ID" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={t("reports.scheduleTitle", { title })}
      footer={
        <>
          {existing && (
            <button
              type="button"
              onClick={() => {
                removeReportSchedule(reportType);
                toast.success(t("reports.toast.scheduleRemoved", { title }));
                onClose();
              }}
              className="mr-auto rounded-xl px-3 py-2.5 text-sm font-semibold text-terrava-error hover:bg-terrava-error/10"
            >
              {t("reports.removeSchedule")}
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={save} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {t("reports.saveSchedule")}
          </button>
        </>
      }
    >
      <p className="mb-5 text-sm text-terrava-muted">{t("reports.scheduleIntro")}</p>

      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-terrava-text">{t("reports.frequency")}</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("reports.frequency")}>
            {(["daily", "weekly", "monthly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={frequency === value}
                onClick={() => {
                  setFrequency(value);
                  setDay(1);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  frequency === value ? "border-terrava-primary bg-terrava-light text-terrava-primary" : "border-terrava-border text-terrava-text hover:bg-terrava-bg"
                )}
              >
                {t("reports.frequency." + value)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {frequency !== "daily" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-terrava-text">{frequency === "weekly" ? t("reports.day") : t("reports.dateOfMonth")}</span>
              <select value={day} onChange={(event) => setDay(Number(event.target.value))} className={fieldClass}>
                {frequency === "weekly"
                  ? [1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <option key={value} value={value}>
                        {t("weekday." + value)}
                      </option>
                    ))
                  : Array.from({ length: 28 }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
              </select>
            </label>
          )}
          <label className={cn("block", frequency === "daily" && "col-span-1")}>
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("reports.time")}</span>
            <input type="time" value={time} onChange={(event) => setTime(event.target.value || "07:00")} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("reports.format")}</span>
            <select value={format} onChange={(event) => setFormat(event.target.value as ReportSchedule["format"])} className={fieldClass}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("reports.recipients")}</span>
          <input
            type="text"
            value={recipients}
            onChange={(event) => {
              setRecipients(event.target.value);
              setError(null);
            }}
            placeholder="nama@peternakan.id"
            aria-invalid={Boolean(error)}
            className={cn(fieldClass, error && "border-terrava-error")}
          />
          {error && <span className="mt-1 block text-xs text-terrava-error">{error}</span>}
        </label>

        <p className="rounded-xl bg-terrava-bg px-3.5 py-2.5 text-xs text-terrava-muted">{t("reports.nextRun", { date: preview })}</p>
      </div>
    </Modal>
  );
}
