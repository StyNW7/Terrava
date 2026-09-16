import { Database, LayoutGrid, Search, BrainCircuit, Lightbulb, Users } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { StaggerGrid } from "@/components/motion/Stagger";

const aiSteps = [
  { icon: Database, label: "Collect Data" },
  { icon: LayoutGrid, label: "Build Baseline" },
  { icon: Search, label: "Detect Anomalies" },
  { icon: BrainCircuit, label: "Analyze Patterns" },
  { icon: Lightbulb, label: "Generate Recommendations" },
  { icon: Users, label: "Support Human Decision" },
];

export default function AIIntelligenceSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="AI Intelligence"
          title="Bagaimana AI Terrava bekerja"
          description="Model AI Terrava belajar dari data historis setiap ternak untuk memberikan insight yang relevan dan dapat ditindaklanjuti."
        />

        <StaggerGrid className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {aiSteps.map((step, index) => (
            <div key={step.label} className="rounded-2xl border border-terrava-border bg-terrava-bg p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-primary text-white">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-terrava-text">
                {index + 1}. {step.label}
              </p>
            </div>
          ))}
        </StaggerGrid>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-terrava-border bg-terrava-light px-6 py-5 text-center text-sm text-terrava-dark">
          AI Terrava membantu proses pengambilan keputusan dan tidak menggantikan diagnosis profesional
          dokter hewan.
        </div>
      </div>
    </section>
  );
}
