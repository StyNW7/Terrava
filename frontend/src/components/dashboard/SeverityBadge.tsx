import { Circle } from "lucide-react";
import type { AlertSeverity } from "@/types/dashboard";

const severityConfig: Record<AlertSeverity, { label: string; className: string }> = {
  info: { label: "Info", className: "bg-terrava-info/10 text-terrava-info" },
  warning: { label: "Warning", className: "bg-terrava-warning/10 text-terrava-warning" },
  high: { label: "High", className: "bg-[#B4552F]/10 text-[#B4552F]" },
  critical: { label: "Critical", className: "bg-terrava-error/10 text-terrava-error" },
};

export default function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config = severityConfig[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <Circle className="h-2 w-2 fill-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
