import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { comparisonChartData } from "@/data/chartData";

export default function ComparisonBarChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={comparisonChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-border)" vertical={false} />
        <XAxis dataKey="aspect" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }}
          cursor={{ fill: "var(--chart-track)" }}
        />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar dataKey="traditional" name="Traditional" fill="var(--chart-soft)" radius={[8, 8, 0, 0]} isAnimationActive />
        <Bar dataKey="terrava" name="Terrava" fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
