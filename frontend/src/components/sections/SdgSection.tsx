import SectionHeading from "@/components/common/SectionHeading";
import { sdgItems } from "@/data/sdgs";
import { StaggerGrid } from "@/components/motion/Stagger";

interface SdgSectionProps {
  title?: string;
  description?: string;
}

export default function SdgSection({
  title = "Kontribusi terhadap Sustainable Development Goals",
  description,
}: SdgSectionProps) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="SDG Contribution" title={title} description={description} />

        <StaggerGrid className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {sdgItems.map((sdg) => (
            <div
              key={sdg.id}
              className="rounded-2xl border border-terrava-border bg-terrava-bg p-5"
              style={{ borderTopWidth: 3, borderTopColor: sdg.color }}
            >
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: sdg.color }}>
                SDG {sdg.number}
              </span>
              <h3 className="mt-2 mb-1.5 text-sm font-semibold text-terrava-text">{sdg.title}</h3>
              <p className="text-xs leading-relaxed text-terrava-muted">{sdg.description}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
