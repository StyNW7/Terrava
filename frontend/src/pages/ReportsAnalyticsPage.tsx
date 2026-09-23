import { useEffect, useState } from "react";
import {
  HeartPulse,
  BellRing,
  Clock,
  Radio,
  TrendingUp,
  Factory,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import ExportButton from "@/components/dashboard/ExportButton";
import PrintButton from "@/components/dashboard/PrintButton";
import ChartCard from "@/components/charts/ChartCard";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import AlertFrequencyChart from "@/components/charts/AlertFrequencyChart";
import AlertDistributionChart from "@/components/charts/AlertDistributionChart";
import FarmComparisonChart from "@/components/charts/FarmComparisonChart";
import ReportCard from "@/components/reports/ReportCard";
import Modal from "@/components/dashboard/Modal";
import {
  livestockHealthDistribution,
  alertCategoryDistribution,
  temperatureActivityCorrelation,
  deviceUptimeTrend30d,
  barnComparisonData,
  responseTimeTrend30d,
  healthScoreByGroup,
} from "@/data/dashboardChartData";
import { farms } from "@/data/mockFarms";
import { useLanguage } from "@/hooks/useLanguage";

const reportDefinitions = [
  { id: "health", lastGenerated: "2 days ago" },
  { id: "alerts", lastGenerated: "1 days ago" },
  { id: "devices", lastGenerated: "3 days ago" },
  { id: "farm", lastGenerated: "5 days ago" },
  { id: "environment", lastGenerated: "1 weeks ago" },
  { id: "staff", lastGenerated: "4 days ago" },
];

export default function ReportsAnalyticsPage() {
  const { t, tt, tRel } = useLanguage();
  const [farmFilter, setFarmFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [compare, setCompare] = useState("previous-period");
  const [previewReport, setPreviewReport] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Reports and Analytics | Terrava";
  }, []);

  const selectedReport = reportDefinitions.find((report) => report.id === previewReport);

  return (
    <div>
      <PageHeader
        title={t("nav.item.reports")}
        subtitle={t("reports.subtitle")}
        actions={
          <>
            <ExportButton />
            <PrintButton />
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect
          label={t("filter.type")}
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "Dairy Cattle", label: tt("livestockType", "Dairy Cattle") },
            { value: "Beef Cattle", label: tt("livestockType", "Beef Cattle") },
          ]}
        />
        <FilterSelect
          label={t("filter.health")}
          value={healthFilter}
          onChange={setHealthFilter}
          options={[
            { value: "healthy", label: t("status.healthy") },
            { value: "attention", label: t("status.attention") },
            { value: "critical", label: t("status.critical") },
          ]}
        />
        <FilterSelect
          label={t("filter.compare")}
          value={compare}
          onChange={setCompare}
          options={[
            { value: "previous-period", label: t("reports.previousPeriod") },
            { value: "previous-year", label: t("reports.previousYear") },
          ]}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={HeartPulse} label={t("metric.avgHealthScore")} value={84} trend={2.4} />
        <MetricCard icon={BellRing} label={t("reports.metric.totalAlerts")} value={18} trend={-5.1} />
        <MetricCard icon={Clock} label={t("reports.metric.resolutionTime")} value="6.2h" trend={-8.3} />
        <MetricCard icon={Radio} label={t("chart.deviceUptime")} value="96%" trend={1.2} />
        <MetricCard icon={TrendingUp} label={t("reports.metric.livestockGrowth")} value="+4.6%" trend={4.6} />
        <MetricCard icon={Factory} label={t("reports.metric.farmProductivity")} value="88%" trend={1.9} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={`1. ${t("chart.healthScoreTrend")}`}>
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title={`2. ${t("impact.charts.alertCategory")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={alertCategoryDistribution} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Bar dataKey="count" fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`3. ${t("chart.alertSeverityTrend")}`}>
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard title={`4. ${t("chart.healthDistribution")}`}>
          <AlertDistributionChart data={livestockHealthDistribution} />
        </ChartCard>
        <ChartCard title={`5. ${t("chart.temperatureActivity")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="temperature" name={t("vitals.temperature")} unit="°C" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="activity" name={t("vitals.activity")} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Scatter data={temperatureActivityCorrelation} fill="var(--chart-primary)" isAnimationActive />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`6. ${t("chart.deviceUptimeTrend")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deviceUptimeTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Line type="monotone" dataKey="uptime" stroke="#4A7FA7" strokeWidth={2.5} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`7. ${t("chart.farmComparison")}`}>
          <FarmComparisonChart />
        </ChartCard>
        <ChartCard title={`8. ${t("chart.barnComparison")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barnComparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="healthScore" name={t("livestock.column.healthScore")} fill="var(--chart-primary)" radius={[6, 6, 0, 0]} isAnimationActive />
              <Bar dataKey="occupancy" name={`${t("farms.occupancy")} %`} fill="var(--chart-soft)" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`9. ${t("chart.responseTimeTrend")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={responseTimeTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="m" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Line type="monotone" dataKey="minutes" stroke="#D89B32" strokeWidth={2.5} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`10. ${t("chart.healthScoreByGroup")}`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={healthScoreByGroup} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Bar dataKey="score" fill="#4D966D" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">{t("reports.library")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportDefinitions.map((report) => (
          <ReportCard
            key={report.id}
            title={t("reports.item." + report.id + ".title")}
            description={t("reports.item." + report.id + ".description")}
            lastGenerated={tRel(report.lastGenerated)}
            onPreview={() => setPreviewReport(report.id)}
          />
        ))}
      </div>

      <Modal
        open={!!selectedReport}
        onClose={() => setPreviewReport(null)}
        title={selectedReport ? t("reports.item." + selectedReport.id + ".title") : t("reports.preview")}
        widthClassName="max-w-2xl"
        footer={
          <>
            <button onClick={() => setPreviewReport(null)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text">
              {t("common.close")}
            </button>
            <button onClick={() => setPreviewReport(null)} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
              {t("reports.downloadPdf")}
            </button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-3">
            <p className="text-sm text-terrava-muted">{t("reports.item." + selectedReport.id + ".description")}</p>
            <div className="rounded-xl border border-dashed border-terrava-border bg-terrava-bg p-6 text-center text-sm text-terrava-muted">
              {t("reports.previewNote", { time: tRel(selectedReport.lastGenerated) })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
