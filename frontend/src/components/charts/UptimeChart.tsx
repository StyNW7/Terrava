import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { uptimeData } from "@/data/chartData";

export default function UptimeChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={uptimeData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#277A4D" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#277A4D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE6DF" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} />
        <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: "#607066" }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Area
          type="monotone"
          dataKey="uptime"
          name="Device Uptime"
          stroke="#277A4D"
          fill="url(#uptimeGradient)"
          strokeWidth={2}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
