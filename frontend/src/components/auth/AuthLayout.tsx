import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthHeader from "@/components/auth/AuthHeader";
import { authPanelCopy } from "@/data/auth";
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

      <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
        <div className={cn("w-full animate-fade-in-up", maxWidthClassName)}>
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
        </div>
      </main>
    </div>
  );
}
