import { Clock, BatteryCharging, Radio, Building2, BellRing, Database } from "lucide-react";
import type { StatisticItem } from "@/types";

export const impactStatistics: StatisticItem[] = [
  {
    id: "monitoring",
    icon: Clock,
    value: "24",
    suffix: { id: "/7", en: "/7" },
    label: { id: "Monitoring ternak", en: "Livestock monitoring" },
    qualifier: { id: "Dirancang untuk", en: "Designed for" },
  },
  {
    id: "battery",
    icon: BatteryCharging,
    value: "60-80",
    suffix: { id: " hari", en: " days" },
    label: {
      id: "Daya tahan baterai tanpa bantuan surya",
      en: "Battery life without solar support",
    },
    qualifier: { id: "Target kapabilitas", en: "Target capability" },
  },
  {
    id: "connectivity",
    icon: Radio,
    value: "Long-Range",
    label: {
      id: "Konektivitas LoRa untuk area luas",
      en: "LoRa connectivity for wide areas",
    },
    qualifier: { id: "Mendukung", en: "Built to support" },
  },
  {
    id: "multi-farm",
    icon: Building2,
    value: "Multi",
    label: {
      id: "Peternakan dikelola dalam satu platform",
      en: "Farms managed on a single platform",
    },
    qualifier: { id: "Dirancang untuk", en: "Designed for" },
  },
  {
    id: "alerts",
    icon: BellRing,
    value: "Real-Time",
    label: {
      id: "Alert anomali langsung ke peternak",
      en: "Anomaly alerts delivered to farmers",
    },
    qualifier: { id: "Mendukung", en: "Built to support" },
  },
  {
    id: "records",
    icon: Database,
    value: "Centralized",
    label: {
      id: "Rekam kesehatan seluruh ternak",
      en: "Health records for the whole herd",
    },
    qualifier: { id: "Target kapabilitas", en: "Target capability" },
  },
];
