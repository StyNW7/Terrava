import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import JourneySection from "@/components/sections/howitworks/JourneySection";
import TechnicalWorkflowSection from "@/components/sections/howitworks/TechnicalWorkflowSection";
import FarmerJourneySection from "@/components/sections/howitworks/FarmerJourneySection";
import UserRolesSection from "@/components/sections/howitworks/UserRolesSection";
import PlatformAccessSection from "@/components/sections/howitworks/PlatformAccessSection";
import CTASection from "@/components/sections/CTASection";

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = "How It Works | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge="How It Works"
        title="Dari pemasangan perangkat hingga keputusan—semuanya dalam satu alur cerdas."
      />
      <JourneySection />
      <TechnicalWorkflowSection />
      <FarmerJourneySection />
      <UserRolesSection />
      <PlatformAccessSection />
      <CTASection
        title="See Terrava in Action"
        description="Jadwalkan sesi demo untuk melihat alur kerja Terrava secara langsung."
        primaryLabel="Request Demo"
        primaryHref="/contact"
        secondaryLabel="View Solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
