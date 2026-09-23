import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import SensorsSection from "@/components/sections/eartag/SensorsSection";
import AnatomySection from "@/components/sections/eartag/AnatomySection";
import DataFlowSection from "@/components/sections/eartag/DataFlowSection";
import EnergySection from "@/components/sections/eartag/EnergySection";
import ConnectivitySection from "@/components/sections/eartag/ConnectivitySection";
import ComfortSafetySection from "@/components/sections/eartag/ComfortSafetySection";
import SpecsSection from "@/components/sections/eartag/SpecsSection";
import CTASection from "@/components/sections/CTASection";
import { useLanguage } from "@/hooks/useLanguage";

export default function SmartEarTagPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Smart Ear Tag | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge="Smart Ear Tag"
        title={t("eartag.hero.title")}
        image="/Images/close-up-ear-tag.png"
        imageAlt={t("home.earTag.imageAlt")}
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-terrava-text sm:text-3xl">{t("eartag.overview.title")}</h2>
          <p className="mt-4 text-base leading-relaxed text-terrava-muted">{t("eartag.overview.description")}</p>
        </div>
      </section>

      <SensorsSection />
      <AnatomySection />
      <DataFlowSection />
      <EnergySection />
      <ConnectivitySection />
      <ComfortSafetySection />
      <SpecsSection />

      <CTASection
        title={t("eartag.cta.title")}
        description={t("eartag.cta.description")}
        primaryLabel={t("cta.requestDemo")}
        primaryHref="/contact"
        secondaryLabel={t("cta.exploreSolutions")}
        secondaryHref="/solutions"
      />
    </>
  );
}
