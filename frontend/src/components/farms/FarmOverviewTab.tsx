import type { Farm } from "@/types/dashboard";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import AlertFrequencyChart from "@/components/charts/AlertFrequencyChart";
import AlertDistributionChart from "@/components/charts/AlertDistributionChart";
import DeviceUptimeChart from "@/components/charts/DeviceUptimeChart";
import { livestockHealthDistribution } from "@/data/dashboardChartData";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Cpu, HeartPulse, Radio } from "lucide-react";

const recentActivity = [
  { id: "1", icon: HeartPulse, title: "Pemeriksaan kesehatan rutin selesai", timestamp: "3 jam lalu" },
  { id: "2", icon: Radio, title: "Perangkat baru berhasil dipasangkan", timestamp: "1 hari lalu" },
  { id: "3", icon: Cpu, title: "Gateway melakukan sinkronisasi penuh", timestamp: "2 hari lalu" },
];

export default function FarmOverviewTab({ farm }: { farm: Farm }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Farm Profile</h3>
        <p className="text-sm text-terrava-muted">
          {farm.name} berlokasi di {farm.location} dengan kapasitas total {farm.capacity} ekor ternak, dikelola oleh {farm.manager}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Health Trend">
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title="Alert Trend">
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard title="Livestock Distribution">
          <AlertDistributionChart data={livestockHealthDistribution} />
        </ChartCard>
        <ChartCard title="Device Uptime">
          <DeviceUptimeChart />
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Recent Activity</h3>
        <ActivityFeed items={recentActivity} />
      </div>
    </div>
  );
}
