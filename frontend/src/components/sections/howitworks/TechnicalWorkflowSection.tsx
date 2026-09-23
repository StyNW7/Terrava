import { Cpu, Radio, Antenna, Server, Database, BrainCircuit, Monitor } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const nodes = [
  { icon: Cpu, label: "IoT Device" },
  { icon: Radio, label: "LoRa Communication" },
  { icon: Antenna, label: "Gateway" },
  { icon: Server, label: "Cloud API" },
  { icon: Database, label: "Database" },
  { icon: BrainCircuit, label: "AI Service" },
  { icon: Monitor, label: "Web and Mobile Dashboard" },
];

export default function TechnicalWorkflowSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("howitworks.technical.badge")} title={t("howitworks.technical.title")} />

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex items-center gap-3">
              <div className="flex w-32 flex-col items-center rounded-2xl border border-terrava-border bg-terrava-bg px-3 py-5 text-center sm:w-36">
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
