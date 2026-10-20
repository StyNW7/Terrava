import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const scenario = ["step1", "step2", "step3", "step4", "step5", "step6", "step7"];

export default function FarmerJourneySection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("howitworks.journeyScenario.badge")}
          title={t("howitworks.journeyScenario.title")}
          description={t("howitworks.journeyScenario.description")}
        />

        <div className="mx-auto mt-14 max-w-2xl">
          <ol className="space-y-4">
            {scenario.map((step, index) => (
              <li key={step} className="card-hover group flex items-start gap-3 rounded-2xl border border-terrava-border bg-white p-4 shadow-card">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terrava-light text-xs font-bold text-terrava-primary">
                  {index + 1}
                </span>
                <p className="text-sm text-terrava-text">{t("howitworks.journeyScenario." + step)}</p>
                <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
