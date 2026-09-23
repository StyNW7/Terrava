import { Radio, Antenna, Cloud, BrainCircuit, Monitor, Users, ChevronRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const flowSteps = [
  { icon: Radio, label: "Smart Ear Tag" },
  { icon: Antenna, label: "LoRa Gateway" },
  { icon: Cloud, label: "Cloud Infrastructure" },
  { icon: BrainCircuit, label: "AI Analysis" },
  { icon: Monitor, label: "Dashboard and Alert" },
  { icon: Users, label: "Farmer Action" },
];

export default function SolutionFlowSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading title={t("home.flow.title")} />

        <div className="mt-14 flex flex-col items-stretch gap-4 overflow-x-auto lg:flex-row lg:items-center lg:justify-between lg:gap-2">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2 lg:flex-1">
              <div className="flex w-full flex-col items-center rounded-2xl border border-terrava-border bg-terrava-bg px-4 py-6 text-center lg:w-auto">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-primary text-white">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-terrava-text">{step.label}</p>
              </div>
              {index < flowSteps.length - 1 && (
                <ChevronRight className="hidden h-5 w-5 shrink-0 text-terrava-muted lg:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
