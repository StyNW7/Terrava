import { Sparkles } from "lucide-react";
import type { AIInsight } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

const priorityTone: Record<AIInsight["priority"], string> = {
  high: "bg-terrava-error/10 text-terrava-error",
  medium: "bg-terrava-warning/10 text-terrava-warning",
  low: "bg-terrava-info/10 text-terrava-info",
};

interface InsightCardProps {
  insight: AIInsight;
  onReview: () => void;
  onCreateTask: () => void;
  onDismiss: () => void;
  onMarkReviewed: () => void;
}

export default function InsightCard({ insight, onReview, onCreateTask, onDismiss, onMarkReviewed }: InsightCardProps) {
  const { getLivestockById } = useDataStore();
  const { t, tr, tRel } = useLanguage();
  const affectedNames = insight.affectedLivestock
    .map((id) => getLivestockById(id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return (
    <div className={`rounded-2xl border border-terrava-border bg-white p-5 shadow-card ${insight.dismissed ? "opacity-70" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone[insight.priority]}`}>
          {t("insights.priorityLabel", { priority: t("priority." + insight.priority) })}
        </span>
        <span className="rounded-full bg-terrava-light px-2.5 py-1 text-xs font-semibold text-terrava-primary">
          {t("category." + insight.category)}
        </span>
        {insight.reviewed && (
          <span className="rounded-full bg-terrava-bg px-2.5 py-1 text-xs text-terrava-muted">{t("insights.reviewed")}</span>
        )}
        <span className="ml-auto text-xs text-terrava-muted">{tRel(insight.generatedAt)}</span>
      </div>

      <h3 className="mb-1.5 flex items-center gap-1.5 text-base font-semibold text-terrava-text">
        <Sparkles className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
        {tr(insight.title)}
      </h3>
      <p className="text-sm text-terrava-muted">{tr(insight.summary)}</p>
      <p className="mt-2 text-xs text-terrava-muted">
        {t("insights.affected")}: {affectedNames} &middot; {t("insights.confidence")} {insight.confidence}%
      </p>
      <div className="mt-3 rounded-xl bg-terrava-bg p-3 text-sm text-terrava-text">{tr(insight.recommendation)}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onReview} className="rounded-lg bg-terrava-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-terrava-hover">
          {t("insights.reviewDetails")}
        </button>
        <button onClick={onCreateTask} className="rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg">
          {t("insights.createTask")}
        </button>
        <button
          type="button"
          onClick={onMarkReviewed}
          aria-pressed={insight.reviewed}
          className="rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg"
        >
          {insight.reviewed ? t("insights.markUnreviewed") : t("insights.markReviewed")}
        </button>
        <button type="button" onClick={onDismiss} className="rounded-lg border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-muted hover:bg-terrava-bg">
          {insight.dismissed ? t("insights.restore") : t("insights.dismiss")}
        </button>
      </div>
    </div>
  );
}
