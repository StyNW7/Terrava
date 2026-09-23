import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";

export default function ExportButton({ label, onExport }: { label?: string; onExport?: () => void }) {
  const { t } = useLanguage();

  const handleClick = () => {
    onExport?.();
    toast.success(t("dashboard.exportPrepared"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label ?? t("dashboard.exportCsv")}
    </button>
  );
}
