import { Feather, Cpu, MapPin, BatteryCharging, Radio, Sun } from "lucide-react";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import PrimaryButton from "@/components/common/PrimaryButton";
import { useLanguage } from "@/hooks/useLanguage";

const highlights = [
  { icon: Feather, key: "home.earTag.highlight.lightweight" },
  { icon: Cpu, key: "home.earTag.highlight.sensors" },
  { icon: MapPin, key: "home.earTag.highlight.gps" },
  { icon: BatteryCharging, key: "home.earTag.highlight.lowPower" },
  { icon: Radio, key: "home.earTag.highlight.lora" },
  { icon: Sun, key: "home.earTag.highlight.solar" },
];

export default function EarTagHighlightSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <ImageWithOverlay
          src="Images/close-up-ear-tag.png"
          alt={t("home.earTag.imageAlt")}
          className="aspect-[4/3]"
        />
        <div>
          <span className="mb-4 inline-flex items-center rounded-full bg-terrava-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
            Smart Ear Tag
          </span>
          <h2 className="text-3xl font-bold leading-tight text-terrava-text sm:text-4xl">
            {t("home.earTag.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-terrava-muted">
            {t("home.earTag.description")}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm font-medium text-terrava-text">
                <item.icon className="h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                {t(item.key)}
              </div>
            ))}
          </div>

          <PrimaryButton href="/smart-ear-tag" className="mt-8">
            {t("home.earTag.cta")}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
