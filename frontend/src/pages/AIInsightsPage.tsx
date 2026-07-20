import { useEffect, useMemo, useState } from "react";
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
import { aiInsights } from "@/data/mockInsights";
import { insightCategoryDistribution, insightPriorityDistribution, taskCompletionTrend } from "@/data/dashboardChartData";
import { getLivestockById } from "@/data/mockLivestock";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const tabs = [
  { value: "all", label: "All Insights" },
  { value: "health", label: "Health" },
  { value: "behavior", label: "Behavior" },
  { value: "environment", label: "Environment" },
  { value: "productivity", label: "Productivity" },
  { value: "devices", label: "Devices" },
];

export default function AIInsightsPage() {
  const [tab, setTab] = useState("all");
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    document.title = "AI Insights | Terrava";
  }, []);

  const filtered = useMemo(
    () => aiInsights.filter((insight) => !dismissed.includes(insight.id) && (tab === "all" || insight.category === tab)),
    [tab, dismissed]
  );

  const selectedInsight = aiInsights.find((insight) => insight.id === selectedInsightId);
  const newInsightsCount = aiInsights.filter((insight) => !insight.reviewed).length;
  const highPriorityCount = aiInsights.filter((insight) => insight.priority === "high").length;

  return (
    <div>
      <PageHeader title="AI Insights" subtitle="Temukan pola, risiko, dan rekomendasi berdasarkan data peternakan." />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard icon={Sparkles} label="New Insights" value={newInsightsCount} />
        <MetricCard icon={TriangleAlert} label="High-Priority Recommendations" value={highPriorityCount} tone="warning" />
        <MetricCard icon={Users} label="Potential Risk Groups" value={3} />
        <MetricCard icon={ListChecks} label="Estimated Follow-up Tasks" value={12} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Insight Category Distribution">
          <AlertDistributionChart data={insightCategoryDistribution} />
        </ChartCard>
        <ChartCard title="Priority Distribution">
          <AlertDistributionChart data={insightPriorityDistribution} />
        </ChartCard>
        <ChartCard title="Risk Trend" description="Tren skor kesehatan sebagai indikator risiko keseluruhan">
          <HealthScoreChart />
        </ChartCard>
        <ChartCard title="Recommended Action Completion" description="Tugas selesai vs tertunda dalam 14 hari terakhir">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={taskCompletionTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEEA" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #DCE6DF", fontSize: 13 }} />
              <Legend formatter={(value) => <span className="text-xs text-terrava-muted">{value}</span>} />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#277A4D" radius={[0, 0, 0, 0]} isAnimationActive />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#D6EADF" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon={Sparkles} title="Tidak ada insight" description="Belum ada insight AI untuk kategori ini." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onReview={() => setSelectedInsightId(insight.id)}
              onCreateTask={() => toast.success("Task berhasil dibuat dari insight ini.")}
              onDismiss={() => setDismissed((prev) => [...prev, insight.id])}
              onMarkReviewed={() => toast.success("Insight ditandai sebagai sudah ditinjau.")}
            />
          ))}
        </div>
      )}

      <Drawer open={!!selectedInsight} onClose={() => setSelectedInsightId(null)} title={selectedInsight?.title ?? "Insight Detail"}>
        {selectedInsight && (
          <div className="space-y-5">
            <p className="text-sm text-terrava-muted">{selectedInsight.summary}</p>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">Affected Livestock</h4>
              <ul className="space-y-1.5">
                {selectedInsight.affectedLivestock.map((id) => {
                  const animal = getLivestockById(id);
                  return (
                    <li key={id} className="text-sm text-terrava-text">
                      {animal?.name} ({animal?.code})
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-terrava-muted">Supporting Data</h4>
              <HealthScoreChart height={180} />
            </div>

            <div className="rounded-xl bg-terrava-light p-4">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary">AI Explanation</h4>
              <p className="text-sm text-terrava-dark">{selectedInsight.recommendation}</p>
              <p className="mt-2 text-xs text-terrava-muted">Confidence: {selectedInsight.confidence}%</p>
            </div>

            <p className="text-xs text-terrava-muted">
              AI Terrava membantu proses pengambilan keputusan dan tidak menggantikan diagnosis profesional dokter hewan.
            </p>

            <button
              onClick={() => {
                toast.success("Task berhasil dibuat dari insight ini.");
                setSelectedInsightId(null);
              }}
              className="w-full rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
            >
              Create Task from Insight
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
