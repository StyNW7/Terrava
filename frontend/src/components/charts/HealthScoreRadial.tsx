import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function HealthScoreRadial({ score = 92 }: { score?: number }) {
  const data = [{ name: "Health Score", value: score, fill: "var(--chart-primary)" }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar background={{ fill: "var(--chart-track)" }} dataKey="value" cornerRadius={12} isAnimationActive animationDuration={900} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-terrava-text">{score}</span>
        <span className="text-[11px] text-terrava-muted">Health Score</span>
      </div>
    </div>
  );
}
