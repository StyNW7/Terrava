import { HeartPulse, Radio, Building2, Users, BellRing } from "lucide-react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useLanguage } from "@/hooks/useLanguage";

const activity = [
  { id: "1", icon: BellRing, key: "newAlert", timestamp: "1 hours ago" },
  { id: "2", icon: HeartPulse, key: "checkupDone", timestamp: "5 hours ago" },
  { id: "3", icon: Radio, key: "devicePaired", timestamp: "1 days ago" },
  { id: "4", icon: Building2, key: "barnAdded", timestamp: "4 days ago" },
  { id: "5", icon: Users, key: "memberJoined", timestamp: "1 weeks ago" },
];

export default function FarmActivityTab() {
  const { t, tRel } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <ActivityFeed
        items={activity.map((item) => ({
          ...item,
          title: t("farms.activity." + item.key),
          timestamp: tRel(item.timestamp),
        }))}
      />
    </div>
  );
}
