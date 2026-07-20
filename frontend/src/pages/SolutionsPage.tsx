import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import SolutionCard from "@/components/cards/SolutionCard";
import AIIntelligenceSection from "@/components/sections/solutions/AIIntelligenceSection";
import EcosystemDiagramSection from "@/components/sections/solutions/EcosystemDiagramSection";
import ComparisonTableSection from "@/components/sections/solutions/ComparisonTableSection";
import CTASection from "@/components/sections/CTASection";
import { solutions } from "@/data/solutions";

export default function SolutionsPage() {
  useEffect(() => {
    document.title = "Solutions | Terrava Smart Livestock Ecosystem";
  }, []);

  return (
    <>
      <PageHero
        badge="Solutions"
        title="Satu ekosistem untuk kesehatan, produktivitas, dan operasional peternakan."
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
        title="Find the Right Solution for Your Farm"
        description="Konsultasikan kebutuhan peternakan Anda dengan tim Terrava."
        primaryLabel="Request Demo"
        primaryHref="/contact"
        secondaryLabel="See How It Works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
