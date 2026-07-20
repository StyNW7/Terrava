import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  supportingText?: string;
  sparkline?: number[];
  tone?: "default" | "warning" | "error";
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  supportingText,
  sparkline,
  tone = "default",
}: MetricCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  const iconTone =
    tone === "warning" ? "bg-terrava-warning/10 text-terrava-warning" : tone === "error" ? "bg-terrava-error/10 text-terrava-error" : "bg-terrava-light text-terrava-primary";

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {sparkline && sparkline.length > 1 && (
          <div className="h-8 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke="#277A4D" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs font-medium text-terrava-muted-2">{label}</p>
      <p className="mt-1 text-2xl font-bold text-terrava-text sm:text-[28px]">{value}</p>

      <div className="mt-2 flex items-center gap-2">
        {typeof trend === "number" && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-terrava-success" : "text-terrava-error"}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {Math.abs(trend)}%
          </span>
        )}
        {(trendLabel || supportingText) && <span className="truncate text-xs text-terrava-muted">{trendLabel ?? supportingText}</span>}
      </div>
    </div>
  );
}
