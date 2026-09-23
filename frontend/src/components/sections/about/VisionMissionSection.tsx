import SectionHeading from "@/components/common/SectionHeading";
import { missionCards } from "@/data/values";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function VisionMissionSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("about.vision.badge")}
          title={t("about.vision.title")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {missionCards.map((mission) => (
            <div key={mission.id} className="rounded-2xl border border-terrava-border bg-terrava-bg p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-primary text-white">
                <mission.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{mission.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{tr(mission.description)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
