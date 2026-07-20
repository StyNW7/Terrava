import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { activityTemperature30d } from "@/data/dashboardChartData";

export default function TemperatureTrendChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={activityTemperature30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[37, 40]} tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#C95B5B" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  );
}
