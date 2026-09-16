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

const reportDefinitions = [
  { id: "health", title: "Livestock Health Report", description: "Ringkasan skor kesehatan, status, dan tren ternak secara menyeluruh.", lastGenerated: "2 hari lalu" },
  { id: "alerts", title: "Alert Report", description: "Rekap seluruh alert berdasarkan kategori, tingkat keparahan, dan waktu penyelesaian.", lastGenerated: "1 hari lalu" },
  { id: "devices", title: "Device Performance Report", description: "Analisis uptime, baterai, dan konektivitas seluruh perangkat IoT.", lastGenerated: "3 hari lalu" },
  { id: "farm", title: "Farm Operations Report", description: "Perbandingan performa operasional antar farm dan kandang.", lastGenerated: "5 hari lalu" },
  { id: "environment", title: "Environmental Report", description: "Kondisi suhu, kelembapan, dan indeks heat stress pada seluruh kandang.", lastGenerated: "1 minggu lalu" },
  { id: "staff", title: "Staff Activity Report", description: "Aktivitas tim, tugas, dan tingkat resolusi alert oleh staff.", lastGenerated: "4 hari lalu" },
];

export default function ReportsAnalyticsPage() {
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
        title="Reports and Analytics"
        subtitle="Analisis performa kesehatan, perangkat, dan operasional peternakan."
        actions={
          <>
            <ExportButton label="Export CSV" />
            <PrintButton />
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <FilterSelect label="Farm" value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={[{ value: "Sapi Perah", label: "Sapi Perah" }, { value: "Sapi Potong", label: "Sapi Potong" }]} />
        <FilterSelect
          label="Health"
          value={healthFilter}
          onChange={setHealthFilter}
          options={[
            { value: "healthy", label: "Healthy" },
            { value: "attention", label: "Needs Attention" },
            { value: "critical", label: "Critical" },
          ]}
        />
        <FilterSelect
          label="Compare"
          value={compare}
          onChange={setCompare}
          options={[
            { value: "previous-period", label: "Previous Period" },
            { value: "previous-year", label: "Previous Year" },
          ]}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard icon={HeartPulse} label="Avg Health Score" value={84} trend={2.4} />
        <MetricCard icon={BellRing} label="Total Alerts" value={18} trend={-5.1} />
        <MetricCard icon={Clock} label="Resolution Time" value="6.2h" trend={-8.3} />
        <MetricCard icon={Radio} label="Device Uptime" value="96%" trend={1.2} />
        <MetricCard icon={TrendingUp} label="Livestock Growth" value="+4.6%" trend={4.6} />
        <MetricCard icon={Factory} label="Farm Productivity" value="88%" trend={1.9} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="1. Health Score Trend">
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title="2. Alert Category Distribution">
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
        <ChartCard title="3. Alert Severity Trend">
          <AlertFrequencyChart />
        </ChartCard>
        <ChartCard title="4. Livestock Status Distribution">
          <AlertDistributionChart data={livestockHealthDistribution} />
        </ChartCard>
        <ChartCard title="5. Temperature and Activity Correlation">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="temperature" name="Temperature" unit="°C" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="activity" name="Activity" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Scatter data={temperatureActivityCorrelation} fill="var(--chart-primary)" isAnimationActive />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="6. Device Uptime Trend">
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
        <ChartCard title="7. Farm Comparison">
          <FarmComparisonChart />
        </ChartCard>
        <ChartCard title="8. Barn Comparison">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barnComparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="healthScore" name="Health Score" fill="var(--chart-primary)" radius={[6, 6, 0, 0]} isAnimationActive />
              <Bar dataKey="occupancy" name="Occupancy %" fill="var(--chart-soft)" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="9. Response Time Trend">
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
        <ChartCard title="10. Health Score by Group">
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

      <h2 className="mb-4 text-lg font-semibold text-terrava-text">Report Library</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportDefinitions.map((report) => (
          <ReportCard key={report.id} title={report.title} description={report.description} lastGenerated={report.lastGenerated} onPreview={() => setPreviewReport(report.id)} />
        ))}
      </div>

      <Modal
        open={!!selectedReport}
        onClose={() => setPreviewReport(null)}
        title={selectedReport?.title ?? "Report Preview"}
        widthClassName="max-w-2xl"
        footer={
          <>
            <button onClick={() => setPreviewReport(null)} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text">
              Close
            </button>
            <button onClick={() => setPreviewReport(null)} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
              Download PDF
            </button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-3">
            <p className="text-sm text-terrava-muted">{selectedReport.description}</p>
            <div className="rounded-xl border border-dashed border-terrava-border bg-terrava-bg p-6 text-center text-sm text-terrava-muted">
              Preview laporan (prototype) &middot; Terakhir dibuat {selectedReport.lastGenerated}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
