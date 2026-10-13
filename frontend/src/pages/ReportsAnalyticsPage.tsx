import { useEffect, useMemo, useState } from "react";
import {
  HeartPulse,
  BellRing,
  CircleCheck,
  Radio,
  PawPrint,
  Factory,
  FileHeart,
  FileWarning,
  Cpu,
  Building2,
  ThermometerSun,
  Users,
  FileDown,
  FileSpreadsheet,
  History,
  Loader2,
  RotateCcw,
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
import ReportPreview from "@/components/reports/ReportPreview";
import ScheduleReportModal from "@/components/reports/ScheduleReportModal";
import Modal from "@/components/dashboard/Modal";
import {
  temperatureActivityCorrelation,
  deviceUptimeTrend30d,
  responseTimeTrend30d,
  healthScoreByGroup,
  healthScoreTrend30d,
  alertFrequency30d,
  farmComparisonData,
} from "@/data/dashboardChartData";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import { useReportActions } from "@/hooks/useReportActions";
import { REPORT_TYPES, type ReportDocument, type ReportType } from "@/lib/reports";
import { downloadCsv } from "@/lib/download";
import { scheduleSummary } from "@/lib/schedule";
import type { ReportFilters } from "@/context/data-store-context";
import { isoToRelative, fileStamp } from "@/utils/time";

const reportIcons: Record<ReportType, typeof FileHeart> = {
  health: FileHeart,
  alerts: FileWarning,
  devices: Cpu,
  farm: Building2,
  environment: ThermometerSun,
  staff: Users,
};

/** Seeded "last generated" times so the library looks lived-in before the first download. */
const seedLastGenerated: Record<ReportType, string> = {
  health: "2 days ago",
  alerts: "1 day ago",
  devices: "3 days ago",
  farm: "5 days ago",
  environment: "1 week ago",
  staff: "4 days ago",
};

/** Comparison deltas for the summary tiles, per comparison window. */
const comparisonTrends = {
  "previous-period": [2.4, -5.1, 3.2, 1.2, 4.6, 1.9],
  "previous-year": [6.8, -12.4, 9.5, 3.5, 11.2, 5.4],
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--chart-border)",
  background: "var(--chart-tooltip-bg)",
  color: "var(--chart-tooltip-text)",
  fontSize: 13,
};

