import { HeartPulse, ShieldCheck, CircleAlert, Activity } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreLineChart from "@/components/charts/HealthScoreLineChart";
import HealthStatusPieChart from "@/components/charts/HealthStatusPieChart";

const summaryCards = [
  { icon: Activity, label: "Total Livestock", value: "248", tone: "text-terrava-text" },
  { icon: ShieldCheck, label: "Healthy Livestock", value: "192", tone: "text-terrava-primary" },
  { icon: HeartPulse, label: "Needs Attention", value: "37", tone: "text-terrava-warning" },
  { icon: CircleAlert, label: "Critical Alerts", value: "19", tone: "text-terrava-error" },
];

const recentAlerts = [
  { animal: "Sapi #A-014", issue: "Suhu tubuh meningkat", level: "Perlu Perhatian" },
  { animal: "Sapi #A-102", issue: "Aktivitas menurun drastis", level: "Kritis" },
  { animal: "Sapi #A-076", issue: "Detak jantung tidak stabil", level: "Perlu Perhatian" },
];

const environmentReadings = [
  { label: "Suhu Kandang", value: "27°C" },
  { label: "Kelembapan", value: "63%" },
  { label: "Kualitas Udara", value: "Baik" },
];

export default function DashboardPreviewSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Dashboard Preview"
          title="Satu dashboard untuk seluruh kondisi peternakan Anda"
          description="Pantau status kesehatan, tren, dan peringatan ternak secara real-time dalam satu tampilan yang jelas."
        />

        <div className="mt-14 rounded-3xl border border-terrava-border bg-terrava-bg p-5 shadow-soft sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-terrava-border bg-white p-4 sm:p-5">
                <card.icon className={`mb-3 h-5 w-5 ${card.tone}`} aria-hidden="true" />
                <p className={`text-xl font-bold sm:text-2xl ${card.tone}`}>{card.value}</p>
                <p className="mt-1 text-xs text-terrava-muted">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Health Score Trend" description="Rata-rata skor kesehatan ternak per bulan">
              <HealthScoreLineChart />
            </ChartCard>
            <ChartCard title="Health Status Distribution" description="Distribusi status kesehatan seluruh ternak">
              <HealthStatusPieChart />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-terrava-border bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-terrava-text">Recent Alerts</h3>
              <ul className="space-y-3">
                {recentAlerts.map((alert) => (
                  <li
                    key={alert.animal}
                    className="flex items-center justify-between rounded-xl bg-terrava-bg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-terrava-text">{alert.animal}</p>
                      <p className="text-xs text-terrava-muted">{alert.issue}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        alert.level === "Kritis"
                          ? "bg-terrava-error/10 text-terrava-error"
                          : "bg-terrava-warning/10 text-terrava-warning"
                      }`}
                    >
                      {alert.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-terrava-border bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-terrava-text">Environmental Conditions</h3>
              <ul className="space-y-3">
                {environmentReadings.map((reading) => (
                  <li
                    key={reading.label}
                    className="flex items-center justify-between rounded-xl bg-terrava-bg px-4 py-3"
                  >
                    <span className="text-sm text-terrava-muted">{reading.label}</span>
                    <span className="text-sm font-semibold text-terrava-text">{reading.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
