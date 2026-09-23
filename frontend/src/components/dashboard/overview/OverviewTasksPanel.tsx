import { CalendarClock, CheckCircle2, Syringe, Stethoscope, Scale } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const tasks = [
  { id: 1, icon: Syringe, key: "vaccination", dueKey: "tomorrow", farm: "Green Valley Farm" },
  { id: 2, icon: Stethoscope, key: "vetCheckup", dueDays: 2, farm: "Lembang Dairy Farm" },
  { id: 3, icon: Scale, key: "weighing", dueDays: 3, farm: "Nusantara Livestock Center" },
  { id: 4, icon: CalendarClock, key: "barnInspection", dueDays: 5, farm: "Terrava Demo Farm" },
];

export default function OverviewTasksPanel() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.upcomingTasks")}</h3>
        <CheckCircle2 className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
      </div>
      <ul className="space-y-1">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary">
              <task.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-terrava-text">{t("overview.task." + task.key)}</p>
              <p className="truncate text-xs text-terrava-muted">
                {task.dueKey ? t("overview.due.tomorrow") : t("overview.due.inDays", { count: task.dueDays ?? 0 })}{" "}
                &middot; {task.farm}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
