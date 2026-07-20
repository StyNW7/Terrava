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
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Livestock",
    items: [
      { label: "Livestock", href: "/dashboard/livestock", icon: PawPrint },
      { label: "Add Livestock", href: "/dashboard/livestock/add", icon: PlusCircle },
      { label: "Monitoring", href: "/dashboard/monitoring", icon: Activity },
      { label: "Alerts", href: "/dashboard/alerts", icon: BellRing },
      { label: "AI Insights", href: "/dashboard/ai-insights", icon: BrainCircuit },
    ],
  },
  {
    label: "Farm Operations",
    items: [
      { label: "Farm Map", href: "/dashboard/map", icon: MapPinned },
      { label: "Farms and Barns", href: "/dashboard/farms", icon: Building2 },
    ],
  },
  {
    label: "IoT Management",
    items: [{ label: "Devices", href: "/dashboard/devices", icon: Cpu }],
  },
  {
    label: "Organization",
    items: [{ label: "Team and Staff", href: "/dashboard/team", icon: Users }],
  },
  {
    label: "Intelligence",
    items: [{ label: "Reports and Analytics", href: "/dashboard/reports", icon: BarChart3 }],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  livestock: "Livestock",
  add: "Add Livestock",
  monitoring: "Monitoring",
  alerts: "Alerts",
  "ai-insights": "AI Insights",
  map: "Farm Map",
  farms: "Farms and Barns",
  devices: "Devices",
  team: "Team and Staff",
  reports: "Reports and Analytics",
  settings: "Settings",
};
