import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "@/components/charts/ChartCard";
import { createSeededRandom, randomFloat } from "@/utils/seededRandom";
import type { Livestock } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";

const rangeValues = ["24h", "7d", "30d", "90d"];

function generateSeries(seed: number, points: number, base: number, spread: number) {
  const random = createSeededRandom(seed);
  return Array.from({ length: points }).map((_, index) => ({
    label: `T-${points - index}`,
    value: Number((base + randomFloat(random, -spread, spread, 2)).toFixed(2)),
  }));
}

function VitalChart({ title, data, color, unit }: { title: string; data: { label: string; value: number }[]; color: string; unit: string }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} unit={unit} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default function LivestockVitalSignsTab({ animal }: { animal: Livestock }) {
  const { t } = useLanguage();
  const [range, setRange] = useState("7d");
  const ranges = rangeValues.map((value) => ({ value, label: t("range." + value) }));
  const points = range === "24h" ? 24 : range === "7d" ? 14 : range === "30d" ? 30 : 45;

  const seedBase = animal.id.charCodeAt(4) + animal.id.charCodeAt(5);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {ranges.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${range === option.value ? "bg-terrava-primary text-white" : "border border-terrava-border text-terrava-text hover:bg-terrava-bg"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VitalChart title={t("chart.temperatureTrend")} data={generateSeries(seedBase + 1, points, animal.temperature, 0.6)} color="#C95B5B" unit="°C" />
        <VitalChart title={t("chart.heartRateTrend")} data={generateSeries(seedBase + 2, points, animal.heartRate, 8)} color="#4A7FA7" unit=" bpm" />
        <VitalChart title={t("chart.activityTrend")} data={generateSeries(seedBase + 3, points, animal.activityLevel, 15)} color="var(--chart-primary)" unit="" />
        <VitalChart title={t("chart.oxygenTrend")} data={generateSeries(seedBase + 4, points, animal.oxygenLevel, 2)} color="#D89B32" unit="%" />
        <VitalChart title={t("chart.healthScoreHistory")} data={generateSeries(seedBase + 5, points, animal.healthScore, 5)} color="#4D966D" unit="" />
      </div>
    </div>
  );
}
