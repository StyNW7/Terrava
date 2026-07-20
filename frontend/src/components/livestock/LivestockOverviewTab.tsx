import { Link } from "react-router-dom";
import { BrainCircuit, Syringe } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { alerts } from "@/data/mockAlerts";
import { getFarmById, getBarnById } from "@/data/mockFarms";

export default function LivestockOverviewTab({ animal }: { animal: Livestock }) {
  const relatedAlerts = alerts.filter((alert) => alert.livestockId === animal.id).slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-terrava-border bg-terrava-light p-5">
          <div className="mb-2 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">AI Health Summary</span>
          </div>
          <p className="text-sm text-terrava-dark">
            {animal.name} menunjukkan kondisi {animal.healthStatus === "healthy" ? "stabil dengan tren positif" : "yang memerlukan pemantauan lebih lanjut"} berdasarkan data 7 hari
            terakhir. Suhu tubuh dan detak jantung berada {animal.healthStatus === "critical" ? "di luar" : "dalam"} rentang normal.
          </p>
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">Latest Observations</h3>
          <ul className="space-y-2 text-sm text-terrava-text">
            <li>Suhu tubuh tercatat {animal.temperature}°C pada pembaruan terakhir.</li>
            <li>Tingkat aktivitas berada di angka {animal.activityLevel} dari skala 100.</li>
            <li>Kadar oksigen darah tercatat {animal.oxygenLevel}%.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-terrava-text">Recent Alerts</h3>
            <Link to="#" className="text-xs font-semibold text-terrava-primary">
              View all
            </Link>
          </div>
          {relatedAlerts.length === 0 ? (
            <p className="text-sm text-terrava-muted">Tidak ada alert terbaru untuk ternak ini.</p>
          ) : (
            <ul className="space-y-2">
              {relatedAlerts.map((alert) => (
                <li key={alert.id}>
                  <Link to={`/dashboard/alerts/${alert.id}`} className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-terrava-bg">
                    <span className="text-sm text-terrava-text">{alert.title}</span>
                    <SeverityBadge severity={alert.severity} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">Basic Profile</h3>
          <DetailInfoRow label="Breed" value={animal.breed} />
          <DetailInfoRow label="Gender" value={animal.gender} />
          <DetailInfoRow label="Age" value={`${animal.ageMonths} bulan`} />
          <DetailInfoRow label="Weight" value={`${animal.weightKg} kg`} />
          <DetailInfoRow label="Body Condition" value={`${animal.bodyConditionScore}/5`} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">Farm Assignment</h3>
          <DetailInfoRow label="Farm" value={getFarmById(animal.farmId)?.name} />
          <DetailInfoRow label="Barn" value={getBarnById(animal.barnId)?.name} />
          <DetailInfoRow label="Herd Group" value={animal.herdGroup} />
          <DetailInfoRow label="Arrival Date" value={animal.arrivalDate} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <Syringe className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-terrava-text">Upcoming Care Schedule</h3>
          </div>
          <p className="text-sm text-terrava-muted">Pemeriksaan rutin berikutnya dijadwalkan dalam 5 hari.</p>
        </div>
      </div>
    </div>
  );
}
