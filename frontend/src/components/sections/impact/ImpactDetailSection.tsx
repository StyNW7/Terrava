import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

interface ImpactDetailSectionProps {
  badge: string;
  title: string;
  points: string[];
  tone?: "default" | "muted";
}

export default function ImpactDetailSection({ badge, title, points, tone = "default" }: ImpactDetailSectionProps) {
  return (
    <section className={`py-20 sm:py-28 ${tone === "muted" ? "bg-white" : ""}`}>
      <div className="container">
        <SectionHeading badge={badge} title={title} />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-2.5 rounded-2xl border border-terrava-border bg-terrava-bg p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm text-terrava-text">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
