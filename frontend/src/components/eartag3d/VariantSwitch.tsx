import { earTagVariantOrder, earTagVariants, type EarTagVariantId } from "@/data/earTagVariants";
import { cn } from "@/lib/utils";

interface VariantSwitchProps {
  value: EarTagVariantId;
  onChange: (id: EarTagVariantId) => void;
  className?: string;
  /** Visual tone: solid on light surfaces, glass on top of a 3D canvas. */
  tone?: "solid" | "glass";
}

/** Segmented control to pick the TV-ET1 Shield or the TV-ET0 Classic. */
export default function VariantSwitch({ value, onChange, className, tone = "solid" }: VariantSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Terrava ear tag model"
      className={cn(
        "inline-flex rounded-full border p-1",
        tone === "glass"
          ? "border-white/60 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-terrava-forest/70"
          : "border-terrava-border bg-white",
        className
      )}
    >
      {earTagVariantOrder.map((id) => {
        const variant = earTagVariants[id];
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              active ? "bg-terrava-primary text-white shadow-sm" : "text-terrava-muted hover:text-terrava-primary"
            )}
          >
            <span className={cn("font-mono text-[10px] sm:text-[11px]", active ? "text-white/75" : "text-terrava-muted-2")}>
              {variant.code}
            </span>
            {variant.name}
          </button>
        );
      })}
    </div>
  );
}
