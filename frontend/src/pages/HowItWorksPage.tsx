import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import JourneySection from "@/components/sections/howitworks/JourneySection";
import TechnicalWorkflowSection from "@/components/sections/howitworks/TechnicalWorkflowSection";
import FarmerJourneySection from "@/components/sections/howitworks/FarmerJourneySection";
import UserRolesSection from "@/components/sections/howitworks/UserRolesSection";
import PlatformAccessSection from "@/components/sections/howitworks/PlatformAccessSection";
import CTASection from "@/components/sections/CTASection";
import { useLanguage } from "@/hooks/useLanguage";

export default function HowItWorksPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "How It Works | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge="How It Works"
        title={t("howitworks.hero.title")}
      />
      <JourneySection />
      <TechnicalWorkflowSection />
      <FarmerJourneySection />
      <UserRolesSection />
      <PlatformAccessSection />
      <CTASection
        title={t("howitworks.cta.title")}
        description={t("howitworks.cta.description")}
        primaryLabel={t("cta.requestDemo")}
        primaryHref="/contact"
        secondaryLabel={t("cta.viewSolutions")}
        secondaryHref="/solutions"
      />
    </>
  );
}
