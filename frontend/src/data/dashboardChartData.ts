import { subDays, format } from "date-fns";
import { createSeededRandom, randomFloat, randomInt } from "@/utils/seededRandom";
import { livestock } from "@/data/mockLivestock";
import { alerts } from "@/data/mockAlerts";
import { farms, barns } from "@/data/mockFarms";

const random = createSeededRandom(7007);

const days = Array.from({ length: 30 }).map((_, index) => subDays(new Date(), 29 - index));

export const healthScoreTrend30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  score: Math.round(78 + index * 0.4 + randomFloat(random, -3, 3)),
}));

export const alertFrequency30d = days.map((day) => ({
  date: format(day, "dd MMM"),
  info: randomInt(random, 0, 3),
  warning: randomInt(random, 0, 4),
  high: randomInt(random, 0, 2),
  critical: randomInt(random, 0, 1),
}));

export const activityTemperature30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  activity: Math.round(55 + Math.sin(index / 3) * 12 + randomFloat(random, -5, 5)),
  temperature: Number((38.3 + Math.sin(index / 4) * 0.3 + randomFloat(random, -0.15, 0.15)).toFixed(1)),
}));

export const deviceConnectivity30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  online: Math.round(16 + Math.sin(index / 5) * 2 + randomFloat(random, -1, 1)),
  offline: Math.round(4 - Math.sin(index / 5) * 1.5 + randomFloat(random, -0.5, 1)),
}));

export const deviceUptimeTrend30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  uptime: Math.round(90 + Math.sin(index / 6) * 4 + randomFloat(random, -1.5, 1.5)),
}));

export const responseTimeTrend30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  minutes: Math.round(42 - index * 0.6 + randomFloat(random, -4, 4)),
}));

export const livestockHealthDistribution = [
  { name: "Healthy", value: livestock.filter((a) => a.healthStatus === "healthy").length, color: "#277A4D" },
  { name: "Needs Attention", value: livestock.filter((a) => a.healthStatus === "attention").length, color: "#D89B32" },
  { name: "Critical", value: livestock.filter((a) => a.healthStatus === "critical").length, color: "#C95B5B" },
  { name: "Inactive", value: livestock.filter((a) => a.healthStatus === "inactive").length, color: "#88948C" },
];

export const alertCategoryDistribution = [
  { category: "Health", count: alerts.filter((a) => a.category === "health").length },
  { category: "Behavior", count: alerts.filter((a) => a.category === "behavior").length },
  { category: "Location", count: alerts.filter((a) => a.category === "location").length },
  { category: "Device", count: alerts.filter((a) => a.category === "device").length },
  { category: "Environmental", count: alerts.filter((a) => a.category === "environmental").length },
  { category: "Weather", count: alerts.filter((a) => a.category === "weather").length },
];

export const alertSeverityDistribution = [
  { name: "Info", value: alerts.filter((a) => a.severity === "info").length, color: "#4A7FA7" },
  { name: "Warning", value: alerts.filter((a) => a.severity === "warning").length, color: "#D89B32" },
  { name: "High", value: alerts.filter((a) => a.severity === "high").length, color: "#C95B5B" },
  { name: "Critical", value: alerts.filter((a) => a.severity === "critical").length, color: "#7A2E2E" },
];

export const farmComparisonData = farms.map((farm) => ({
  name: farm.name.split(" ").slice(0, 2).join(" "),
  healthScore: farm.healthScore,
  activeAlerts: farm.activeAlerts,
  deviceCoverage: farm.deviceCoverage,
}));

export const barnComparisonData = barns.map((barn) => ({
  name: barn.name,
  healthScore: barn.healthScore,
  occupancy: Math.round((barn.occupancy / barn.capacity) * 100),
}));

export const batteryDistribution = [
  { name: "80-100%", value: randomInt(random, 6, 10), color: "#277A4D" },
  { name: "50-79%", value: randomInt(random, 4, 8), color: "#4D966D" },
  { name: "20-49%", value: randomInt(random, 2, 5), color: "#D89B32" },
  { name: "Below 20%", value: randomInt(random, 1, 3), color: "#C95B5B" },
];

export const deviceErrorCategory = [
  { category: "Signal Loss", count: randomInt(random, 4, 12) },
  { category: "Sensor Fault", count: randomInt(random, 2, 8) },
  { category: "Battery Drain", count: randomInt(random, 3, 9) },
  { category: "Sync Timeout", count: randomInt(random, 1, 6) },
];

export const environmentTrend30d = days.map((day, index) => ({
  date: format(day, "dd MMM"),
  temperature: Number((27 + Math.sin(index / 4) * 3 + randomFloat(random, -1, 1)).toFixed(1)),
  humidity: Math.round(64 + Math.cos(index / 5) * 6 + randomFloat(random, -2, 2)),
  ammonia: Number((8 + Math.sin(index / 6) * 2 + randomFloat(random, -0.6, 0.6)).toFixed(1)),
  heatStressIndex: Math.round(45 + Math.sin(index / 3) * 10 + randomFloat(random, -3, 3)),
}));

export const insightCategoryDistribution = [
  { name: "Health", value: 4, color: "#277A4D" },
  { name: "Behavior", value: 2, color: "#4D966D" },
  { name: "Environment", value: 1, color: "#4A7FA7" },
  { name: "Productivity", value: 2, color: "#D89B32" },
  { name: "Devices", value: 1, color: "#75AF8B" },
];

export const insightPriorityDistribution = [
  { name: "High", value: 4, color: "#C95B5B" },
  { name: "Medium", value: 4, color: "#D89B32" },
  { name: "Low", value: 2, color: "#4D966D" },
];

export const taskCompletionTrend = days.slice(-14).map((day, index) => ({
  date: format(day, "dd MMM"),
  completed: randomInt(random, 3, 10),
  pending: randomInt(random, 1, 5) + Math.round(Math.max(0, 4 - index / 4)),
}));

export const staffWorkload = [
  { name: "Budi S.", tasks: randomInt(random, 6, 18), alerts: randomInt(random, 2, 9), resolutionRate: randomInt(random, 78, 97) },
  { name: "Reza A.", tasks: randomInt(random, 6, 18), alerts: randomInt(random, 2, 9), resolutionRate: randomInt(random, 78, 97) },
  { name: "Andi W.", tasks: randomInt(random, 6, 18), alerts: randomInt(random, 2, 9), resolutionRate: randomInt(random, 78, 97) },
  { name: "Clarissa H.", tasks: randomInt(random, 6, 18), alerts: randomInt(random, 2, 9), resolutionRate: randomInt(random, 78, 97) },
];

export const healthScoreByGroup = [
  { name: "Herd 1", score: randomInt(random, 74, 92) },
  { name: "Herd 2", score: randomInt(random, 74, 92) },
  { name: "Herd 3", score: randomInt(random, 74, 92) },
];

export const temperatureActivityCorrelation = livestock.slice(0, 30).map((animal) => ({
  temperature: animal.temperature,
  activity: animal.activityLevel,
  status: animal.healthStatus,
}));

export const batteryTrend14d = days.slice(-14).map((day, index) => ({
  date: format(day, "dd MMM"),
  battery: Math.round(88 - index * 1.4 + randomFloat(random, -3, 3)),
}));

export const signalStrengthTrend14d = days.slice(-14).map((day, index) => ({
  date: format(day, "dd MMM"),
  signal: Math.round(80 + Math.sin(index / 3) * 10 + randomFloat(random, -4, 4)),
}));

export const dataTransmissionTrend14d = days.slice(-14).map((day) => ({
  date: format(day, "dd MMM"),
  packets: randomInt(random, 320, 900),
}));
