import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {badge && (
        <span className="mb-4 inline-flex items-center rounded-full bg-terrava-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
          {badge}
        </span>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-terrava-text sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-terrava-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
