import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import SolutionCard from "@/components/cards/SolutionCard";
import AIIntelligenceSection from "@/components/sections/solutions/AIIntelligenceSection";
import EcosystemDiagramSection from "@/components/sections/solutions/EcosystemDiagramSection";
import ComparisonTableSection from "@/components/sections/solutions/ComparisonTableSection";
import CTASection from "@/components/sections/CTASection";
import { solutions } from "@/data/solutions";
import { useLanguage } from "@/hooks/useLanguage";

export default function SolutionsPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Solutions | Terrava Smart Livestock Ecosystem";
  }, []);

  return (
    <>
      <PageHero
        badge={t("solutions.hero.badge")}
        title={t("solutions.hero.title")}
      />

      <section className="py-20 sm:py-28">
        <div className="container flex flex-col gap-20 sm:gap-24">
          {solutions.map((solution, index) => (
            <SolutionCard key={solution.id} solution={solution} reverse={index % 2 === 1} />
          ))}
        </div>
      </section>

      <AIIntelligenceSection />
      <EcosystemDiagramSection />
      <ComparisonTableSection />

      <CTASection
        title={t("solutions.cta.title")}
        description={t("solutions.cta.description")}
        primaryLabel={t("cta.requestDemo")}
        primaryHref="/contact"
        secondaryLabel={t("cta.seeHowItWorks")}
        secondaryHref="/how-it-works"
      />
    </>
  );
}
