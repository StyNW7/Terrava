import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface ExportButtonProps {
  label?: string;
  /** Builds and downloads the file. Return the number of exported rows to show it in the toast. */
  onExport: () => void | number | Promise<void | number>;
}

export default function ExportButton({ label, onExport }: ExportButtonProps) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const count = await onExport();
      toast.success(typeof count === "number" ? t("dashboard.exportDoneCount", { count }) : t("dashboard.exportDone"));
    } catch (error) {
      console.error(error);
      toast.error(t("dashboard.exportFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text transition-colors hover:border-terrava-primary/40 hover:bg-terrava-bg disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
      {label ?? t("dashboard.exportCsv")}
    </button>
  );
}
