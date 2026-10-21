import { lazy, Suspense, useRef } from "react";
import { Loader2 } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import type { EarTagVariantId } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";
import { useNearViewport } from "@/hooks/useNearViewport";

const EarTagStudio = lazy(() => import("@/components/eartag3d/EarTagStudio"));

interface EarTagStudioSectionProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

export function Viewer3DPlaceholder({ label, className = "h-[440px] sm:h-[540px]" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-3xl border border-terrava-border bg-terrava-bg ${className}`}>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-terrava-muted">
        <Loader2 className="h-4 w-4 animate-spin text-terrava-primary" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

export default function EarTagStudioSection({ variantId, onVariantChange }: EarTagStudioSectionProps) {
  const { t } = useLanguage();
  const anchorRef = useRef<HTMLDivElement>(null);
  const near = useNearViewport(anchorRef);

  return (
    <section id="studio-3d" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.studio.badge")} title={t("eartag.studio.title")} description={t("eartag.studio.description")} />
        <div ref={anchorRef} className="mt-12">
          {near ? (
            <Suspense fallback={<Viewer3DPlaceholder label={t("eartag.studio.preparing")} />}>
              <EarTagStudio variantId={variantId} onVariantChange={onVariantChange} />
            </Suspense>
          ) : (
            <Viewer3DPlaceholder label={t("eartag.studio.preparing")} />
          )}
        </div>
      </div>
    </section>
  );
}
