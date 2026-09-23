import type { Farm } from "@/types/dashboard";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import AlertFrequencyChart from "@/components/charts/AlertFrequencyChart";
import AlertDistributionChart from "@/components/charts/AlertDistributionChart";
import DeviceUptimeChart from "@/components/charts/DeviceUptimeChart";
import { livestockHealthDistribution } from "@/data/dashboardChartData";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Cpu, HeartPulse, Radio } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const recentActivity = [
  { id: "1", icon: HeartPulse, key: "checkupDone", timestamp: "3 hours ago" },
  { id: "2", icon: Radio, key: "devicePaired", timestamp: "1 days ago" },
  { id: "3", icon: Cpu, key: "gatewaySync", timestamp: "2 days ago" },
];

export default function FarmOverviewTab({ farm }: { farm: Farm }) {
  const { t, tRel } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("farms.profile")}</h3>
        <p className="text-sm text-terrava-muted">
          {t("farms.profileSummary", {
            name: farm.name,
            location: farm.location,
            capacity: farm.capacity,
            manager: farm.manager,
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("chart.healthTrend")}>
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title={t("chart.alertTrend")}>
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard title={t("chart.livestockDistribution")}>
          <AlertDistributionChart data={livestockHealthDistribution} />
        </ChartCard>
        <ChartCard title={t("chart.deviceUptime")}>
          <DeviceUptimeChart />
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("overview.recentActivity")}</h3>
        <ActivityFeed
          items={recentActivity.map((item) => ({
            ...item,
            title: t("farms.activity." + item.key),
            timestamp: tRel(item.timestamp),
          }))}
        />
      </div>
    </div>
  );
}
