import { Link } from "react-router-dom";
import { Thermometer, HeartPulse, Activity, MapPin, BatteryFull, Radio } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const statusDot: Record<Livestock["healthStatus"], string> = {
  healthy: "bg-terrava-primary",
  attention: "bg-terrava-warning",
  critical: "bg-terrava-error",
  inactive: "bg-terrava-neutral",
};

export default function LiveLivestockCard({ animal, compact = false }: { animal: Livestock; compact?: boolean }) {
  const { t, tRel } = useLanguage();

  return (
    <Link
      to={`/dashboard/livestock/${animal.id}`}
      className={`block rounded-2xl border border-terrava-border bg-white shadow-card transition-transform hover:-translate-y-0.5 ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${statusDot[animal.healthStatus]} ${animal.healthStatus === "critical" ? "animate-pulse" : ""}`} aria-hidden="true" />
          <p className="text-sm font-semibold text-terrava-text">{animal.name}</p>
        </div>
        <span className="text-xs text-terrava-muted">{animal.code}</span>
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-terrava-bg p-2">
            <Thermometer className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-error" aria-hidden="true" />
            <p className="text-xs font-semibold text-terrava-text">{animal.temperature}°C</p>
          </div>
          <div className="rounded-lg bg-terrava-bg p-2">
            <HeartPulse className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-info" aria-hidden="true" />
            <p className="text-xs font-semibold text-terrava-text">{animal.heartRate}</p>
          </div>
          <div className="rounded-lg bg-terrava-bg p-2">
            <Activity className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
            <p className="text-xs font-semibold text-terrava-text">{animal.activityLevel}</p>
          </div>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-terrava-muted">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {animal.herdGroup}
        </span>
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3" aria-hidden="true" /> {t("status." + animal.deviceStatus)}
        </span>
        <span className="flex items-center gap-1">
          <BatteryFull className="h-3 w-3" aria-hidden="true" /> {animal.deviceId ? `${animal.batteryLevel}%` : "-"}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-terrava-muted">{t("monitoring.updated", { time: tRel(animal.lastUpdate) })}</p>
    </Link>
  );
}
