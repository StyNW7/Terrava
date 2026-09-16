import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { activityTemperature30d } from "@/data/dashboardChartData";

export default function TemperatureTrendChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={activityTemperature30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[37, 40]} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
        <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#C95B5B" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  );
}
