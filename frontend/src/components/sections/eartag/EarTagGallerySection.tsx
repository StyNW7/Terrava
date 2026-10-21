import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import VariantSwitch from "@/components/eartag3d/VariantSwitch";
import { earTagVariants, type EarTagRender, type EarTagVariantId } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface EarTagGallerySectionProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

type Tab = "renders" | "drawings";

export default function EarTagGallerySection({ variantId, onVariantChange }: EarTagGallerySectionProps) {
  const { t, tr } = useLanguage();
  const [tab, setTab] = useState<Tab>("renders");
  const [open, setOpen] = useState<number | null>(null);
  const variant = earTagVariants[variantId];
  const items: EarTagRender[] = tab === "renders" ? variant.renders : variant.drawings;

  useEffect(() => {
    setOpen(null);
  }, [variantId, tab]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((index) => (index === null ? index : (index + 1) % items.length));
      if (event.key === "ArrowLeft") setOpen((index) => (index === null ? index : (index - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  const current = open !== null ? items[open] : null;

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.gallery.badge")} title={t("eartag.gallery.title")} description={t("eartag.gallery.description")} />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <VariantSwitch value={variantId} onChange={onVariantChange} />
          <div className="inline-flex rounded-full border border-terrava-border bg-white p-1" role="tablist">
            {(["renders", "drawings"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  tab === id ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted hover:text-terrava-primary"
                )}
              >
                {t(`eartag.gallery.tab.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setOpen(index)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-terrava-border bg-[#f6f8f6] text-left shadow-card transition-shadow hover:shadow-lift",
                tab === "renders" && index === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-2"
              )}
            >
              <img
                src={item.src}
                alt={tr(item.caption)}
                loading="lazy"
                className={cn(
                  "w-full transition-transform duration-500 group-hover:scale-[1.03]",
                  tab === "renders" ? "aspect-[4/3] object-cover" : "aspect-[1.414/1] object-contain bg-white"
                )}
              />
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-terrava-text opacity-0 shadow transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-xs font-medium text-white">
                {tr(item.caption)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tr(current.caption)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <figure className="relative max-h-full w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img src={current.src} alt={tr(current.caption)} className="max-h-[80vh] w-full rounded-2xl bg-white object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/85">
              {variant.code} {variant.name} · {tr(current.caption)} · {open + 1}/{items.length}
            </figcaption>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label={t("common.close")}
              className="absolute -top-3 right-0 flex h-10 w-10 -translate-y-full items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:-right-3 sm:translate-x-full sm:translate-y-0"
            >
              <X className="h-5 w-5" />
            </button>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((open - 1 + items.length) % items.length)}
                  aria-label="Previous"
                  className="absolute left-2 top-[40%] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen((open + 1) % items.length)}
                  aria-label="Next"
                  className="absolute right-2 top-[40%] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}
