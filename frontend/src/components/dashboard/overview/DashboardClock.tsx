import { Clock } from "lucide-react";
import type { DayPeriod } from "@/components/dashboard/overview/dayPeriod";
import { useLanguage } from "@/hooks/useLanguage";

const pad = (value: number) => String(value).padStart(2, "0");

/** Indonesian zone names for the three national offsets, otherwise UTC±h. */
function zoneLabel(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const hours = Math.trunc(offsetMinutes / 60);
  const minutes = Math.abs(offsetMinutes % 60);
  const utc = `UTC${offsetMinutes >= 0 ? "+" : "−"}${Math.abs(hours)}${minutes ? `:${pad(minutes)}` : ""}`;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const indonesian: Record<number, string> = { 420: "WIB", 480: "WITA", 540: "WIT" };
  const local = /^Asia\/(Jakarta|Pontianak|Makassar|Jayapura)$/.test(zone) ? indonesian[offsetMinutes] : undefined;
  return { short: local ?? utc, full: local ? `${local} · ${utc}` : utc, zone };
}

const MARKS = ["00:00", "06:00", "12:00", "18:00", "23:59"];

interface DashboardClockProps {
  now: Date;
  period: DayPeriod;
}

/** Live local clock for the overview banner, always written 00:00–23:59. */
export default function DashboardClock({ now, period }: DashboardClockProps) {
  const { t } = useLanguage();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const zone = zoneLabel(now);
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  const progress = (minuteOfDay / 1439) * 100;
  const PeriodIcon = period.icon;

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:w-[300px]">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider text-white/70">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {t("overview.clock.localTime")}
        </span>
        <span className="inline-flex items-center gap-1.5 normal-case tracking-normal" title={zone.zone || zone.full}>
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
          </span>
          {zone.full}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <time dateTime={now.toISOString()} className="flex items-baseline font-bold tabular-nums leading-none tracking-tight">
          <span className="text-4xl sm:text-[2.6rem]">
            {hh}
            <span className="mx-0.5 text-white/60">:</span>
            {mm}
          </span>
          <span className="ml-1 text-lg font-semibold text-white/55">:{ss}</span>
          <span className="sr-only"> {zone.short}</span>
        </time>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${period.tone}`}>
          <PeriodIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {t(`overview.period.${period.id}`)}
        </span>
      </div>

      <div className="mt-4" aria-hidden="true">
        <div className="relative h-1.5 rounded-full bg-white/15">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-300 via-amber-300 to-orange-400"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-300 shadow"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium tabular-nums text-white/50">
          {MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
