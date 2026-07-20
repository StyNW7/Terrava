import { Linkedin } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { teamMembers } from "@/data/team";

export default function TeamSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="Our Team" title="Tim di balik Terrava" />

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="mx-auto mb-4 h-28 w-28 rounded-2xl object-cover sm:h-32 sm:w-32"
              />
              <h3 className="text-sm font-semibold text-terrava-text">{member.name}</h3>
              <p className="mb-2 text-xs text-terrava-muted">{member.role}</p>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  aria-label={`LinkedIn ${member.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary transition-colors hover:bg-terrava-primary hover:text-white"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
