import { Landmark, Route, HeartPulse, Baby, Wheat, Leaf, Handshake } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";

const visionPoints = [
  { icon: Landmark, label: "National livestock intelligence platform" },
  { icon: Route, label: "Traceability" },
  { icon: HeartPulse, label: "Predictive health" },
  { icon: Baby, label: "Reproduction analytics" },
  { icon: Wheat, label: "Feed optimization" },
  { icon: Leaf, label: "Carbon and sustainability monitoring" },
  { icon: Handshake, label: "Government and cooperative integration" },
];

export default function LongTermVisionSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Long-Term Vision"
          title="Ke arah mana Terrava berkembang"
          description="Peta jalan pengembangan Terrava menuju platform intelijen peternakan yang lebih luas."
        />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visionPoints.map((point) => (
            <div key={point.label} className="rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card">
              <point.icon className="mx-auto mb-3 h-6 w-6 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{point.label}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
