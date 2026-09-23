import { BellRing, Cpu, MapPinned, Stethoscope, UserRound } from "lucide-react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useLanguage } from "@/hooks/useLanguage";

const activity = [
  { id: "1", icon: BellRing, key: "newAlert", timestamp: "12 minutes ago" },
  { id: "2", icon: Stethoscope, key: "checkupDone", timestamp: "45 minutes ago", actor: "drh. Andi Wirawan" },
  { id: "3", icon: Cpu, key: "deviceOnline", timestamp: "1 hours ago" },
  { id: "4", icon: MapPinned, key: "geofenceExit", timestamp: "2 hours ago" },
  { id: "5", icon: UserRound, key: "tasksCompleted", timestamp: "3 hours ago" },
];

export default function OverviewActivityPanel() {
  const { t, tRel } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("overview.recentActivity")}</h3>
      <ActivityFeed
        items={activity.map((item) => ({
          ...item,
          title: t("overview.activity." + item.key),
          timestamp: tRel(item.timestamp),
        }))}
      />
    </div>
  );
}
