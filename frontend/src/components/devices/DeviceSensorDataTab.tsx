import { CheckCircle2 } from "lucide-react";
import type { Device } from "@/types/dashboard";

const sensors = [
  { label: "Temperature Sensor", status: "Normal" },
  { label: "Heart Rate Sensor", status: "Normal" },
  { label: "Accelerometer", status: "Normal" },
  { label: "GPS", status: "Active" },
];

export default function DeviceSensorDataTab({ device }: { device: Device }) {
  if (device.type !== "ear-tag") {
    return (
      <div className="rounded-2xl border border-terrava-border bg-white p-5 text-sm text-terrava-muted">
        Detail sensor fisiologis hanya tersedia untuk perangkat smart ear tag.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sensors.map((sensor) => (
        <div key={sensor.label} className="flex items-center justify-between rounded-2xl border border-terrava-border bg-white p-4">
          <span className="text-sm text-terrava-text">{sensor.label}</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-terrava-primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {sensor.status}
          </span>
        </div>
      ))}
    </div>
  );
}
