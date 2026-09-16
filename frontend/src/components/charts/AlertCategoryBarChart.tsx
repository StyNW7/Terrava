import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { alertCategoryData } from "@/data/chartData";

export default function AlertCategoryBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={alertCategoryData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-border)" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }}
          cursor={{ fill: "var(--chart-track)" }}
        />
        <Bar dataKey="count" name="Jumlah Alert" fill="var(--chart-primary)" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}
