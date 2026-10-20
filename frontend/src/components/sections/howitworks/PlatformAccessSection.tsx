import { Monitor, Smartphone, Tablet, BellRing } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const channels = [
  { icon: Monitor, key: "desktop" },
  { icon: Tablet, key: "tablet" },
  { icon: Smartphone, key: "mobile" },
  { icon: BellRing, key: "notifications" },
];

export default function PlatformAccessSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("howitworks.access.badge")}
          title={t("howitworks.access.title")}
          description={t("howitworks.access.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {channels.map((channel) => (
            <div key={channel.key} className="card-hover group flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card">
              <channel.icon className="mb-3 h-7 w-7 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{t("howitworks.access.channel." + channel.key)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
