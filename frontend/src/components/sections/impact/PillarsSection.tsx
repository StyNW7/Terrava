import SectionHeading from "@/components/common/SectionHeading";
import ImpactCard from "@/components/cards/ImpactCard";
import { impactPillars } from "@/data/impact";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function PillarsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("impact.pillars.badge")} title={t("impact.pillars.title")} />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactPillars.map((pillar) => (
            <ImpactCard key={pillar.id} pillar={pillar} />
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
