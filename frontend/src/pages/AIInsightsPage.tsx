import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, TriangleAlert, Users, ListChecks } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import Tabs from "@/components/dashboard/Tabs";
import Drawer from "@/components/dashboard/Drawer";
import ChartCard from "@/components/charts/ChartCard";
import AlertDistributionChart from "@/components/charts/AlertDistributionChart";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
import EmptyState from "@/components/dashboard/EmptyState";
import InsightCard from "@/components/dashboard/insights/InsightCard";
import CreateTaskModal, { type TaskDraft } from "@/components/dashboard/CreateTaskModal";
import type { AIInsight } from "@/types/dashboard";
import { insightCategoryDistribution, insightPriorityDistribution, taskCompletionTrend } from "@/data/dashboardChartData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

const tabValues = ["all", "health", "behavior", "environment", "productivity", "devices"];

export default function AIInsightsPage() {
  const { insights: aiInsights, getLivestockById, updateInsight, tasks } = useDataStore();
  const { t, tr } = useLanguage();
  const [tab, setTab] = useState("all");
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [showDismissed, setShowDismissed] = useState(false);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);

  useEffect(() => {
    document.title = "AI Insights | Terrava";
  }, []);

  const dismissedCount = aiInsights.filter((insight) => insight.dismissed).length;
  const filtered = useMemo(
    () => aiInsights.filter((insight) => Boolean(insight.dismissed) === showDismissed && (tab === "all" || insight.category === tab)),
    [aiInsights, tab, showDismissed]
  );

  const taskFrom = (insight: AIInsight) => {
    const firstAnimal = getLivestockById(insight.affectedLivestock[0] ?? "");
    setTaskDraft({
      title: tr(insight.recommendation),
      farmId: firstAnimal?.farmId ?? "farm-1",
      source: { type: "insight", id: insight.id },
    });
  };

  const dismiss = (insight: AIInsight) => {
    updateInsight(insight.id, { dismissed: true });
    toast(
      (toastRef) => (
        <span className="flex items-center gap-3">
          {t("insights.dismissedToast")}
          <button
            type="button"
            onClick={() => {
              updateInsight(insight.id, { dismissed: false });
              toast.dismiss(toastRef.id);
            }}
            className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold"
          >
            {t("common.undo")}
          </button>
        </span>
      ),
      { duration: 5000 }
    );
  };

  const tabs = tabValues.map((value) => ({
    value,
    label: value === "all" ? t("insights.tab.all") : t("category." + value),
  }));

  const selectedInsight = aiInsights.find((insight) => insight.id === selectedInsightId);
  const newInsightsCount = aiInsights.filter((insight) => !insight.reviewed).length;
  const highPriorityCount = aiInsights.filter((insight) => insight.priority === "high" && !insight.dismissed).length;
  const riskGroups = new Set(
    aiInsights
      .filter((insight) => insight.priority === "high" && !insight.dismissed)
      .flatMap((insight) => insight.affectedLivestock.map((id) => getLivestockById(id)?.herdGroup))
      .filter(Boolean)
  ).size;
  const openTasks = tasks.filter((task) => !task.done).length;

  return (
    <div>
      <PageHeader title={t("nav.item.aiInsights")} subtitle={t("insights.subtitle")} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard icon={Sparkles} label={t("insights.metric.new")} value={newInsightsCount} />
        <MetricCard icon={TriangleAlert} label={t("insights.metric.highPriority")} value={highPriorityCount} tone="warning" />
        <MetricCard icon={Users} label={t("insights.metric.riskGroups")} value={riskGroups} />
        <MetricCard icon={ListChecks} label={t("insights.metric.followUpTasks")} value={openTasks} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("chart.insightCategory")}>
          <AlertDistributionChart data={insightCategoryDistribution} />
        </ChartCard>
        <ChartCard title={t("chart.priorityDistribution")}>
          <AlertDistributionChart data={insightPriorityDistribution} />
        </ChartCard>
        <ChartCard title={t("chart.riskTrend")} description={t("chart.riskTrendDesc")}>
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title={t("chart.actionCompletion")} description={t("chart.actionCompletionDesc")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={taskCompletionTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-tick)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--chart-border)", background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-text)", fontSize: 13 }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="completed" name={t("chart.completed")} stackId="a" fill="var(--chart-primary)" radius={[0, 0, 0, 0]} isAnimationActive />
              <Bar dataKey="pending" name={t("chart.pending")} stackId="a" fill="var(--chart-soft)" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {dismissedCount > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            aria-pressed={showDismissed}
            onClick={() => setShowDismissed((value) => !value)}
            className="rounded-xl border border-terrava-border px-3 py-1.5 text-xs font-semibold text-terrava-text hover:bg-terrava-bg"
          >
            {showDismissed ? t("insights.showActive") : t("insights.showDismissed", { count: dismissedCount })}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Sparkles} title={t("insights.emptyTitle")} description={t("insights.emptyDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onReview={() => setSelectedInsightId(insight.id)}
              onCreateTask={() => taskFrom(insight)}
              onDismiss={() => (insight.dismissed ? updateInsight(insight.id, { dismissed: false }) : dismiss(insight))}
              onMarkReviewed={() => {
                updateInsight(insight.id, { reviewed: !insight.reviewed });
                if (!insight.reviewed) toast.success(t("insights.markedReviewed"));
              }}
            />
          ))}
        </div>
      )}

      <Drawer open={!!selectedInsight} onClose={() => setSelectedInsightId(null)} title={selectedInsight ? tr(selectedInsight.title) : t("insights.detailTitle")}>
        {selectedInsight && (
          <div className="space-y-5">
            <p className="text-sm text-terrava-muted">{tr(selectedInsight.summary)}</p>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">{t("insights.affectedLivestock")}</h4>
              <ul className="space-y-1.5">
                {selectedInsight.affectedLivestock.map((id) => {
                  const animal = getLivestockById(id);
                  return (
                    <li key={id}>
                      <Link to={"/dashboard/livestock/" + id} className="text-sm text-terrava-text hover:text-terrava-primary hover:underline">
                        {animal?.name} ({animal?.code})
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">{t("insights.supportingData")}</h4>
              <HealthScoreChart height={180} />
            </div>

            <div className="rounded-xl bg-terrava-light p-4">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary">{t("insights.aiExplanation")}</h4>
              <p className="text-sm text-terrava-dark">{tr(selectedInsight.recommendation)}</p>
              <p className="mt-2 text-xs text-terrava-muted">{t("insights.confidence")}: {selectedInsight.confidence}%</p>
            </div>

            <p className="text-xs text-terrava-muted">
              {t("solutions.ai.disclaimer")}
            </p>

            <button
              type="button"
              onClick={() => {
                taskFrom(selectedInsight);
                if (!selectedInsight.reviewed) updateInsight(selectedInsight.id, { reviewed: true });
                setSelectedInsightId(null);
              }}
              className="w-full rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              {t("insights.createTaskFrom")}
            </button>
          </div>
        )}
      </Drawer>
      <CreateTaskModal draft={taskDraft} onClose={() => setTaskDraft(null)} />
    </div>
  );
}
