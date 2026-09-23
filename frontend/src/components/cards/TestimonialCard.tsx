import { Quote } from "lucide-react";
import type { TestimonialItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  const { tr } = useLanguage();

  return (
    <div className="card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-terrava-border bg-white p-8 shadow-card">
      <Quote className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-terrava-light" aria-hidden="true" />
      <Quote className="relative mb-4 h-8 w-8 text-terrava-primary/60" aria-hidden="true" />
      <p className="relative mb-6 flex-1 text-base leading-relaxed text-terrava-text">
        &ldquo;{tr(testimonial.quote)}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          loading="lazy"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-terrava-light"
        />
        <div>
          <p className="text-sm font-semibold text-terrava-text">{testimonial.name}</p>
          <p className="text-xs text-terrava-muted">
            {tr(testimonial.role)} &middot; {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}
