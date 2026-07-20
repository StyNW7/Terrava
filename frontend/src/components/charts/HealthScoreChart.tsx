import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { healthScoreTrend30d } from "@/data/dashboardChartData";

interface HealthScoreChartProps {
  data?: typeof healthScoreTrend30d;
  height?: number;
}

export default function HealthScoreChart({ data = healthScoreTrend30d, height = 260 }: HealthScoreChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Line type="monotone" dataKey="score" name="Health Score" stroke="#277A4D" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  );
}
