import { HeartPulse, Thermometer, Radio, BellRing } from "lucide-react";
import { Link } from "react-router-dom";
import type { AuthBenefit, AuthTestimonialData } from "@/types/auth";
import AuthBenefitItem from "@/components/auth/AuthBenefitItem";
import AuthTestimonial from "@/components/auth/AuthTestimonial";
import RotatingMessage from "@/components/auth/RotatingMessage";
import { trustRowItems } from "@/data/auth";
import { images } from "@/data/images";

interface AuthBrandPanelProps {
  heading: string;
  description: string;
  benefits: AuthBenefit[];
  testimonial?: AuthTestimonialData;
}

const floatingCards = [
  { icon: HeartPulse, label: "Health Score", value: "92 / 100", meta: "Stable" },
  { icon: Thermometer, label: "Temperature", value: "38.4°C", meta: "Normal Range" },
  { icon: Radio, label: "Device Status", value: "128 Connected", meta: "Prototype demo" },
  { icon: BellRing, label: "Active Alerts", value: "2 Need Attention", meta: "Prototype demo" },
];

export default function AuthBrandPanel({ heading, description, benefits, testimonial }: AuthBrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-terrava-dark to-terrava-primary lg:flex lg:flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${images.cattleHerd})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102B1D] via-terrava-dark/80 to-terrava-primary/70" aria-hidden="true" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="auth-node-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-node-grid)" />
      </svg>

      <div className="relative flex h-full flex-col justify-between px-12 py-12 xl:px-16">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-xl font-bold text-white">Terrava</span>
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
            AI-Powered Smart Livestock Ecosystem
          </p>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-[2.15rem]">{heading}</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/80">{description}</p>

          <div className="mt-5">
            <RotatingMessage />
          </div>

          <div className="mt-8 space-y-5">
            {benefits.map((benefit) => (
              <AuthBenefitItem key={benefit.id} benefit={benefit} />
            ))}
          </div>

          <div className="relative mt-10 hidden xl:block">
            <div className="grid grid-cols-2 gap-3">
              {floatingCards.map((card, index) => (
                <div
                  key={card.label}
                  className="animate-float rounded-2xl border border-white/15 bg-white/95 p-4 shadow-soft"
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  <card.icon className="mb-2 h-4 w-4 text-terrava-primary" aria-hidden="true" />
                  <p className="text-[11px] font-medium text-terrava-muted">{card.label}</p>
                  <p className="text-sm font-bold text-terrava-text">{card.value}</p>
                  <p className="text-[10px] text-terrava-muted">{card.meta}</p>
                </div>
              ))}
            </div>
          </div>

          {testimonial && (
            <div className="mt-8">
              <AuthTestimonial testimonial={testimonial} />
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-white/70">
            Dirancang untuk peternak, koperasi, dokter hewan, dan pengelola peternakan modern.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {trustRowItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-white/60">
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
