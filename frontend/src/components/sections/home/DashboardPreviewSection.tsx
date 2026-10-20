import { HeartPulse, ShieldCheck, CircleAlert, Activity } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreLineChart from "@/components/charts/HealthScoreLineChart";
import HealthStatusPieChart from "@/components/charts/HealthStatusPieChart";
import { useLanguage } from "@/hooks/useLanguage";

const summaryCards = [
  { icon: Activity, key: "totalLivestock", value: "248", tone: "text-terrava-text" },
  { icon: ShieldCheck, key: "healthyLivestock", value: "192", tone: "text-terrava-primary" },
  { icon: HeartPulse, key: "needsAttention", value: "37", tone: "text-terrava-warning" },
  { icon: CircleAlert, key: "criticalAlerts", value: "19", tone: "text-terrava-error" },
];

const recentAlerts = [
  { animal: "Sapi #A-014", issueKey: "temperatureRising", level: "attention" },
  { animal: "Sapi #A-102", issueKey: "activityDrop", level: "critical" },
  { animal: "Sapi #A-076", issueKey: "unstableHeartRate", level: "attention" },
];

const environmentReadings = [
  { key: "barnTemperature", value: "27°C" },
  { key: "humidity", value: "63%" },
  { key: "airQuality", valueKey: "good" },
];

export default function DashboardPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("home.preview.badge")}
          title={t("home.preview.title")}
          description={t("home.preview.description")}
        />

        <div className="mt-14 rounded-3xl border border-terrava-border bg-terrava-bg p-5 shadow-soft sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.key} className="card-hover group rounded-2xl border border-terrava-border bg-white p-4 sm:p-5">
                <card.icon className={`mb-3 h-5 w-5 ${card.tone}`} aria-hidden="true" />
                <p className={`text-xl font-bold sm:text-2xl ${card.tone}`}>{card.value}</p>
                <p className="mt-1 text-xs text-terrava-muted">{t("home.preview.summary." + card.key)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title={t("home.preview.healthTrendTitle")} description={t("home.preview.healthTrendDescription")}>
              <HealthScoreLineChart />
            </ChartCard>
            <ChartCard
              title={t("home.preview.healthDistributionTitle")}
              description={t("home.preview.healthDistributionDescription")}
            >
              <HealthStatusPieChart />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-terrava-border bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-terrava-text">{t("home.preview.recentAlerts")}</h3>
              <ul className="space-y-3">
                {recentAlerts.map((alert) => (
                  <li
                    key={alert.animal}
                    className="flex items-center justify-between rounded-xl bg-terrava-bg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-terrava-text">{alert.animal}</p>
                      <p className="text-xs text-terrava-muted">{t("home.preview.issue." + alert.issueKey)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        alert.level === "critical"
                          ? "bg-terrava-error/10 text-terrava-error"
                          : "bg-terrava-warning/10 text-terrava-warning"
                      }`}
                    >
                      {t("status." + alert.level)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-terrava-border bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-terrava-text">
                {t("home.preview.environmentalConditions")}
              </h3>
              <ul className="space-y-3">
                {environmentReadings.map((reading) => (
                  <li
                    key={reading.key}
                    className="flex items-center justify-between rounded-xl bg-terrava-bg px-4 py-3"
                  >
                    <span className="text-sm text-terrava-muted">{t("home.preview.reading." + reading.key)}</span>
                    <span className="text-sm font-semibold text-terrava-text">
                      {reading.value ?? t("home.preview.value." + reading.valueKey)}
                    </span>
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
