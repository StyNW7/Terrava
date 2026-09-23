import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { batteryTrend14d, signalStrengthTrend14d, dataTransmissionTrend14d } from "@/data/dashboardChartData";
import { useLanguage } from "@/hooks/useLanguage";

export default function DeviceConnectivityTab() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title={t("chart.batteryTrend")}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={batteryTrend14d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="battery" stroke="var(--chart-primary)" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title={t("chart.signalStrength")}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={signalStrengthTrend14d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="signal" stroke="#4A7FA7" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title={t("chart.dataTransmission")} description={t("chart.dataTransmissionDesc")}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataTransmissionTrend14d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="packets" stroke="#75AF8B" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
