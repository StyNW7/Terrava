import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import CreateTaskModal, { type TaskDraft } from "@/components/dashboard/CreateTaskModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useScopedData } from "@/hooks/useScopedData";

export default function OverviewAIPanel() {
  const { getLivestockById } = useDataStore();
  const { insights: aiInsights, farmId } = useScopedData();
  const { t, tr } = useLanguage();
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const topInsights = aiInsights.filter((insight) => !insight.reviewed && !insight.dismissed).slice(0, 3);

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.aiRecommendations")}</h3>
        <Link to="/dashboard/ai-insights" className="text-xs font-semibold text-terrava-primary">
          {t("common.viewAll")}
        </Link>
      </div>
      {topInsights.length === 0 && <p className="rounded-xl bg-terrava-bg px-3 py-6 text-center text-sm text-terrava-muted">{t("overview.empty.insights")}</p>}
      <div className="space-y-3">
        {topInsights.map((insight) => (
          <div key={insight.id} className="rounded-xl bg-terrava-bg p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">{t("category." + insight.category)}</span>
            </div>
            <p className="text-sm text-terrava-text">{tr(insight.summary)}</p>
            <div className="mt-2.5 flex gap-2">
              <Link to="/dashboard/ai-insights" className="rounded-lg bg-terrava-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-terrava-hover">
                {t("insights.review")}
              </Link>
              <button
                type="button"
                onClick={() =>
                  setTaskDraft({
                    title: tr(insight.recommendation),
                    farmId: farmId !== "all" ? farmId : getLivestockById(insight.affectedLivestock[0] ?? "")?.farmId ?? "farm-1",
                    source: { type: "insight", id: insight.id },
                  })
                }
                className="rounded-lg border border-terrava-border bg-white px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg"
              >
                {t("insights.createTask")}
              </button>
            </div>
          </div>
        ))}
      </div>
      <CreateTaskModal draft={taskDraft} onClose={() => setTaskDraft(null)} />
    </div>
  );
}
