import type { StatisticItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function StatisticCard({ stat }: { stat: StatisticItem }) {
  const { tr } = useLanguage();
  const Icon = stat.icon;

  return (
    <div className="card-hover group h-full rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-terrava-primary group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      {stat.qualifier && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">
          {tr(stat.qualifier)}
        </p>
      )}
      <p className="text-2xl font-bold text-terrava-text sm:text-3xl">
        {stat.value}
        {stat.suffix && <span className="text-terrava-primary">{tr(stat.suffix)}</span>}
      </p>
      <p className="mt-1 text-sm text-terrava-muted">{tr(stat.label)}</p>
    </div>
  );
}
