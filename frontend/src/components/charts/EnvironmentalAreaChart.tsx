import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { environmentalData } from "@/data/chartData";

export default function EnvironmentalAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={environmentalData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#277A4D" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#277A4D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7FB89B" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#7FB89B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
        <Area
          type="monotone"
          dataKey="temperature"
          name="Suhu (°C)"
          stroke="#277A4D"
          fill="url(#tempGradient)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={900}
        />
        <Area
          type="monotone"
          dataKey="humidity"
          name="Kelembapan (%)"
          stroke="#7FB89B"
          fill="url(#humidityGradient)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
