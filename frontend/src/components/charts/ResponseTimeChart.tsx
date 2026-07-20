import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { responseTimeComparison } from "@/data/chartData";

export default function ResponseTimeChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={responseTimeComparison}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" horizontal={false} />
        <XAxis type="number" unit="j" tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 12, fill: "#607066" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F7FAF8" }} />
        <Bar dataKey="value" name="Rata-rata waktu respons (jam)" radius={[0, 8, 8, 0]} isAnimationActive>
          {responseTimeComparison.map((entry) => (
            <Cell key={entry.name} fill={entry.name.includes("Terrava") ? "#277A4D" : "#D5E8DC"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
