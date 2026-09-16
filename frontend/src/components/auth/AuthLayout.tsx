import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthHeader from "@/components/auth/AuthHeader";
import { authPanelCopy } from "@/data/auth";
import { images } from "@/data/images";
import type { AuthBenefit, AuthPanelVariant, AuthTestimonialData } from "@/types/auth";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  panelVariant: AuthPanelVariant;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkPath?: string;
  showBackButton?: boolean;
  testimonial?: AuthTestimonialData;
  featureItems?: AuthBenefit[];
  maxWidthClassName?: string;
}

export default function AuthLayout({
  panelVariant,
  eyebrow,
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkPath,
  showBackButton = true,
  testimonial,
  featureItems,
  maxWidthClassName = "max-w-md",
}: AuthLayoutProps) {
  const copy = authPanelCopy[panelVariant];

  return (
    <div className="grid min-h-screen bg-terrava-bg lg:grid-cols-[1.08fr_0.92fr]">
      <AuthBrandPanel
        heading={copy.heading}
        description={copy.description}
        benefits={featureItems ?? copy.benefits}
        testimonial={testimonial ?? copy.testimonial}
      />

      {/* Compact brand strip for tablet and mobile so the identity is never hidden. */}
      <div className="relative overflow-hidden bg-gradient-to-br from-terrava-dark to-terrava-primary px-5 py-6 text-white sm:px-8 lg:hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={images.logoIcon} alt="Terrava logo" className="h-9 w-9 rounded-lg bg-white/90 object-contain p-0.5" />
            <span>
              <span className="block text-base font-bold leading-tight">Terrava</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Smart Livestock Ecosystem
              </span>
            </span>
          </Link>
          <p className="hidden max-w-[220px] text-right text-xs leading-snug text-white/80 sm:block">{copy.heading}</p>
        </div>
      </div>

      <main className="relative flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn("relative w-full", maxWidthClassName)}
        >
          <AuthHeader eyebrow={eyebrow} title={title} subtitle={subtitle} showBackButton={showBackButton} />

          {children}

          {footerText && footerLinkText && footerLinkPath && (
            <p className="mt-8 text-center text-sm text-terrava-muted">
              {footerText}{" "}
              <Link to={footerLinkPath} className="font-semibold text-terrava-primary hover:text-terrava-hover">
                {footerLinkText}
              </Link>
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
