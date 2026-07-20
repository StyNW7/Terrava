import SectionHeading from "@/components/common/SectionHeading";
import { missionCards } from "@/data/values";

export default function VisionMissionSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Vision"
          title="Menjadi fondasi digital bagi peternakan yang sehat, produktif, dan berkelanjutan."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {missionCards.map((mission) => (
            <div key={mission.id} className="rounded-2xl border border-terrava-border bg-terrava-bg p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-primary text-white">
                <mission.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{mission.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{mission.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
