import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { healthScoreTrend } from "@/data/chartData";

export default function HealthScoreLineChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={healthScoreTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }}
          labelStyle={{ color: "var(--chart-tooltip-text)", fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          name="Health Score"
          stroke="var(--chart-primary)"
          strokeWidth={3}
          dot={{ r: 4, fill: "var(--chart-primary)" }}
          activeDot={{ r: 6 }}
          isAnimationActive
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
