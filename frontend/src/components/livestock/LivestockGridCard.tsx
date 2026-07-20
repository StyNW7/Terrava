import { Link } from "react-router-dom";
import { BatteryFull, Radio } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import HealthScoreBadge from "@/components/dashboard/HealthScoreBadge";
import { getBarnById } from "@/data/mockFarms";

export default function LivestockGridCard({ animal }: { animal: Livestock }) {
  const barn = getBarnById(animal.barnId);

  return (
    <Link
      to={`/dashboard/livestock/${animal.id}`}
      className="block overflow-hidden rounded-2xl border border-terrava-border bg-white shadow-card transition-transform duration-200 hover:-translate-y-1"
    >
      <img src={animal.photo} alt={animal.name} className="h-36 w-full object-cover" />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-terrava-text">{animal.name}</p>
            <p className="text-xs text-terrava-muted">{animal.code}</p>
          </div>
          <HealthScoreBadge score={animal.healthScore} />
        </div>
        <StatusBadge status={animal.healthStatus} />
        <p className="mt-2 text-xs text-terrava-muted">{barn?.name}</p>
        <div className="mt-3 flex items-center justify-between border-t border-terrava-border pt-2.5 text-xs text-terrava-muted">
          <span className="flex items-center gap-1">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            {animal.deviceStatus === "unassigned" ? "No device" : animal.deviceStatus}
          </span>
          <span className="flex items-center gap-1">
            <BatteryFull className="h-3.5 w-3.5" aria-hidden="true" />
            {animal.deviceId ? `${animal.batteryLevel}%` : "-"}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-terrava-muted">Updated {animal.lastUpdate}</p>
      </div>
    </Link>
  );
}
