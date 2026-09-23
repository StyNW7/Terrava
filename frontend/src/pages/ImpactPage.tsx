import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import PillarsSection from "@/components/sections/impact/PillarsSection";
import ImpactDetailSection from "@/components/sections/impact/ImpactDetailSection";
import ImpactChartsSection from "@/components/sections/impact/ImpactChartsSection";
import SdgSection from "@/components/sections/SdgSection";
import LongTermVisionSection from "@/components/sections/impact/LongTermVisionSection";
import CTASection from "@/components/sections/CTASection";
import { useLanguage } from "@/hooks/useLanguage";

const socialPoints = ["empower", "literacy", "access", "welfare", "response"];
const economicPoints = ["losses", "efficiency", "manualWork", "productivity", "decisions"];
const environmentalPoints = ["resources", "management", "monitoring", "emissions", "lowPower"];

export default function ImpactPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Impact | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge={t("impact.hero.badge")}
        title={t("impact.hero.title")}
      />
      <PillarsSection />
      <ImpactDetailSection
        badge={t("impact.social.badge")}
        title={t("impact.social.title")}
        points={socialPoints.map((key) => t("impact.social.point." + key))}
        tone="muted"
      />
      <ImpactDetailSection
        badge={t("impact.economic.badge")}
        title={t("impact.economic.title")}
        points={economicPoints.map((key) => t("impact.economic.point." + key))}
      />
      <ImpactDetailSection
        badge={t("impact.environmental.badge")}
        title={t("impact.environmental.title")}
        points={environmentalPoints.map((key) => t("impact.environmental.point." + key))}
        tone="muted"
      />
      <ImpactChartsSection />
      <SdgSection description={t("impact.sdgDescription")} />
      <LongTermVisionSection />
      <CTASection
        title={t("impact.cta.title")}
        description={t("impact.cta.description")}
        primaryLabel={t("cta.requestDemo")}
        primaryHref="/contact"
        secondaryLabel={t("cta.learnAboutUs")}
        secondaryHref="/about"
      />
    </>
  );
}
