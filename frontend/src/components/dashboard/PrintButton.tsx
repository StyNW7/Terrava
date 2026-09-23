import { Printer } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function PrintButton({ label }: { label?: string }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      {label ?? t("common.print")}
    </button>
  );
}
