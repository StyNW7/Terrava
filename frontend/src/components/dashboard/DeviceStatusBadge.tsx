import { Circle } from "lucide-react";
import type { DeviceStatus } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const config: Record<DeviceStatus, { className: string }> = {
  online: { className: "bg-terrava-primary/10 text-terrava-primary" },
  offline: { className: "bg-terrava-neutral/10 text-terrava-neutral" },
  "low-battery": { className: "bg-terrava-warning/10 text-terrava-warning" },
  maintenance: { className: "bg-terrava-info/10 text-terrava-info" },
};

export default function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const { t } = useLanguage();
  const item = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}>
      <Circle className="h-2 w-2 fill-current" aria-hidden="true" />
      {t("status." + status)}
    </span>
  );
}
