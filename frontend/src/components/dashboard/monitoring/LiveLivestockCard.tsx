import { Link } from "react-router-dom";
import { Thermometer, HeartPulse, Activity, MapPin, BatteryFull, Radio } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import type { Breach, LiveReading } from "@/utils/liveReadings";
import { useLanguage } from "@/hooks/useLanguage";
import { useUnits } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const statusDot: Record<Livestock["healthStatus"], string> = {
  healthy: "bg-terrava-primary",
  attention: "bg-terrava-warning",
  critical: "bg-terrava-error",
  inactive: "bg-terrava-neutral",
};

interface LiveLivestockCardProps {
  animal: Livestock;
  reading: LiveReading;
  breaches?: Breach[];
  live?: boolean;
  compact?: boolean;
}

export default function LiveLivestockCard({ animal, reading, breaches = [], live = false, compact = false }: LiveLivestockCardProps) {
  const { t, tRel } = useLanguage();
  const { formatTemp } = useUnits();
  const hot = breaches.includes("tempHigh") || breaches.includes("tempLow");
  const metric = (breached: boolean) => cn("rounded-lg p-2 transition-colors", breached ? "bg-terrava-error/10 ring-1 ring-terrava-error/40" : "bg-terrava-bg");

  return (
    <Link
      to={`/dashboard/livestock/${animal.id}`}
      className={cn(
        "block rounded-2xl border bg-white shadow-card transition-transform hover:-translate-y-0.5",
        breaches.length ? "border-terrava-error/50" : "border-terrava-border",
        compact ? "p-3" : "p-4"
      )}
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
          <div className={metric(hot)} title={t("vitals.temperature")}>
            <Thermometer className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-error" aria-hidden="true" />
            <p className="text-xs font-semibold tabular-nums text-terrava-text">{formatTemp(reading.temperature)}</p>
          </div>
          <div className={metric(breaches.includes("heartRate"))} title={t("vitals.heartRate")}>
            <HeartPulse className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-info" aria-hidden="true" />
            <p className="text-xs font-semibold tabular-nums text-terrava-text">{reading.heartRate}</p>
          </div>
          <div className={metric(breaches.includes("activity"))} title={t("vitals.activity")}>
            <Activity className="mx-auto mb-1 h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
            <p className="text-xs font-semibold tabular-nums text-terrava-text">{reading.activity}</p>
          </div>
        </div>
      )}

      {breaches.length > 0 && (
        <p className="mt-2 text-[11px] font-semibold text-terrava-error">{breaches.map((breach) => t("monitoring.breach." + breach)).join(" · ")}</p>
      )}

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-terrava-muted">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {animal.herdGroup}
        </span>
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3" aria-hidden="true" /> {t("status." + animal.deviceStatus)}
        </span>
        <span className={cn("flex items-center gap-1", breaches.includes("battery") && "font-semibold text-terrava-error")}>
          <BatteryFull className="h-3 w-3" aria-hidden="true" /> {animal.deviceId ? `${reading.battery}%` : "-"}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-terrava-muted">
        {t("monitoring.updated", { time: live && animal.deviceId ? tRel("Just now") : tRel(animal.lastUpdate) })}
      </p>
    </Link>
  );
}
