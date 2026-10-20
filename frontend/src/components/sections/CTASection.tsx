import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#123826] py-20 sm:py-24">
      {/* Layered aurora: drifting glows over a dotted grid, faded at the edges. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f2d1f] via-[#17573a] to-[#2a8a57]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl animate-aurora" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-lime-200/10 blur-3xl animate-aurora [animation-delay:-6s]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />

      <Reveal className="container relative max-w-4xl text-center" amount={0.4}>
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-100 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Terrava
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">{title}</h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {description}
          </p>
        )}
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Fixed light colours: this panel is dark in both themes. */}
          <Link
            to={primaryHref}
            className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffffff] px-6 py-3 text-sm font-semibold text-[#1f633e] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)] transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-[#ecf7f0] active:translate-y-0 active:scale-[0.98]"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              to={secondaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:translate-y-0 active:scale-[0.98]"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}
