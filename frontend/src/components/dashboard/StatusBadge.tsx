import { Circle } from "lucide-react";
import type { HealthStatus } from "@/types/dashboard";

const statusConfig: Record<HealthStatus, { label: string; className: string; dot: string }> = {
  healthy: { label: "Healthy", className: "bg-terrava-primary/10 text-terrava-primary", dot: "text-terrava-primary" },
  attention: { label: "Needs Attention", className: "bg-terrava-warning/10 text-terrava-warning", dot: "text-terrava-warning" },
  critical: { label: "Critical", className: "bg-terrava-error/10 text-terrava-error", dot: "text-terrava-error" },
  inactive: { label: "Inactive", className: "bg-terrava-neutral/10 text-terrava-neutral", dot: "text-terrava-neutral" },
};

export default function StatusBadge({ status }: { status: HealthStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Circle className={`h-2 w-2 fill-current ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
