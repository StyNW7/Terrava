import { lazy, Suspense, useRef } from "react";
import { Info } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { Viewer3DPlaceholder } from "@/components/sections/eartag/EarTagStudioSection";
import type { EarTagVariantId } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";
import { useNearViewport } from "@/hooks/useNearViewport";

const CowSimulator = lazy(() => import("@/components/eartag3d/CowSimulator"));

interface CowSimulationSectionProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

export default function CowSimulationSection({ variantId, onVariantChange }: CowSimulationSectionProps) {
  const { t } = useLanguage();
  const anchorRef = useRef<HTMLDivElement>(null);
  const near = useNearViewport(anchorRef);

  return (
    <section id="simulasi-sapi" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.sim.badge")} title={t("eartag.sim.title")} description={t("eartag.sim.description")} />
        <div ref={anchorRef} className="mt-12">
          {near ? (
            <Suspense fallback={<Viewer3DPlaceholder label={t("eartag.sim.loading")} className="h-[600px]" />}>
              <CowSimulator variantId={variantId} onVariantChange={onVariantChange} />
            </Suspense>
          ) : (
            <Viewer3DPlaceholder label={t("eartag.sim.loading")} className="h-[600px]" />
          )}
        </div>
        <p className="mx-auto mt-6 flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-terrava-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("eartag.sim.disclaimer")}
        </p>
      </div>
    </section>
  );
}
