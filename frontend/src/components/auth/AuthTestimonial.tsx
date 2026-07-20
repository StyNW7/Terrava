import { Quote } from "lucide-react";
import type { AuthTestimonialData } from "@/types/auth";

export default function AuthTestimonial({ testimonial }: { testimonial: AuthTestimonialData }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
      <Quote className="mb-2 h-5 w-5 text-white/50" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-white/85">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="mt-3 text-xs font-semibold text-white">
        {testimonial.name} <span className="font-normal text-white/60">&middot; {testimonial.role}</span>
      </p>
    </div>
  );
}
