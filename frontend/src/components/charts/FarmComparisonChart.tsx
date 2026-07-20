import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { farmComparisonData } from "@/data/dashboardChartData";

export default function FarmComparisonChart({ height = 280 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={farmComparisonData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F5F8F6" }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar dataKey="healthScore" name="Health Score" fill="#277A4D" radius={[8, 8, 0, 0]} isAnimationActive />
        <Bar dataKey="deviceCoverage" name="Device Coverage" fill="#A7CFB7" radius={[8, 8, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
