import { CheckCircle2 } from "lucide-react";
import type { Device } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const sensors = [
  { key: "devices.sensor.temperature", statusKey: "home.hero.normal" },
  { key: "devices.sensor.heartRate", statusKey: "home.hero.normal" },
  { key: "devices.sensor.accelerometer", statusKey: "home.hero.normal" },
  { key: "devices.sensor.gps", statusKey: "status.active" },
];

export default function DeviceSensorDataTab({ device }: { device: Device }) {
  const { t } = useLanguage();

  if (device.type !== "ear-tag") {
    return (
      <div className="rounded-2xl border border-terrava-border bg-white p-5 text-sm text-terrava-muted">
        {t("devices.sensorOnlyEarTag")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sensors.map((sensor) => (
        <div key={sensor.key} className="flex items-center justify-between rounded-2xl border border-terrava-border bg-white p-4">
          <span className="text-sm text-terrava-text">{t(sensor.key)}</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-terrava-primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t(sensor.statusKey)}
          </span>
        </div>
      ))}
    </div>
  );
}
