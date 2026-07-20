import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { activityTemperature30d } from "@/data/dashboardChartData";

export default function ActivityTrendChart({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={activityTemperature30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" domain={[37, 40]} tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar yAxisId="left" dataKey="activity" name="Activity" fill="#D6EADF" radius={[6, 6, 0, 0]} isAnimationActive />
        <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#277A4D" strokeWidth={2.5} dot={false} isAnimationActive />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
