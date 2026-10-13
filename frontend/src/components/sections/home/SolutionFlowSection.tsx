import { Radio, Antenna, Cloud, BrainCircuit, Monitor, Users } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const flowSteps = [
  { icon: Radio, key: "earTag" },
  { icon: Antenna, key: "gateway" },
  { icon: Cloud, key: "cloud" },
  { icon: BrainCircuit, key: "ai" },
  { icon: Monitor, key: "dashboard" },
  { icon: Users, key: "action" },
];

export default function SolutionFlowSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("home.flow.badge")} title={t("home.flow.title")} description={t("home.flow.description")} />

        <div className="relative mt-14">
          {/* Connector line behind the step icons on wide screens. */}
          <div
            className="absolute left-[8.33%] right-[8.33%] top-7 hidden h-0.5 bg-gradient-to-r from-terrava-primary/10 via-terrava-primary/40 to-terrava-primary/10 xl:block"
            aria-hidden="true"
          />
          <StaggerGroup className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-6" stagger={0.08}>
            {flowSteps.map((step, index) => (
              <StaggerItem
                key={step.key}
                className="flex items-start gap-4 rounded-2xl border border-terrava-border bg-terrava-bg p-5 xl:flex-col xl:items-center xl:border-0 xl:bg-transparent xl:p-0 xl:text-center"
              >
                <div className="relative shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terrava-primary text-white shadow-glow xl:ring-8 xl:ring-terrava-surface">
                    <step.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-terrava-border bg-white text-[11px] font-bold text-terrava-primary shadow-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="xl:mt-5">
                  <h3 className="text-[15px] font-bold text-terrava-text">{t(`home.flow.step.${step.key}.title`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-terrava-muted">{t(`home.flow.step.${step.key}.desc`)}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
