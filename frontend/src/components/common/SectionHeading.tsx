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
            "mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide",
            dark ? "bg-white/10 text-white" : "bg-terrava-light text-terrava-primary"
          )}
        >
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
