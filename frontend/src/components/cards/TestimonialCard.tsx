import { Quote } from "lucide-react";
import type { TestimonialItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  const { tr } = useLanguage();

  return (
    <div className="card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-terrava-border bg-white p-8 shadow-card">
      <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
        <Quote className="h-5 w-5 fill-current" aria-hidden="true" />
      </span>
      <p className="relative mb-6 flex-1 text-base leading-relaxed text-terrava-text">
        &ldquo;{tr(testimonial.quote)}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-terrava-border-muted pt-5">
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
