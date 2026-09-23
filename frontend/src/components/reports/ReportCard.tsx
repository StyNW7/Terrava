import { FileText, Download, CalendarClock } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface ReportCardProps {
  title: string;
  description: string;
  lastGenerated: string;
  onPreview: () => void;
}

export default function ReportCard({ title, description, lastGenerated, onPreview }: ReportCardProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-terrava-text">{title}</h3>
      <p className="mb-3 text-xs leading-relaxed text-terrava-muted">{description}</p>
      <p className="mb-4 text-xs text-terrava-muted">{t("reports.lastGenerated", { time: lastGenerated })}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={onPreview} className="rounded-lg bg-terrava-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-terrava-hover">
          {t("reports.generate")}
        </button>
        <button onClick={() => toast.success(t("reports.toast.downloaded", { title }))} className="flex items-center gap-1.5 rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg">
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t("reports.download")}
        </button>
        <button onClick={() => toast.success(t("reports.toast.scheduled", { title }))} className="flex items-center gap-1.5 rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> {t("reports.schedule")}
        </button>
      </div>
    </div>
  );
}
