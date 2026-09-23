import { Circle } from "lucide-react";
import type { HealthStatus } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const statusConfig: Record<HealthStatus, { className: string; dot: string }> = {
  healthy: { className: "bg-terrava-primary/10 text-terrava-primary", dot: "text-terrava-primary" },
  attention: { className: "bg-terrava-warning/10 text-terrava-warning", dot: "text-terrava-warning" },
  critical: { className: "bg-terrava-error/10 text-terrava-error", dot: "text-terrava-error" },
  inactive: { className: "bg-terrava-neutral/10 text-terrava-neutral", dot: "text-terrava-neutral" },
};

export default function StatusBadge({ status }: { status: HealthStatus }) {
  const { t } = useLanguage();
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Circle className={`h-2 w-2 fill-current ${config.dot}`} aria-hidden="true" />
      {t("status." + status)}
    </span>
  );
}
