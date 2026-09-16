import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { healthScoreTrend30d } from "@/data/dashboardChartData";

interface HealthScoreChartProps {
  data?: typeof healthScoreTrend30d;
  height?: number;
}

export default function HealthScoreChart({ data = healthScoreTrend30d, height = 260 }: HealthScoreChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
        <Line type="monotone" dataKey="score" name="Health Score" stroke="var(--chart-primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  );
}