export default function ReportsAnalyticsPage() {
  const { t, tt, tRel, lang } = useLanguage();
  const store = useDataStore();
  const { build, downloadPdf, downloadCsv: downloadReportCsv, busy } = useReportActions();
  const [filters, setFilters] = useState<ReportFilters>({ farmId: "all", livestockType: "all", health: "all", compare: "previous-period" });
  const [preview, setPreview] = useState<ReportDocument | null>(null);
  const [scheduleType, setScheduleType] = useState<ReportType | null>(null);

  useEffect(() => {
    document.title = "Reports and Analytics | Terrava";
  }, []);

  const setFilter = <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));

  // Live slices that follow the filter bar.
  const scoped = useMemo(() => {
    const inFarm = (farmId: string) => filters.farmId === "all" || farmId === filters.farmId;
    const livestock = store.activeLivestock.filter(
      (animal) =>
        inFarm(animal.farmId) &&
        (filters.livestockType === "all" || animal.type === filters.livestockType) &&
        (filters.health === "all" || animal.healthStatus === filters.health)
    );
    const ids = new Set(livestock.map((animal) => animal.id));
    const animalFilters = filters.livestockType !== "all" || filters.health !== "all";
    const alerts = store.alerts.filter((alert) => inFarm(alert.farmId) && (!animalFilters || ids.has(alert.livestockId)));
    const devices = store.devices.filter((device) => inFarm(device.farmId));
    const barns = store.barns.filter((barn) => inFarm(barn.farmId));
    return { livestock, alerts, devices, barns };
  }, [store.activeLivestock, store.alerts, store.devices, store.barns, filters]);

  const avg = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);
  const capacity = scoped.barns.reduce((sum, barn) => sum + barn.capacity, 0);
  const occupancy = scoped.barns.reduce((sum, barn) => sum + barn.occupancy, 0);
  const resolved = scoped.alerts.filter((alert) => alert.status === "resolved").length;
  const trends = comparisonTrends[filters.compare];
  const trendLabel = filters.compare === "previous-year" ? t("reports.vsPreviousYear") : t("reports.vsPreviousPeriod");

  const metrics = [
    { icon: HeartPulse, label: t("metric.avgHealthScore"), value: Math.round(avg(scoped.livestock.map((a) => a.healthScore))) },
    { icon: BellRing, label: t("reports.metric.totalAlerts"), value: scoped.alerts.length, inverse: true },
    { icon: CircleCheck, label: t("rpt.alerts.resolutionRate"), value: `${scoped.alerts.length ? Math.round((resolved / scoped.alerts.length) * 100) : 0}%` },
    { icon: Radio, label: t("chart.deviceUptime"), value: `${avg(scoped.devices.map((d) => d.uptime)).toFixed(1)}%` },
    { icon: PawPrint, label: t("metric.totalLivestock"), value: scoped.livestock.length },
    { icon: Factory, label: t("rpt.farm.occupancy"), value: `${capacity ? Math.round((occupancy / capacity) * 100) : 0}%` },
  ];

  const healthDistribution = [
    { name: t("status.healthy"), key: "healthy", color: "#277A4D" },
    { name: t("status.attention"), key: "attention", color: "#D89B32" },
    { name: t("status.critical"), key: "critical", color: "#C95B5B" },
    { name: t("status.inactive"), key: "inactive", color: "#88948C" },
  ].map((item) => ({ name: item.name, color: item.color, value: scoped.livestock.filter((a) => a.healthStatus === item.key).length }));

  const alertCategories = ["health", "behavior", "location", "device", "environmental", "weather"].map((category) => ({
    category: t("category." + category),
    count: scoped.alerts.filter((alert) => alert.category === category).length,
  }));

  const barnComparison = scoped.barns.map((barn) => ({
    name: barn.name,
    healthScore: barn.healthScore,
    occupancy: Math.round((barn.occupancy / barn.capacity) * 100),
  }));

  const exportChart = (name: string, rows: Record<string, string | number>[]) => () => {
    if (rows.length === 0) return;
    downloadCsv(
      `terrava-${name}_${fileStamp()}.csv`,
      rows,
      Object.keys(rows[0]).map((key) => ({ header: key, value: (row: Record<string, string | number>) => row[key] }))
    );
  };

  const exportSummary = () => {
    const rows = [
      ...metrics.map((metric, index) => ({ section: t("reports.analyticsSummary"), label: metric.label, value: metric.value, comparison: `${trends[index]}% ${trendLabel}` })),
      ...healthDistribution.map((item) => ({ section: t("chart.healthDistribution"), label: item.name, value: item.value, comparison: "" })),
      ...alertCategories.map((item) => ({ section: t("impact.charts.alertCategory"), label: item.category, value: item.count, comparison: "" })),
    ];
    downloadCsv(`terrava-analytics-summary_${fileStamp()}.csv`, rows, [
      { header: "Section", value: (row) => row.section },
      { header: "Metric", value: (row) => row.label },
      { header: "Value", value: (row) => row.value },
      { header: "Comparison", value: (row) => row.comparison },
    ]);
    return rows.length;
  };

  const lastGenerated = (type: ReportType) => {
    const entry = store.reportHistory.find((item) => item.reportType === type);
    return entry ? tRel(isoToRelative(entry.generatedAt)) : tRel(seedLastGenerated[type]);
  };

  const farmName = (id: string) => (id === "all" ? t("dashboard.allFarms") : store.getFarmById(id)?.name ?? id);

  return (
    <div>
      <PageHeader
        title={t("nav.item.reports")}
        subtitle={t("reports.subtitle")}
        actions={
          <>
            <ExportButton onExport={exportSummary} />
            <PrintButton />
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3 shadow-card">
        <FilterSelect label={t("filter.farm")} value={filters.farmId} onChange={(value) => setFilter("farmId", value)} options={store.farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect
          label={t("filter.type")}
          value={filters.livestockType}
          onChange={(value) => setFilter("livestockType", value)}
          options={[
            { value: "Dairy Cattle", label: tt("livestockType", "Dairy Cattle") },
            { value: "Beef Cattle", label: tt("livestockType", "Beef Cattle") },
          ]}
        />
        <FilterSelect
          label={t("filter.health")}
          value={filters.health}
          onChange={(value) => setFilter("health", value)}
          options={[
            { value: "healthy", label: t("status.healthy") },
            { value: "attention", label: t("status.attention") },
            { value: "critical", label: t("status.critical") },
          ]}
        />
        <select
          value={filters.compare}
          onChange={(event) => setFilter("compare", event.target.value as ReportFilters["compare"])}
          aria-label={t("filter.compare")}
          className="h-10 rounded-xl border border-terrava-border bg-white pl-3.5 text-[13px] font-medium text-terrava-text focus:border-terrava-primary focus:outline-none"
        >
          <option value="previous-period">
            {t("filter.compare")}: {t("reports.previousPeriod")}
          </option>
          <option value="previous-year">
            {t("filter.compare")}: {t("reports.previousYear")}
          </option>
        </select>
        {(filters.farmId !== "all" || filters.livestockType !== "all" || filters.health !== "all") && (
          <button
            type="button"
            onClick={() => setFilters((current) => ({ ...current, farmId: "all", livestockType: "all", health: "all" }))}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-terrava-primary hover:bg-terrava-light"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.reset")}
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            trend={trends[index]}
            trendLabel={trendLabel}
            inverseTrend={metric.inverse}
          />
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={`1. ${t("chart.healthScoreTrend")}`} onExport={exportChart("health-score-trend", healthScoreTrend30d)}>
          <HealthScoreChart />
        </ChartCard>
        <ChartCard
          title={`2. ${t("impact.charts.alertCategory")}`}
          description={t("reports.liveData")}
          isEmpty={scoped.alerts.length === 0}
          onExport={exportChart("alert-categories", alertCategories)}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={alertCategories} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--chart-track)" }} />
              <Bar dataKey="count" name={t("reports.metric.totalAlerts")} fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`3. ${t("chart.alertSeverityTrend")}`} onExport={exportChart("alert-frequency", alertFrequency30d)}>
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard
          title={`4. ${t("chart.healthDistribution")}`}
          description={t("reports.liveData")}
          isEmpty={scoped.livestock.length === 0}
          onExport={exportChart("health-distribution", healthDistribution.map(({ name, value }) => ({ status: name, count: value })))}
        >
          <AlertDistributionChart data={healthDistribution} />
        </ChartCard>
        <ChartCard title={`5. ${t("chart.temperatureActivity")}`} onExport={exportChart("temperature-activity", temperatureActivityCorrelation)}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="temperature" name={t("vitals.temperature")} unit="°C" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="activity" name={t("vitals.activity")} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} />
              <Scatter data={temperatureActivityCorrelation} fill="var(--chart-primary)" isAnimationActive />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`6. ${t("chart.deviceUptimeTrend")}`} onExport={exportChart("device-uptime", deviceUptimeTrend30d)}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deviceUptimeTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="uptime" stroke="#4A7FA7" strokeWidth={2.5} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`7. ${t("chart.farmComparison")}`} onExport={exportChart("farm-comparison", farmComparisonData)}>
          <FarmComparisonChart />
        </ChartCard>
        <ChartCard
          title={`8. ${t("chart.barnComparison")}`}
          description={t("reports.liveData")}
          isEmpty={barnComparison.length === 0}
          onExport={exportChart("barn-comparison", barnComparison)}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barnComparison} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--chart-track)" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="healthScore" name={t("livestock.column.healthScore")} fill="var(--chart-primary)" radius={[6, 6, 0, 0]} isAnimationActive />
              <Bar dataKey="occupancy" name={`${t("farms.occupancy")} %`} fill="var(--chart-soft)" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`9. ${t("chart.responseTimeTrend")}`} onExport={exportChart("response-time", responseTimeTrend30d)}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={responseTimeTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="m" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="minutes" stroke="#D89B32" strokeWidth={2.5} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={`10. ${t("chart.healthScoreByGroup")}`} onExport={exportChart("health-by-group", healthScoreByGroup)}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={healthScoreByGroup} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--chart-track)" }} />
              <Bar dataKey="score" fill="#4D966D" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-terrava-text">{t("reports.library")}</h2>
          <p className="text-xs text-terrava-muted">{t("reports.filtersApplied")}</p>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORT_TYPES.map((type) => {
          const schedule = store.reportSchedules.find((item) => item.reportType === type);
          return (
            <ReportCard
              key={type}
              icon={reportIcons[type]}
              title={t(`reports.item.${type}.title`)}
              description={t(`reports.item.${type}.description`)}
              lastGenerated={lastGenerated(type)}
              scheduleLabel={schedule ? scheduleSummary(schedule, t) : undefined}
              downloading={busy === `${type}-pdf`}
              onPreview={() => setPreview(build(type, filters))}
              onDownloadPdf={() => downloadPdf(type, filters)}
              onDownloadCsv={() => downloadReportCsv(type, filters)}
              onSchedule={() => setScheduleType(type)}
            />
          );
        })}
      </div>

      <section className="rounded-2xl border border-terrava-border bg-white p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-terrava-text">
          <History className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("reports.history")}
        </h2>
        {store.reportHistory.length === 0 ? (
          <p className="rounded-xl bg-terrava-bg px-4 py-6 text-center text-sm text-terrava-muted">{t("reports.historyEmpty")}</p>
        ) : (
          <ul className="divide-y divide-terrava-border-muted">
            {store.reportHistory.slice(0, 8).map((entry) => {
              const type = entry.reportType as ReportType;
              return (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-terrava-light text-terrava-primary">
                    {entry.format === "pdf" ? <FileDown className="h-4 w-4" aria-hidden="true" /> : <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-terrava-text">{t(`reports.item.${type}.title`)}</span>
                    <span className="block truncate text-xs text-terrava-muted">
                      {entry.format.toUpperCase()} · {farmName(entry.filters.farmId)} ·{" "}
                      {new Date(entry.generatedAt).toLocaleString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => (entry.format === "pdf" ? downloadPdf(type, entry.filters) : downloadReportCsv(type, entry.filters))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg"
                  >
                    {t("reports.redownload")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={t("reports.preview")}
        widthClassName="max-w-3xl"
        footer={
          preview && (
            <>
              <button type="button" onClick={() => setPreview(null)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={() => downloadReportCsv(preview.type as ReportType, filters, preview)}
                className="inline-flex items-center gap-2 rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" /> {t("reports.downloadCsv")}
              </button>
              <button
                type="button"
                disabled={busy === `${preview.type}-pdf`}
                onClick={() => downloadPdf(preview.type as ReportType, filters, preview)}
                className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-60"
              >
                {busy === `${preview.type}-pdf` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileDown className="h-4 w-4" aria-hidden="true" />}
                {t("reports.downloadPdf")}
              </button>
            </>
          )
        }
      >
        {preview && <ReportPreview report={preview} />}
      </Modal>

      <ScheduleReportModal
        reportType={scheduleType}
        title={scheduleType ? t(`reports.item.${scheduleType}.title`) : ""}
        onClose={() => setScheduleType(null)}
      />
    </div>
  );
}
