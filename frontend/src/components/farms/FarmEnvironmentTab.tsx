import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { environmentTrend30d } from "@/data/dashboardChartData";

export default function FarmEnvironmentTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Temperature">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={environmentTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="temperature" stroke="#C95B5B" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Humidity">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={environmentTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="humidity" stroke="#4A7FA7" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Ammonia Level">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={environmentTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit=" ppm" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Line type="monotone" dataKey="ammonia" stroke="#D89B32" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Heat Stress Index">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={environmentTrend30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
            <Legend formatter={() => <span className="text-xs text-terrava-muted">Heat Stress Index</span>} />
            <Line type="monotone" dataKey="heatStressIndex" stroke="var(--chart-primary)" strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
