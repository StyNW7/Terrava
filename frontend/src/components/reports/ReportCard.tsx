import type { LucideIcon } from "lucide-react";
import { CalendarClock, Eye, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ReportCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  lastGenerated: string;
  scheduleLabel?: string;
  downloading?: boolean;
  onPreview: () => void;
  onDownloadPdf: () => void;
  onDownloadCsv: () => void;
  onSchedule: () => void;
}

export default function ReportCard({
  icon: Icon,
  title,
  description,
  lastGenerated,
  scheduleLabel,
  downloading = false,
  onPreview,
  onDownloadPdf,
  onDownloadCsv,
  onSchedule,
}: ReportCardProps) {
  const { t } = useLanguage();
  const secondary =
    "inline-flex items-center gap-1.5 rounded-lg border border-terrava-border px-2.5 py-1.5 text-xs font-semibold text-terrava-text transition-colors hover:border-terrava-primary/40 hover:bg-terrava-bg disabled:opacity-60";

  return (
    <div className="card-hover flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {scheduleLabel && (
          <span className="inline-flex items-center gap-1 rounded-full bg-terrava-info/10 px-2 py-0.5 text-[11px] font-semibold text-terrava-info" title={scheduleLabel}>
            <CalendarClock className="h-3 w-3" aria-hidden="true" />
            {t("reports.scheduledBadge")}
          </span>
        )}
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-terrava-text">{title}</h3>
      <p className="mb-3 text-xs leading-relaxed text-terrava-muted">{description}</p>
      <div className="mb-4 mt-auto space-y-0.5 text-[11px] text-terrava-muted">
        <p>{t("reports.lastGenerated", { time: lastGenerated })}</p>
        {scheduleLabel && <p className="font-medium text-terrava-info">{scheduleLabel}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 rounded-lg bg-terrava-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-terrava-hover"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> {t("reports.generate")}
        </button>
        <button type="button" onClick={onDownloadPdf} disabled={downloading} className={secondary}>
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <FileDown className="h-3.5 w-3.5" aria-hidden="true" />} PDF
        </button>
        <button type="button" onClick={onDownloadCsv} className={secondary}>
          <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" /> CSV
        </button>
        <button type="button" onClick={onSchedule} className={secondary} aria-label={t("reports.schedule")} title={t("reports.schedule")}>
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> {t("reports.schedule")}
        </button>
      </div>
    </div>
  );
}
