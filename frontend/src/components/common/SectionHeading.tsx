import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Render as a dark-on-light heading (default) or light text for dark backgrounds. */
  tone?: "light" | "dark";
}

export default function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  className,
  tone = "light",
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <Reveal
      className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left", className)}
      amount={0.4}
    >
      {badge && (
        <span
          className={cn(
            "mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide",
            dark
              ? "border-white/15 bg-white/10 text-white"
              : "border-terrava-primary/15 bg-terrava-light text-terrava-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] dark:shadow-none"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-emerald-300" : "bg-terrava-primary")} aria-hidden="true" />
          {badge}
        </span>
      )}
      <h2 className={cn("text-3xl font-bold leading-tight tracking-tight sm:text-4xl", dark ? "text-white" : "text-terrava-text")}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-white/80" : "text-terrava-muted")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}
