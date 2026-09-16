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

const colors = ["var(--chart-soft)", "var(--chart-soft-2)", "#4E9A6C", "var(--chart-primary)"];

export default function EnergyConsumptionChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={energyConsumptionData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-border)" vertical={false} />
        <XAxis dataKey="mode" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit="mA" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} cursor={{ fill: "var(--chart-track)" }} />
        <Bar dataKey="consumption" name="Konsumsi Daya" radius={[8, 8, 0, 0]} isAnimationActive>
          {energyConsumptionData.map((entry, index) => (
            <Cell key={entry.mode} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
