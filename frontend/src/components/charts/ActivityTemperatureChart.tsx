import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { activityTemperatureData } from "@/data/chartData";

export default function ActivityTemperatureChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={activityTemperatureData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-border)" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[37, 40]}
          tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar yAxisId="left" dataKey="activity" name="Aktivitas" fill="var(--chart-soft)" radius={[6, 6, 0, 0]} isAnimationActive />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="temperature"
          name="Suhu Tubuh (°C)"
          stroke="var(--chart-primary)"
          strokeWidth={3}
          dot={{ r: 3 }}
          isAnimationActive
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
