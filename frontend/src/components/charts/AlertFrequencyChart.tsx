import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { alertFrequency30d } from "@/data/dashboardChartData";

export default function AlertFrequencyChart({ height = 260 }: { height?: number }) {
  const data = alertFrequency30d.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F5F8F6" }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar dataKey="info" name="Info" stackId="a" fill="#4A7FA7" isAnimationActive />
        <Bar dataKey="warning" name="Warning" stackId="a" fill="#D89B32" isAnimationActive />
        <Bar dataKey="high" name="High" stackId="a" fill="#B4552F" isAnimationActive />
        <Bar dataKey="critical" name="Critical" stackId="a" fill="#C95B5B" radius={[6, 6, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
