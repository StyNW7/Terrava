import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, ClipboardCheck, Scale, Stethoscope, Syringe } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { useScopedData } from "@/hooks/useScopedData";
import type { FarmTask } from "@/context/data-store-context";
import { cn } from "@/lib/utils";

const kindIcon: Record<FarmTask["kind"], typeof Syringe> = {
  vaccination: Syringe,
  vet: Stethoscope,
  weighing: Scale,
  inspection: CalendarClock,
  "follow-up": ClipboardCheck,
};

const dayDiff = (date: string) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${date}T00:00:00`).getTime() - start.getTime()) / 86_400_000);
};

export default function OverviewTasksPanel() {
  const { t } = useLanguage();
  const { updateTask, getFarmById } = useDataStore();
  const { tasks } = useScopedData();
  const [showDone, setShowDone] = useState(false);

  const open = tasks.filter((task) => !task.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = tasks.filter((task) => task.done);
  const visible = showDone ? done : open.slice(0, 6);

  const dueLabel = (task: FarmTask) => {
    const diff = dayDiff(task.dueDate);
    if (diff < 0) return t("tasks.overdue", { count: -diff });
    if (diff === 0) return t("tasks.dueToday");
    if (diff === 1) return t("tasks.dueTomorrow");
    return t("overview.due.inDays", { count: diff });
  };

  const toggle = (task: FarmTask) => {
    updateTask(task.id, { done: !task.done });
    if (!task.done) {
      toast(
        (ref) => (
          <span className="flex items-center gap-3">
            {t("tasks.completed")}
            <button
              type="button"
              onClick={() => {
                updateTask(task.id, { done: false });
                toast.dismiss(ref.id);
              }}
              className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold"
            >
              {t("common.undo")}
            </button>
          </span>
        ),
        { duration: 4000 }
      );
    }
  };

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-terrava-text">
          {t("overview.upcomingTasks")} <span className="ml-1 rounded-full bg-terrava-light px-2 py-0.5 text-[11px] text-terrava-primary">{open.length}</span>
        </h3>
        <button type="button" onClick={() => setShowDone((value) => !value)} className="text-xs font-semibold text-terrava-primary hover:underline">
          {showDone ? t("tasks.showOpen") : t("tasks.showDone", { count: done.length })}
        </button>
      </div>
      {visible.length === 0 && (
        <p className="rounded-xl bg-terrava-bg px-3 py-6 text-center text-sm text-terrava-muted">{showDone ? t("tasks.noneDone") : t("tasks.empty")}</p>
      )}
      <ul className="space-y-1">
        {visible.map((task) => {
          const Icon = kindIcon[task.kind];
          const overdue = !task.done && dayDiff(task.dueDate) < 0;
          return (
            <li key={task.id} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-terrava-bg">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle(task)}
                aria-label={t("tasks.markDone", { title: task.titleKey ? t(task.titleKey) : task.title ?? "" })}
                className="mt-2.5 h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--t-primary))]"
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium text-terrava-text", task.done && "text-terrava-muted line-through")}>
                  {task.titleKey ? t(task.titleKey) : task.title}
                </p>
                <p className="truncate text-xs text-terrava-muted">
                  <span className={cn(overdue && "font-semibold text-terrava-error")}>{dueLabel(task)}</span> &middot; {task.assignee} &middot;{" "}
                  {getFarmById(task.farmId)?.name}
                </p>
                {task.source && (
                  <Link
                    to={task.source.type === "alert" ? `/dashboard/alerts/${task.source.id}` : "/dashboard/ai-insights"}
                    className="text-[11px] font-semibold text-terrava-primary hover:underline"
                  >
                    {task.source.type === "alert" ? t("tasks.fromAlert", { id: task.source.id }) : t("tasks.fromInsight")}
                  </Link>
                )}
              </div>
              {task.done && <CheckCircle2 className="mt-2 h-4 w-4 shrink-0 text-terrava-success" aria-hidden="true" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
