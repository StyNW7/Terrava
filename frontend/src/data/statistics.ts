import { Clock, BatteryCharging, Radio, Building2, BellRing, Database } from "lucide-react";
import type { StatisticItem } from "@/types";

export const impactStatistics: StatisticItem[] = [
  {
    id: "monitoring",
    icon: Clock,
    value: "24",
    suffix: "/7",
    label: "Livestock Monitoring",
    qualifier: "Designed for",
  },
  {
    id: "battery",
    icon: BatteryCharging,
    value: "60-80",
    suffix: " hari",
    label: "Battery life tanpa solar support",
    qualifier: "Target capability",
  },
  {
    id: "connectivity",
    icon: Radio,
    value: "Long-Range",
    label: "LoRa connectivity untuk area luas",
    qualifier: "Built to support",
  },
  {
    id: "multi-farm",
    icon: Building2,
    value: "Multi",
    label: "Farm support dalam satu platform",
    qualifier: "Designed for",
  },
  {
    id: "alerts",
    icon: BellRing,
    value: "Real-Time",
    label: "Anomaly alerts ke peternak",
    qualifier: "Built to support",
  },
  {
    id: "records",
    icon: Database,
    value: "Centralized",
    label: "Health records seluruh ternak",
    qualifier: "Target capability",
  },
];
