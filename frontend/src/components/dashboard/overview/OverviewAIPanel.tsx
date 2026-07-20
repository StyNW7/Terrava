import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import { aiInsights } from "@/data/mockInsights";

export default function OverviewAIPanel() {
  const topInsights = aiInsights.filter((insight) => !insight.reviewed).slice(0, 3);

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">AI Recommendations</h3>
        <Link to="/dashboard/ai-insights" className="text-xs font-semibold text-terrava-primary">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {topInsights.map((insight) => (
          <div key={insight.id} className="rounded-xl bg-terrava-bg p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">{insight.category}</span>
            </div>
            <p className="text-sm text-terrava-text">{insight.summary}</p>
            <div className="mt-2.5 flex gap-2">
              <Link to="/dashboard/ai-insights" className="rounded-lg bg-terrava-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-terrava-hover">
                Review Insight
              </Link>
              <button
                type="button"
                onClick={() => toast.success("Task berhasil dibuat dari insight ini.")}
                className="rounded-lg border border-terrava-border bg-white px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg"
              >
                Create Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
