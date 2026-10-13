import type { ReportSchedule } from "@/context/data-store-context";

/** Next time a schedule fires, for the "next run" hint. */
export function nextRun(schedule: Pick<ReportSchedule, "frequency" | "day" | "time">, from = new Date()): Date {
  const [hours, minutes] = schedule.time.split(":").map(Number);
  const next = new Date(from);
  next.setHours(hours, minutes, 0, 0);
  if (schedule.frequency === "daily") {
    if (next <= from) next.setDate(next.getDate() + 1);
  } else if (schedule.frequency === "weekly") {
    const target = schedule.day % 7; // 7 (Sunday) -> 0
    let diff = (target - next.getDay() + 7) % 7;
    if (diff === 0 && next <= from) diff = 7;
    next.setDate(next.getDate() + diff);
  } else {
    next.setDate(schedule.day);
    if (next <= from) next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/** Human summary such as "Every Monday, 07:00". */
export function scheduleSummary(schedule: ReportSchedule, t: (key: string, vars?: Record<string, string | number>) => string) {
  const day = schedule.frequency === "weekly" ? t("weekday." + schedule.day) : schedule.day;
  return t("reports.scheduleSummary." + schedule.frequency, { day, time: schedule.time });
}
