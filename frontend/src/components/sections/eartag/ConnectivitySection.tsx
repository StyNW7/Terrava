import { Radio, BatteryLow, Map, Antenna, Home } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const reasons = [
  { icon: Map, key: "longRange" },
  { icon: BatteryLow, key: "lowEnergy" },
  { icon: Antenna, key: "wideFarms" },
  { icon: Radio, key: "gateway" },
  { icon: Home, key: "rural" },
];

export default function ConnectivitySection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("eartag.connectivity.badge")}
          title={t("eartag.connectivity.title")}
          description={t("eartag.connectivity.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason) => (
            <div
              key={reason.key}
              className="card-hover group flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card"
            >
              <reason.icon className="mb-3 h-6 w-6 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{t("eartag.connectivity.reason." + reason.key)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
