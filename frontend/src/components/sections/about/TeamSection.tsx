import { Linkedin } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { teamMembers } from "@/data/team";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function TeamSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("about.team.badge")} title={t("about.team.title")} />

        <StaggerGrid className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="mx-auto mb-4 h-32 w-32 rounded-2xl object-cover sm:h-36 sm:w-36"
              />
              <h3 className="text-sm font-semibold text-terrava-text">{member.name}</h3>
              <p className="mb-2 text-xs text-terrava-muted">{member.role}</p>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn ${member.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary transition-colors hover:bg-terrava-primary hover:text-white"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
