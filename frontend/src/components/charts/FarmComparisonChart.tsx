import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { farmComparisonData } from "@/data/dashboardChartData";

export default function FarmComparisonChart({ height = 280 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={farmComparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar dataKey="healthScore" name="Health Score" fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
        <Bar dataKey="deviceCoverage" name="Device Coverage" fill="var(--chart-soft-2)" radius={[8, 8, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
