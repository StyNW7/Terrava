interface TimelineStepProps {
  year: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function TimelineStep({ year, title, description, isLast = false }: TimelineStepProps) {
  return (
    <div className="relative flex gap-6 pb-10">
      {!isLast && (
        <span className="absolute left-[15px] top-8 h-full w-px bg-terrava-border" aria-hidden="true" />
      )}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terrava-primary text-xs font-bold text-white">
        {year.charAt(0)}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-terrava-primary">{year}</p>
        <h3 className="mb-1.5 text-lg font-semibold text-terrava-text">{title}</h3>
        <p className="text-sm leading-relaxed text-terrava-muted">{description}</p>
      </div>
    </div>
  );
}
