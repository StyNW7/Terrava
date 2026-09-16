import SectionHeading from "@/components/common/SectionHeading";
import ImpactCard from "@/components/cards/ImpactCard";
import { impactPillars } from "@/data/impact";
import { StaggerGrid } from "@/components/motion/Stagger";

export default function PillarsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="Impact Pillars" title="Empat pilar dampak Terrava" />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactPillars.map((pillar) => (
            <ImpactCard key={pillar.id} pillar={pillar} />
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
