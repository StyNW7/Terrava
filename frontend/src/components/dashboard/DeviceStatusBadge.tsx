import { Circle } from "lucide-react";
import type { DeviceStatus } from "@/types/dashboard";

const config: Record<DeviceStatus, { label: string; className: string }> = {
  online: { label: "Online", className: "bg-terrava-primary/10 text-terrava-primary" },
  offline: { label: "Offline", className: "bg-terrava-neutral/10 text-terrava-neutral" },
  "low-battery": { label: "Low Battery", className: "bg-terrava-warning/10 text-terrava-warning" },
  maintenance: { label: "Maintenance", className: "bg-terrava-info/10 text-terrava-info" },
};

export default function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const item = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}>
      <Circle className="h-2 w-2 fill-current" aria-hidden="true" />
      {item.label}
    </span>
  );
}
