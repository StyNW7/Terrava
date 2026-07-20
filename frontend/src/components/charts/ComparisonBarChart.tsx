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
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" vertical={false} />
        <XAxis dataKey="aspect" tick={{ fontSize: 11, fill: "#607066" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }}
          cursor={{ fill: "#F7FAF8" }}
        />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Bar dataKey="traditional" name="Traditional" fill="#D5E8DC" radius={[8, 8, 0, 0]} isAnimationActive />
        <Bar dataKey="terrava" name="Terrava" fill="#277A4D" radius={[8, 8, 0, 0]} isAnimationActive />
      </BarChart>
    </ResponsiveContainer>
  );
}
