import { Box, Cpu, PlayCircle } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { earTagVariantOrder, earTagVariants, type EarTagVariantId } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface EarTagFamilySectionProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

const SHARED_KIT = ["XIAO ESP32S3", "Wio-SX1262 LoRaWAN", "MLX90614 IR", "MAX30102 PPG", "6-axis IMU", "GNSS L76K", "USB-C", "IP67 target"];

export default function EarTagFamilySection({ variantId, onVariantChange }: EarTagFamilySectionProps) {
  const { t, tr } = useLanguage();

  const go = (id: EarTagVariantId, anchor: string) => {
    onVariantChange(id);
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="ear-tag-lineup" className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.family.badge")} title={t("eartag.family.title")} description={t("eartag.family.description")} />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {earTagVariantOrder.map((id, index) => {
            const variant = earTagVariants[id];
            const active = id === variantId;
            const rows: Array<[string, string]> = [
              [t("eartag.family.row.form"), tr(variant.form)],
              [t("eartag.family.row.envelope"), `${variant.envelope.join(" × ")} mm`],
              [t("eartag.family.row.weight"), `≈ ${variant.weightGrams} g`],
              [t("eartag.family.row.battery"), variant.battery],
              [t("eartag.family.row.solar"), t(`eartag.family.solar.${variant.solar}`)],
              [t("eartag.family.row.runtime"), t("eartag.family.runtimeValue", { days: variant.runtimeDays })],
              [t("eartag.family.row.bestFor"), tr(variant.bestFor)],
            ];
            return (
              <Reveal key={id} delay={index * 0.08}>
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-card transition-shadow hover:shadow-lift",
                    active ? "border-terrava-primary/50 ring-1 ring-terrava-primary/30" : "border-terrava-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onVariantChange(id)}
                    className="relative block overflow-hidden bg-[radial-gradient(90%_80%_at_50%_30%,#ffffff_0%,#eef3f0_100%)]"
                    aria-label={`${variant.code} ${variant.name}`}
                  >
                    <img
                      src={variant.heroImage}
                      alt={`Terrava ${variant.code} ${variant.name}`}
                      loading="lazy"
                      width={1200}
                      height={900}
                      className="mx-auto h-64 w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:h-72"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-terrava-forest/90 px-3 py-1 font-mono text-[11px] font-semibold text-white">
                      {variant.code}
                    </span>
                    {active && (
                      <span className="absolute right-4 top-4 rounded-full bg-terrava-primary px-3 py-1 text-[11px] font-semibold text-white">
                        {t("eartag.family.selected")}
                      </span>
                    )}
                  </button>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-terrava-text">
                      Terrava {variant.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-terrava-muted">{tr(variant.tagline)}</p>
                    <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-terrava-border pt-4 text-sm">
                      {rows.map(([label, value]) => (
                        <div key={label} className="contents">
                          <dt className="text-terrava-muted">{label}</dt>
                          <dd className="font-medium text-terrava-text">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-6 flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => go(id, "studio-3d")}
                        className="inline-flex items-center gap-2 rounded-full bg-terrava-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terrava-hover"
                      >
                        <Box className="h-4 w-4" aria-hidden="true" />
                        {t("eartag.family.view3d")}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(id, "simulasi-sapi")}
                        className="inline-flex items-center gap-2 rounded-full border border-terrava-border px-4 py-2 text-sm font-semibold text-terrava-text transition-colors hover:border-terrava-primary/40 hover:text-terrava-primary"
                      >
                        <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        {t("eartag.family.simulate")}
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-terrava-border bg-terrava-light/60 p-5 sm:flex-row sm:items-center">
            <p className="flex shrink-0 items-center gap-2 text-sm font-semibold text-terrava-text">
              <Cpu className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
              {t("eartag.family.sharedKit")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SHARED_KIT.map((item) => (
                <span key={item} className="rounded-full border border-terrava-primary/15 bg-white px-2.5 py-1 text-xs font-medium text-terrava-text">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
