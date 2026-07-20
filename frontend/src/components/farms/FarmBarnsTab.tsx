import type { Farm } from "@/types/dashboard";
import { getBarnsByFarm } from "@/data/mockFarms";

export default function FarmBarnsTab({ farm }: { farm: Farm }) {
  const farmBarns = getBarnsByFarm(farm.id);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {farmBarns.map((barn) => (
        <div key={barn.id} className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{barn.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.occupancy}/{barn.capacity}</p>
              <p className="text-terrava-muted">Occupancy</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.healthScore}</p>
              <p className="text-terrava-muted">Health Score</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.temperature}°C</p>
              <p className="text-terrava-muted">Temperature</p>
            </div>
            <div className="rounded-lg bg-terrava-bg p-2.5">
              <p className="font-semibold text-terrava-text">{barn.humidity}%</p>
              <p className="text-terrava-muted">Humidity</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-terrava-muted">{barn.alertCount} active alerts &middot; Manager: {barn.manager}</p>
        </div>
      ))}
    </div>
  );
}
