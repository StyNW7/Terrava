import { Feather, Cpu, MapPin, BatteryCharging, Radio, Sun } from "lucide-react";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import PrimaryButton from "@/components/common/PrimaryButton";
import { images } from "@/data/images";

const highlights = [
  { icon: Feather, label: "Lightweight design" },
  { icon: Cpu, label: "Physiological sensors" },
  { icon: MapPin, label: "GPS" },
  { icon: BatteryCharging, label: "Low-power system" },
  { icon: Radio, label: "LoRa connectivity" },
  { icon: Sun, label: "Solar charging support" },
];

export default function EarTagHighlightSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <ImageWithOverlay
          src={images.earTagCloseup}
          alt="Close-up smart ear tag pada sapi"
          className="aspect-[4/3]"
        />
        <div>
          <span className="mb-4 inline-flex items-center rounded-full bg-terrava-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
            Smart Ear Tag
          </span>
          <h2 className="text-3xl font-bold leading-tight text-terrava-text sm:text-4xl">
            Teknologi ringan yang menjaga setiap detak, gerakan, dan lokasi ternak
          </h2>
          <p className="mt-4 text-base leading-relaxed text-terrava-muted">
            Smart ear tag Terrava dirancang hemat energi untuk mengumpulkan data fisiologis, aktivitas, dan
            lokasi ternak tanpa mengganggu kenyamanan hewan.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-terrava-text">
                <item.icon className="h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>

          <PrimaryButton href="/smart-ear-tag" className="mt-8">
            Discover Smart Ear Tag
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
