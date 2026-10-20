import { Landmark, Route, HeartPulse, Baby, Wheat, Leaf, Handshake } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

const visionPoints = [
  { icon: Landmark, key: "nationalPlatform" },
  { icon: Route, key: "traceability" },
  { icon: HeartPulse, key: "predictiveHealth" },
  { icon: Baby, key: "reproduction" },
  { icon: Wheat, key: "feedOptimization" },
  { icon: Leaf, key: "carbon" },
  { icon: Handshake, key: "integration" },
];

export default function LongTermVisionSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("impact.vision.badge")}
          title={t("impact.vision.title")}
          description={t("impact.vision.description")}
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visionPoints.map((point) => (
            <div key={point.key} className="card-hover group rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card">
              <point.icon className="mx-auto mb-3 h-6 w-6 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{t("impact.vision.point." + point.key)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
