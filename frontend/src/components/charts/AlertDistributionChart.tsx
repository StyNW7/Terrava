import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { alertSeverityDistribution } from "@/data/dashboardChartData";

interface AlertDistributionChartProps {
  data?: typeof alertSeverityDistribution;
  height?: number;
}

export default function AlertDistributionChart({ data = alertSeverityDistribution, height = 260 }: AlertDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} isAnimationActive animationDuration={800}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
