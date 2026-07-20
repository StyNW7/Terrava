import { Activity, Database, Clock, Antenna, Cloud, BrainCircuit, Monitor } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const steps = [
  { icon: Activity, label: "Sensor Reading" },
  { icon: Database, label: "Local Storage" },
  { icon: Clock, label: "Scheduled Transmission" },
  { icon: Antenna, label: "LoRa Gateway" },
  { icon: Cloud, label: "Cloud" },
  { icon: BrainCircuit, label: "AI Analysis" },
  { icon: Monitor, label: "Farmer Dashboard" },
];

export default function DataFlowSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="Data Flow" title="Bagaimana data mengalir dari perangkat ke dashboard" />

        <div className="mt-14 flex flex-col gap-4 overflow-x-auto lg:flex-row lg:items-center lg:justify-between">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex w-full flex-col items-center rounded-2xl border border-terrava-border bg-white px-4 py-6 text-center shadow-card lg:w-32">
                <step.icon className="mb-2 h-6 w-6 text-terrava-primary" aria-hidden="true" />
                <p className="text-xs font-semibold text-terrava-text">{step.label}</p>
              </div>
              {index < steps.length - 1 && (
                <span className="hidden text-terrava-muted lg:block" aria-hidden="true">
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
