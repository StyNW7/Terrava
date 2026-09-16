import { useEffect, useState } from "react";
import { RotateCw, PawPrint, HeartPulse, TriangleAlert, BellRing, Radio, Gauge } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import ExportButton from "@/components/dashboard/ExportButton";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import AlertDistributionChart from "@/components/charts/AlertDistributionChart";
import AlertFrequencyChart from "@/components/charts/AlertFrequencyChart";
import ActivityTrendChart from "@/components/charts/ActivityTrendChart";
import DeviceUptimeChart from "@/components/charts/DeviceUptimeChart";
import OverviewAlertsPanel from "@/components/dashboard/overview/OverviewAlertsPanel";
import OverviewAttentionPanel from "@/components/dashboard/overview/OverviewAttentionPanel";
import OverviewAIPanel from "@/components/dashboard/overview/OverviewAIPanel";
import OverviewDeviceIssuesPanel from "@/components/dashboard/overview/OverviewDeviceIssuesPanel";
import OverviewTasksPanel from "@/components/dashboard/overview/OverviewTasksPanel";
import OverviewActivityPanel from "@/components/dashboard/overview/OverviewActivityPanel";
import OverviewWeatherPanel from "@/components/dashboard/overview/OverviewWeatherPanel";
import WelcomeBanner from "@/components/dashboard/overview/WelcomeBanner";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { livestockHealthDistribution } from "@/data/dashboardChartData";
import { livestock } from "@/data/mockLivestock";
import { alerts } from "@/data/mockAlerts";
import { devices } from "@/data/mockDevices";

export default function DashboardOverviewPage() {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = "Dashboard Overview | Terrava";
  }, []);

  const healthyCount = livestock.filter((a) => a.healthStatus === "healthy").length;
  const attentionCount = livestock.filter((a) => a.healthStatus === "attention").length;
  const criticalAlertCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  const activeDevices = devices.filter((d) => d.status === "online").length;
  const avgHealthScore = Math.round(livestock.reduce((sum, a) => sum + a.healthScore, 0) / livestock.length);
  const healthyPercent = Math.round((healthyCount / livestock.length) * 100);
  const activeAlertCount = alerts.filter((a) => a.status === "active").length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Data dashboard berhasil diperbarui.");
    }, 900);
  };

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Pantau kondisi kesehatan ternak, perangkat, dan aktivitas peternakan Anda."
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
            <ExportButton label="Export Overview" />
          </>
        }
      />

      <WelcomeBanner
        healthyPercent={healthyPercent}
        activeAlerts={activeAlertCount}
        devicesOnline={activeDevices}
        devicesTotal={devices.length}
      />

      <StaggerGroup className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" stagger={0.06}>
        <StaggerItem><MetricCard icon={PawPrint} label="Total Livestock" value={livestock.length} trend={4.2} trendLabel="vs last month" /></StaggerItem>
        <StaggerItem><MetricCard icon={HeartPulse} label="Healthy Livestock" value={healthyCount} trend={2.1} trendLabel="vs last month" /></StaggerItem>
        <StaggerItem><MetricCard icon={TriangleAlert} label="Needs Attention" value={attentionCount} trend={-1.4} trendLabel="vs last month" tone="warning" /></StaggerItem>
        <StaggerItem><MetricCard icon={BellRing} label="Critical Alerts" value={criticalAlertCount} trend={-3.5} trendLabel="vs yesterday" tone="error" /></StaggerItem>
        <StaggerItem><MetricCard icon={Radio} label="Active Devices" value={activeDevices} trend={1.8} trendLabel="vs last week" /></StaggerItem>
        <StaggerItem><MetricCard icon={Gauge} label="Avg Health Score" value={avgHealthScore} trend={0.9} trendLabel="vs last week" /></StaggerItem>
      </StaggerGroup>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Health Score Trend" description="Rata-rata skor kesehatan seluruh ternak (30 hari terakhir)">
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title="Livestock Health Distribution" description="Distribusi status kesehatan seluruh ternak">
          <AlertDistributionChart data={livestockHealthDistribution} />
        </ChartCard>
        <ChartCard title="Alert Frequency" description="Jumlah alert per hari berdasarkan tingkat keparahan">
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard title="Activity and Temperature" description="Korelasi aktivitas dan suhu tubuh rata-rata ternak">
          <ActivityTrendChart />
        </ChartCard>
        <ChartCard title="Device Connectivity" description="Perbandingan perangkat online dan offline" actions={undefined}>
          <DeviceUptimeChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OverviewAlertsPanel />
        <OverviewAttentionPanel />
        <OverviewAIPanel />
        <OverviewDeviceIssuesPanel />
        <OverviewTasksPanel />
        <OverviewActivityPanel />
        <div className="lg:col-span-2">
          <OverviewWeatherPanel />
        </div>
      </div>
    </div>
  );
}
