import { Clock, BatteryCharging, Radio, Building2, BellRing, Database } from "lucide-react";
import type { StatisticItem } from "@/types";

export const impactStatistics: StatisticItem[] = [
  {
    id: "monitoring",
    icon: Clock,
    value: "24",
    suffix: { id: "/7", en: "/7" },
    label: { id: "Livestock Monitoring", en: "Livestock monitoring" },
    qualifier: { id: "Designed for", en: "Designed for" },
  },
  {
    id: "battery",
    icon: BatteryCharging,
    value: "60-80",
    suffix: { id: " hari", en: " days" },
    label: {
      id: "Battery life tanpa solar support",
      en: "Battery life without solar support",
    },
    qualifier: { id: "Target capability", en: "Target capability" },
  },
  {
    id: "connectivity",
    icon: Radio,
    value: "Long-Range",
    label: {
      id: "LoRa connectivity untuk area luas",
      en: "LoRa connectivity for wide areas",
    },
    qualifier: { id: "Built to support", en: "Built to support" },
  },
  {
    id: "multi-farm",
    icon: Building2,
    value: "Multi",
    label: {
      id: "Farm support dalam satu platform",
      en: "Farm support on a single platform",
    },
    qualifier: { id: "Designed for", en: "Designed for" },
  },
  {
    id: "alerts",
    icon: BellRing,
    value: "Real-Time",
    label: {
      id: "Anomaly alerts ke peternak",
      en: "Anomaly alerts delivered to farmers",
    },
    qualifier: { id: "Built to support", en: "Built to support" },
  },
  {
    id: "records",
    icon: Database,
    value: "Centralized",
    label: {
      id: "Health records seluruh ternak",
      en: "Health records for the whole herd",
    },
    qualifier: { id: "Target capability", en: "Target capability" },
  },
];
