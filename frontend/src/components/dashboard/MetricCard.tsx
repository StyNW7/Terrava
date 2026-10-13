import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import AnimatedCounter from "@/components/motion/AnimatedCounter";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  supportingText?: string;
  sparkline?: number[];
  tone?: "default" | "warning" | "error";
  /** Set when a falling number is good news (e.g. alerts), so a drop renders green. */
  inverseTrend?: boolean;
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
  inverseTrend = false,
}: MetricCardProps) {
  const isUp = (trend ?? 0) >= 0;
  const isGood = inverseTrend ? !isUp : isUp;
  const iconTone =
    tone === "warning" ? "bg-terrava-warning/10 text-terrava-warning" : tone === "error" ? "bg-terrava-error/10 text-terrava-error" : "bg-terrava-light text-terrava-primary";

  return (
    <div className="card-hover flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconTone)}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-terrava-muted-2">{label}</p>
        </div>
        {sparkline && sparkline.length > 1 && (
          <div className="h-8 w-14 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke="var(--chart-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-4">
      <p className="text-[28px] font-bold leading-none tracking-tight tabular-nums text-terrava-text">
        {typeof value === "number" ? <AnimatedCounter value={value} duration={1.1} /> : value}
      </p>

      {(typeof trend === "number" || trendLabel || supportingText) && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {typeof trend === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                isGood ? "bg-terrava-success/10 text-terrava-success" : "bg-terrava-error/10 text-terrava-error"
              )}
            >
              {isUp ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              {Math.abs(trend)}%
            </span>
          )}
          {(trendLabel || supportingText) && <span className="whitespace-nowrap text-[11px] text-terrava-muted">{trendLabel ?? supportingText}</span>}
        </div>
      )}
      </div>
    </div>
  );
}
