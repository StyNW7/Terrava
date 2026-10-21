import { Moon, MoonStar, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";

export interface DayPeriod {
  id: "morning" | "midday" | "afternoon" | "evening" | "lateNight";
  /** Greeting dictionary key, takes `{name}`. */
  greeting: string;
  icon: LucideIcon;
  /** Pill colours on the dark green banner. */
  tone: string;
}

/**
 * Indonesian day parts: pagi 04:00–10:59, siang 11:00–14:59, sore
 * 15:00–17:59, malam 18:00–23:59, and dini hari 00:00–03:59.
 */
export function dayPeriodFor(hour: number): DayPeriod {
  if (hour >= 4 && hour < 11) return { id: "morning", greeting: "greeting.morning", icon: Sunrise, tone: "bg-amber-300/20 text-amber-200" };
  if (hour >= 11 && hour < 15) return { id: "midday", greeting: "greeting.afternoon", icon: Sun, tone: "bg-yellow-300/20 text-yellow-200" };
  if (hour >= 15 && hour < 18) return { id: "afternoon", greeting: "greeting.evening", icon: Sunset, tone: "bg-orange-300/20 text-orange-200" };
  if (hour >= 18) return { id: "evening", greeting: "greeting.night", icon: Moon, tone: "bg-indigo-300/20 text-indigo-200" };
  return { id: "lateNight", greeting: "greeting.lateNight", icon: MoonStar, tone: "bg-indigo-300/20 text-indigo-200" };
}
