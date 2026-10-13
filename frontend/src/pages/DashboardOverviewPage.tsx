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
import { seriesForRange, type DateRange } from "@/data/rangeSeries";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useScopedData } from "@/hooks/useScopedData";
import { useDashboardFilters } from "@/context/DashboardContext";
import { buildOverviewReport } from "@/lib/reports";
import { downloadReportPdf } from "@/lib/reportPdf";

export default function DashboardOverviewPage() {
  const store = useDataStore();
  const { livestock, alerts, devices, tasks, farm } = useScopedData();
  const { dateRangeLabel, setSelectedFarmId } = useDashboardFilters();
  const range = dateRangeLabel as DateRange;
  const { lang, t, tr, tt, tRel } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.title = "Dashboard Overview | Terrava";
  }, []);

  const healthyCount = livestock.filter((a) => a.healthStatus === "healthy").length;
  const attentionCount = livestock.filter((a) => a.healthStatus === "attention").length;
  const criticalAlertCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  const activeDevices = devices.filter((d) => d.status === "online").length;
  const avgHealthScore = livestock.length ? Math.round(livestock.reduce((sum, a) => sum + a.healthScore, 0) / livestock.length) : 0;
  const healthyPercent = livestock.length ? Math.round((healthyCount / livestock.length) * 100) : 0;
  const rangeLabel = t("dateRange." + range);

  const healthDistribution = [
    { key: "healthy", color: "#277A4D" },
    { key: "attention", color: "#D89B32" },
    { key: "critical", color: "#C95B5B" },
    { key: "inactive", color: "#88948C" },
  ].map((item) => ({ name: t("status." + item.key), color: item.color, value: livestock.filter((a) => a.healthStatus === item.key).length }));

  const exportOverview = async () => {
    const report = buildOverviewReport(
      { livestock, alerts, devices, tasks, scope: `${farm?.name ?? t("dashboard.allFarms")} · ${rangeLabel}` },
      store,
      { lang, t, tr, tt, tRel }
    );
    await downloadReportPdf(report, {
      generatedOn: t("reports.pdf.generatedOn"),
      scope: t("reports.pdf.scope"),
      summary: t("reports.pdf.summary"),
      findings: t("reports.pdf.findings"),
      footer: t("reports.pdf.footer"),
      page: (current, total) => t("reports.pdf.page", { current, total }),
      locale: lang === "id" ? "id-ID" : "en-GB",
    });
  };
  const activeAlertCount = alerts.filter((a) => a.status === "active").length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Remounting the charts replays their animation, mirroring a fresh fetch.
      setRefreshKey((key) => key + 1);
      toast.success(t("overview.refreshed"));
    }, 900);
  };

  return (
    <div>
      <PageHeader
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg disabled:opacity-70"
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {t("common.refresh")}
            </button>
            <ExportButton label={t("overview.exportOverview")} onExport={exportOverview} />
          </>
        }
      />

      {farm && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-terrava-primary/20 bg-terrava-light/60 px-4 py-2.5 text-sm text-terrava-text">
          {t("overview.filteredBy", { farm: farm.name })}
          <button type="button" onClick={() => setSelectedFarmId("all")} className="ml-auto text-xs font-semibold text-terrava-primary hover:underline">
            {t("overview.showAllFarms")}
          </button>
        </div>
      )}

      <WelcomeBanner
        healthyPercent={healthyPercent}
        activeAlerts={activeAlertCount}
        devicesOnline={activeDevices}
        devicesTotal={devices.length}
        farmName={farm?.name}
      />

      <StaggerGroup className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-6" stagger={0.06}>
        <StaggerItem>
          <MetricCard icon={PawPrint} label={t("metric.totalLivestock")} value={livestock.length} trend={4.2} trendLabel={t("metric.vsLastMonth")} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={HeartPulse} label={t("metric.healthyLivestock")} value={healthyCount} trend={2.1} trendLabel={t("metric.vsLastMonth")} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={TriangleAlert} label={t("metric.needsAttention")} value={attentionCount} trend={-1.4} trendLabel={t("metric.vsLastMonth")} tone="warning" inverseTrend />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={BellRing} label={t("metric.criticalAlerts")} value={criticalAlertCount} trend={-3.5} trendLabel={t("metric.vsYesterday")} tone="error" inverseTrend />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={Radio} label={t("metric.activeDevices")} value={activeDevices} trend={1.8} trendLabel={t("metric.vsLastWeek")} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={Gauge} label={t("metric.avgHealthScore")} value={avgHealthScore} trend={0.9} trendLabel={t("metric.vsLastWeek")} />
        </StaggerItem>
      </StaggerGroup>

      <div key={refreshKey} className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("chart.healthScoreTrend")} description={rangeLabel}>
          <HealthScoreChart data={seriesForRange.health(range)} />
        </ChartCard>
        <ChartCard title={t("chart.healthDistribution")} description={t("chart.healthDistributionDesc")} isEmpty={livestock.length === 0}>
          <AlertDistributionChart data={healthDistribution} />
        </ChartCard>
        <ChartCard title={t("chart.alertFrequency")} description={rangeLabel}>
          <AlertFrequencyChart data={seriesForRange.alerts(range)} />
        </ChartCard>
        <ChartCard title={t("chart.activityTemperature")} description={rangeLabel}>
          <ActivityTrendChart data={seriesForRange.activity(range)} />
        </ChartCard>
        <ChartCard title={t("chart.deviceConnectivity")} description={rangeLabel}>
          <DeviceUptimeChart data={seriesForRange.devices(range)} />
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
