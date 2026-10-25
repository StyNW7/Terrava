import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import VisionMissionSection from "@/components/sections/about/VisionMissionSection";
import ValuesSection from "@/components/sections/about/ValuesSection";
import RecognitionSection from "@/components/sections/about/RecognitionSection";
// The team section is kept in the codebase but hidden from the public site.
// import TeamSection from "@/components/sections/about/TeamSection";
import SdgSection from "@/components/sections/SdgSection";
import CTASection from "@/components/sections/CTASection";
import { useLanguage } from "@/hooks/useLanguage";

export default function AboutPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "About Terrava | AI-Powered Smart Livestock Ecosystem";
  }, []);

  return (
    <>
      <PageHero
        badge={t("about.hero.badge")}
        title={t("about.hero.title")}
        description={t("about.hero.description")}
        image="Images/close-up-ear-tag.png"
        imageAlt={t("about.hero.imageAlt")}
      />
      <VisionMissionSection />
      <ValuesSection />
      <RecognitionSection />
      {/* <TeamSection /> */}
      <SdgSection description={t("about.sdgDescription")} />
      <CTASection
        title={t("about.cta.title")}
        description={t("about.cta.description")}
        primaryLabel={t("about.cta.primary")}
        primaryHref="/how-it-works"
        secondaryLabel={t("cta.contactTeam")}
        secondaryHref="/contact"
      />
    </>
  );
}
