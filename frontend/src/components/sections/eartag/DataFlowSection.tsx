import { Activity, Database, Clock, Antenna, Cloud, BrainCircuit, Monitor } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const steps = [
  { icon: Activity, key: "sensorReading" },
  { icon: Database, key: "localStorage" },
  { icon: Clock, key: "scheduledTransmission" },
  { icon: Antenna, key: "loraGateway" },
  { icon: Cloud, key: "cloud" },
  { icon: BrainCircuit, key: "aiAnalysis" },
  { icon: Monitor, key: "farmerDashboard" },
];

export default function DataFlowSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.dataFlow.badge")} title={t("eartag.dataFlow.title")} />

        <div className="mt-14 flex flex-col gap-4 overflow-x-auto lg:flex-row lg:items-center lg:justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className="flex w-full flex-col items-center rounded-2xl border border-terrava-border bg-white px-4 py-6 text-center shadow-card lg:w-32">
                <step.icon className="mb-2 h-6 w-6 text-terrava-primary" aria-hidden="true" />
                <p className="text-xs font-semibold text-terrava-text">{t("eartag.dataFlow.step." + step.key)}</p>
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
