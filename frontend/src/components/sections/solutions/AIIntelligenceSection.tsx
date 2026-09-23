import { Database, LayoutGrid, Search, BrainCircuit, Lightbulb, Users } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const aiSteps = [
  { icon: Database, key: "collect" },
  { icon: LayoutGrid, key: "baseline" },
  { icon: Search, key: "detect" },
  { icon: BrainCircuit, key: "analyze" },
  { icon: Lightbulb, key: "recommend" },
  { icon: Users, key: "support" },
];

export default function AIIntelligenceSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("solutions.ai.badge")}
          title={t("solutions.ai.title")}
          description={t("solutions.ai.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {aiSteps.map((step, index) => (
            <div key={step.key} className="rounded-2xl border border-terrava-border bg-terrava-bg p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-primary text-white">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-terrava-text">
                {index + 1}. {t("solutions.ai.step." + step.key)}
              </p>
            </div>
          ))}
        </StaggerGrid>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-terrava-border bg-terrava-light px-6 py-5 text-center text-sm text-terrava-dark">
          {t("solutions.ai.disclaimer")}
        </div>
      </div>
    </section>
  );
}
