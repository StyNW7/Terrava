import { Quote } from "lucide-react";
import type { TestimonialItem } from "@/types";

export default function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-8 shadow-card">
      <Quote className="mb-4 h-8 w-8 text-terrava-soft" aria-hidden="true" />
      <p className="mb-6 flex-1 text-base leading-relaxed text-terrava-text">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          loading="lazy"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-terrava-text">{testimonial.name}</p>
          <p className="text-xs text-terrava-muted">
            {testimonial.role} &middot; {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}
