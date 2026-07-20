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
import { images } from "@/data/images";

export default function SmartEarTagPage() {
  useEffect(() => {
    document.title = "Smart Ear Tag | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge="Smart Ear Tag"
        title="Teknologi ringan yang menjaga setiap detak, gerakan, dan lokasi ternak."
        image={images.earTagCloseup}
        imageAlt="Close-up smart ear tag pada sapi"
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-terrava-text sm:text-3xl">Product Overview</h2>
          <p className="mt-4 text-base leading-relaxed text-terrava-muted">
            Smart ear tag Terrava dirancang sebagai perangkat hemat energi untuk mengumpulkan data
            fisiologis, aktivitas, dan lokasi ternak secara berkelanjutan, tanpa mengganggu aktivitas
            hariannya.
          </p>
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
        title="Bring Smart Monitoring to Your Livestock"
        description="Diskusikan kebutuhan perangkat untuk peternakan Anda bersama tim Terrava."
        primaryLabel="Request Demo"
        primaryHref="/contact"
        secondaryLabel="Explore Solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
