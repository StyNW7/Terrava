import SectionHeading from "@/components/common/SectionHeading";
import { targetPersonas } from "@/data/roles";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function TargetUsersSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("home.users.badge")}
          title={t("home.users.title")}
          description={t("home.users.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {targetPersonas.map((persona) => (
            <div
              key={persona.id}
              className="overflow-hidden rounded-2xl border border-terrava-border bg-terrava-bg shadow-card"
            >
              <img
                src={persona.image}
                alt={persona.title}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary">
                  <persona.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-terrava-text">{persona.title}</h3>
                <p className="text-xs leading-relaxed text-terrava-muted">{tr(persona.description)}</p>
              </div>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
