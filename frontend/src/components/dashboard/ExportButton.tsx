import { Download } from "lucide-react";
import toast from "react-hot-toast";

export default function ExportButton({ label = "Export CSV", onExport }: { label?: string; onExport?: () => void }) {
  const handleClick = () => {
    onExport?.();
    toast.success("Export prototype berhasil disiapkan.");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
