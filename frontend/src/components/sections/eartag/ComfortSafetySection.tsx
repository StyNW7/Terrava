import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import { images } from "@/data/images";

const comfortPoints = [
  "Compact design",
  "Lightweight construction",
  "Positioning around ear tissue",
  "Non-intrusive monitoring concept",
  "Durable field-ready casing",
  "Further veterinary and field validation required",
];

export default function ComfortSafetySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ImageWithOverlay src={images.modernBarn} alt="Sapi dalam kandang modern" className="aspect-[4/3]" />
        <div>
          <SectionHeading
            badge="Animal Comfort and Safety"
            align="left"
            title="Dirancang dengan kenyamanan ternak sebagai prioritas"
          />
          <ul className="mt-6 space-y-3">
            {comfortPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-terrava-text">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
