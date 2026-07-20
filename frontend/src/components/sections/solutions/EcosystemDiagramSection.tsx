import { HeartPulse, Radio, Antenna, Cloud, BrainCircuit, Monitor, Users } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const nodes = [
  { icon: HeartPulse, label: "Livestock" },
  { icon: Radio, label: "Smart Ear Tag" },
  { icon: Antenna, label: "Gateway" },
  { icon: Cloud, label: "Cloud" },
  { icon: BrainCircuit, label: "AI Engine" },
  { icon: Monitor, label: "Dashboard" },
  { icon: Users, label: "Farmer, Manager, Vet" },
];

export default function EcosystemDiagramSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Platform Ecosystem"
          title="Satu alur data yang menghubungkan seluruh ekosistem"
        />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex items-center gap-3">
              <div className="flex w-32 flex-col items-center rounded-2xl border border-terrava-border bg-white px-3 py-5 text-center shadow-card sm:w-36">
                <node.icon className="mb-2 h-6 w-6 text-terrava-primary" aria-hidden="true" />
                <p className="text-xs font-semibold text-terrava-text">{node.label}</p>
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
