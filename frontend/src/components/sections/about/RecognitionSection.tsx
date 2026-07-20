import { Award } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { recognitionTimeline } from "@/data/timeline";

export default function RecognitionSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge="Recognition" title="Pencapaian dan langkah kolaborasi kami" />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {recognitionTimeline.map((item) => (
            <div key={item.id} className="rounded-2xl border border-terrava-border bg-terrava-bg p-6">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-terrava-primary" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide text-terrava-primary">
                  {item.year}
                </span>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{item.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
