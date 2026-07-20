import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { healthStatusDistribution } from "@/data/chartData";

export default function HealthStatusPieChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={healthStatusDistribution}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          isAnimationActive
          animationDuration={900}
        >
          {healthStatusDistribution.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
