import { CheckCircle2, Send, TriangleAlert, RefreshCw, WifiOff } from "lucide-react";
import type { Device, DeviceLog } from "@/types/dashboard";
import { getLogsByDevice } from "@/data/mockDevices";
import EmptyState from "@/components/dashboard/EmptyState";

const logIcons: Record<DeviceLog["type"], typeof CheckCircle2> = {
  connected: CheckCircle2,
  "data-sent": Send,
  warning: TriangleAlert,
  "firmware-updated": RefreshCw,
  offline: WifiOff,
};

const logTone: Record<DeviceLog["type"], string> = {
  connected: "bg-terrava-primary/10 text-terrava-primary",
  "data-sent": "bg-terrava-info/10 text-terrava-info",
  warning: "bg-terrava-warning/10 text-terrava-warning",
  "firmware-updated": "bg-terrava-primary/10 text-terrava-primary",
  offline: "bg-terrava-error/10 text-terrava-error",
};

export default function DeviceLogsTab({ device }: { device: Device }) {
  const logs = getLogsByDevice(device.id);

  if (logs.length === 0) {
    return <EmptyState title="Belum ada log" description="Tidak ada aktivitas tercatat untuk perangkat ini." />;
  }

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <ul className="space-y-2.5">
        {logs.map((log) => {
          const Icon = logIcons[log.type];
          return (
            <li key={log.id} className="flex items-start gap-3 rounded-xl bg-terrava-bg px-3.5 py-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${logTone[log.type]}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-terrava-text">{log.message}</p>
                <p className="text-xs text-terrava-muted">{log.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
