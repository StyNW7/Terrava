import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { deviceConnectivity30d } from "@/data/dashboardChartData";

export default function DeviceUptimeChart({ height = 260 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={deviceConnectivity30d} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="onlineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#277A4D" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#277A4D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="offlineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C95B5B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#C95B5B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
        <Area type="monotone" dataKey="online" name="Online" stroke="#277A4D" fill="url(#onlineGradient)" strokeWidth={2} isAnimationActive />
        <Area type="monotone" dataKey="offline" name="Offline" stroke="#C95B5B" fill="url(#offlineGradient)" strokeWidth={2} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}
