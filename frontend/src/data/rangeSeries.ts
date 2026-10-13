import { format, subDays, subHours } from "date-fns";
import { createSeededRandom, randomFloat, randomInt } from "@/utils/seededRandom";
import { activityTemperature30d, alertFrequency30d, deviceConnectivity30d, healthScoreTrend30d } from "@/data/dashboardChartData";

/**
 * Time series for the dashboard date-range picker. The last 30 days are the
 * same points used everywhere else, extended with 60 older days and a 24-hour
 * view for "today", so every range shows consistent numbers.
 */

export type DateRange = "today" | "last-7-days" | "last-30-days" | "last-90-days";

const random = createSeededRandom(9119);
const olderDays = Array.from({ length: 60 }).map((_, index) => subDays(new Date(), 89 - index));
const hours = Array.from({ length: 24 }).map((_, index) => subHours(new Date(), 23 - index));
const dayLabel = (day: Date) => format(day, "dd MMM");
const hourLabel = (hour: Date) => format(hour, "HH:00");

const healthDaily = [
  ...olderDays.map((day, index) => ({ date: dayLabel(day), score: Math.round(72 + index * 0.1 + randomFloat(random, -3, 3)) })),
  ...healthScoreTrend30d,
];
const alertsDaily = [
  ...olderDays.map((day) => ({
    date: dayLabel(day),
    info: randomInt(random, 0, 3),
    warning: randomInt(random, 0, 5),
    high: randomInt(random, 0, 2),
    critical: randomInt(random, 0, 1),
  })),
  ...alertFrequency30d,
];
const activityDaily = [
  ...olderDays.map((day, index) => ({
    date: dayLabel(day),
    activity: Math.round(55 + Math.sin(index / 3) * 12 + randomFloat(random, -5, 5)),
    temperature: Number((38.3 + Math.sin(index / 4) * 0.3 + randomFloat(random, -0.15, 0.15)).toFixed(1)),
  })),
  ...activityTemperature30d,
];
const devicesDaily = [
  ...olderDays.map((day, index) => ({
    date: dayLabel(day),
    online: Math.round(15 + Math.sin(index / 5) * 2 + randomFloat(random, -1, 1)),
    offline: Math.round(5 - Math.sin(index / 5) * 1.5 + randomFloat(random, -0.5, 1)),
  })),
  ...deviceConnectivity30d,
];

// Hourly shapes follow a day/night rhythm around today's daily value.
const lastHealth = healthScoreTrend30d[healthScoreTrend30d.length - 1].score;
const healthHourly = hours.map((hour) => ({ date: hourLabel(hour), score: Math.round(lastHealth + randomFloat(random, -1.5, 1.5)) }));
const alertsHourly = hours.map((hour) => ({
  date: hourLabel(hour),
  info: randomInt(random, 0, 1),
  warning: randomInt(random, 0, 1),
  high: random() > 0.85 ? 1 : 0,
  critical: random() > 0.95 ? 1 : 0,
}));
const activityHourly = hours.map((hour) => {
  const h = hour.getHours();
  const daylight = Math.sin(((h - 6) / 24) * Math.PI * 2);
  return {
    date: hourLabel(hour),
    activity: Math.max(5, Math.round(50 + daylight * 30 + randomFloat(random, -6, 6))),
    temperature: Number((38.4 + daylight * 0.35 + randomFloat(random, -0.1, 0.1)).toFixed(1)),
  };
});
const devicesHourly = hours.map((hour) => ({ date: hourLabel(hour), online: randomInt(random, 15, 18), offline: randomInt(random, 2, 4) }));

const take = <T>(daily: T[], hourly: T[], range: DateRange): T[] => {
  if (range === "today") return hourly;
  if (range === "last-7-days") return daily.slice(-7);
  if (range === "last-90-days") return daily;
  return daily.slice(-30);
};

export const seriesForRange = {
  health: (range: DateRange) => take(healthDaily, healthHourly, range),
  alerts: (range: DateRange) => take(alertsDaily, alertsHourly, range),
  activity: (range: DateRange) => take(activityDaily, activityHourly, range),
  devices: (range: DateRange) => take(devicesDaily, devicesHourly, range),
};
