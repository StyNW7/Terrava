import { BellRing, FileText, Radio, Building2, Stethoscope } from "lucide-react";
import type { Livestock } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";
import { useLanguage } from "@/hooks/useLanguage";

export default function LivestockTimelineTab({ animal }: { animal: Livestock }) {
  const { t, tRel } = useLanguage();

  const items = [
    { id: "1", icon: BellRing, label: t("timeline.newAlert"), timestamp: tRel("2 hours ago") },
    { id: "2", icon: FileText, label: t("timeline.recordAdded"), timestamp: tRel("1 days ago") },
    { id: "3", icon: Radio, label: t("timeline.deviceAssigned"), timestamp: tRel("3 days ago") },
    { id: "4", icon: Building2, label: t("timeline.movedTo", { group: animal.herdGroup }), timestamp: tRel("1 weeks ago") },
    { id: "5", icon: Stethoscope, label: t("timeline.examinationCompleted"), timestamp: tRel("2 weeks ago") },
  ];

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <Timeline items={items} />
    </div>
  );
}
