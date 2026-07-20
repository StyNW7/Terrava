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
import { energyConsumptionData } from "@/data/chartData";

const colors = ["#D5E8DC", "#9DC7AE", "#4E9A6C", "#277A4D"];

export default function EnergyConsumptionChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={energyConsumptionData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" vertical={false} />
        <XAxis dataKey="mode" tick={{ fontSize: 11, fill: "#607066" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} unit="mA" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} cursor={{ fill: "#F7FAF8" }} />
        <Bar dataKey="consumption" name="Konsumsi Daya" radius={[8, 8, 0, 0]} isAnimationActive>
          {energyConsumptionData.map((entry, index) => (
            <Cell key={entry.mode} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
