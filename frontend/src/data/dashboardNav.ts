import {
  LayoutDashboard,
  PawPrint,
  PlusCircle,
  Activity,
  BellRing,
  BrainCircuit,
  MapPinned,
  Building2,
  Cpu,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  /** Dictionary key resolved with `t()` at render time. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardNavGroup {
  labelKey: string;
  items: DashboardNavItem[];
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    labelKey: "nav.group.overview",
    items: [{ labelKey: "nav.item.dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "nav.group.livestock",
    items: [
      { labelKey: "nav.item.livestock", href: "/dashboard/livestock", icon: PawPrint },
      { labelKey: "nav.item.addLivestock", href: "/dashboard/livestock/add", icon: PlusCircle },
      { labelKey: "nav.item.monitoring", href: "/dashboard/monitoring", icon: Activity },
      { labelKey: "nav.item.alerts", href: "/dashboard/alerts", icon: BellRing },
      { labelKey: "nav.item.aiInsights", href: "/dashboard/ai-insights", icon: BrainCircuit },
    ],
  },
  {
    labelKey: "nav.group.farmOperations",
    items: [
      { labelKey: "nav.item.farmMap", href: "/dashboard/map", icon: MapPinned },
      { labelKey: "nav.item.farms", href: "/dashboard/farms", icon: Building2 },
    ],
  },
  {
    labelKey: "nav.group.iot",
    items: [{ labelKey: "nav.item.devices", href: "/dashboard/devices", icon: Cpu }],
  },
  {
    labelKey: "nav.group.organization",
    items: [{ labelKey: "nav.item.team", href: "/dashboard/team", icon: Users }],
  },
  {
    labelKey: "nav.group.intelligence",
    items: [{ labelKey: "nav.item.reports", href: "/dashboard/reports", icon: BarChart3 }],
  },
  {
    labelKey: "nav.group.system",
    items: [{ labelKey: "nav.item.settings", href: "/dashboard/settings", icon: Settings }],
  },
];

/** URL segment to dictionary key, used by the breadcrumb. */
export const breadcrumbLabelKeys: Record<string, string> = {
  dashboard: "nav.item.dashboard",
  livestock: "nav.item.livestock",
  add: "nav.item.addLivestock",
  monitoring: "nav.item.monitoring",
  alerts: "nav.item.alerts",
  "ai-insights": "nav.item.aiInsights",
  map: "nav.item.farmMap",
  farms: "nav.item.farms",
  devices: "nav.item.devices",
  team: "nav.item.team",
  reports: "nav.item.reports",
  settings: "nav.item.settings",
};
