import { Cloud, GraduationCap, Handshake, Landmark, Users, Sprout } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const partners = [
  { icon: Cloud, label: "Microsoft Azure" },
  { icon: GraduationCap, label: "BINUS University" },
  { icon: Handshake, label: "Livestock Cooperatives" },
  { icon: Landmark, label: "Government Partners" },
  { icon: Users, label: "Livestock Communities" },
  { icon: Sprout, label: "Agritech Ecosystem" },
];

export default function TrustedBySection() {
  const { t } = useLanguage();
  const track = [...partners, ...partners];

  return (
    <section className="border-y border-terrava-border bg-white py-10">
      <div className="container">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wide text-terrava-muted">
          {t("home.trusted.title")}
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused]" aria-label={t("home.trusted.ariaLabel")}>
            {track.map((partner, index) => (
              <li
                key={`${partner.label}-${index}`}
                aria-hidden={index >= partners.length}
                className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-terrava-muted/70 transition-colors hover:text-terrava-primary"
              >
                <partner.icon className="h-5 w-5" aria-hidden="true" />
                {partner.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
