import { BellRing, FileText, Radio, Building2, Stethoscope } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";

export default function LivestockTimelineTab({ animal }: { animal: Livestock }) {
  const items = [
    { id: "1", icon: BellRing, label: "New alert detected", timestamp: "2 jam lalu" },
    { id: "2", icon: FileText, label: "Health record added", timestamp: "1 hari lalu" },
    { id: "3", icon: Radio, label: "Device assigned", timestamp: "3 hari lalu" },
    { id: "4", icon: Building2, label: `Moved to ${animal.herdGroup}`, timestamp: "1 minggu lalu" },
    { id: "5", icon: Stethoscope, label: "Examination completed", timestamp: "2 minggu lalu" },
  ];

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <Timeline items={items} />
    </div>
  );
}
