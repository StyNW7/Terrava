import { HeartPulse, Radio, Antenna, Cloud, BrainCircuit, Monitor, Users } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const nodes = [
  { icon: HeartPulse, key: "livestock" },
  { icon: Radio, key: "earTag" },
  { icon: Antenna, key: "gateway" },
  { icon: Cloud, key: "cloud" },
  { icon: BrainCircuit, key: "aiEngine" },
  { icon: Monitor, key: "dashboard" },
  { icon: Users, key: "people" },
];

export default function EcosystemDiagramSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("solutions.ecosystem.badge")}
          title={t("solutions.ecosystem.title")}
        />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {nodes.map((node, index) => (
            <div key={node.key} className="flex items-center gap-3">
              <div className="flex w-32 flex-col items-center rounded-2xl border border-terrava-border bg-white px-3 py-5 text-center shadow-card sm:w-36">
                <node.icon className="mb-2 h-6 w-6 text-terrava-primary" aria-hidden="true" />
                <p className="text-xs font-semibold text-terrava-text">{t("solutions.ecosystem.node." + node.key)}</p>
              </div>
              {index < nodes.length - 1 && (
                <span className="hidden text-terrava-muted sm:block" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
