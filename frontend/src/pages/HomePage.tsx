import { useEffect } from "react";
import HeroSection from "@/components/sections/home/HeroSection";
import TrustedBySection from "@/components/sections/home/TrustedBySection";
import ProblemSection from "@/components/sections/home/ProblemSection";
import SolutionFlowSection from "@/components/sections/home/SolutionFlowSection";
import CoreFeaturesSection from "@/components/sections/home/CoreFeaturesSection";
import DashboardPreviewSection from "@/components/sections/home/DashboardPreviewSection";
import EarTagHighlightSection from "@/components/sections/home/EarTagHighlightSection";
import TargetUsersSection from "@/components/sections/home/TargetUsersSection";
import ImpactStatsSection from "@/components/sections/home/ImpactStatsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import CTASection from "@/components/sections/CTASection";
import { homeFaqs } from "@/data/faqs";
import { useLanguage } from "@/hooks/useLanguage";

export default function HomePage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Terrava | AI-Powered Smart Livestock Ecosystem";
  }, []);

  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <ProblemSection />
      <SolutionFlowSection />
      <CoreFeaturesSection />
      <DashboardPreviewSection />
      <EarTagHighlightSection />
      <TargetUsersSection />
      <ImpactStatsSection />
      <TestimonialsSection />
      <FaqSection
        faqs={homeFaqs}
        badge="FAQ"
        title={t("home.faq.title")}
        description={t("home.faq.description")}
      />
      <CTASection
        title={t("home.cta.title")}
        description={t("home.cta.description")}
        primaryLabel={t("cta.requestDemo")}
        primaryHref="/contact"
        secondaryLabel={t("cta.contactTeam")}
        secondaryHref="/contact"
      />
    </>
  );
}
