import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import PillarsSection from "@/components/sections/impact/PillarsSection";
import ImpactDetailSection from "@/components/sections/impact/ImpactDetailSection";
import ImpactChartsSection from "@/components/sections/impact/ImpactChartsSection";
import SdgSection from "@/components/sections/SdgSection";
import LongTermVisionSection from "@/components/sections/impact/LongTermVisionSection";
import CTASection from "@/components/sections/CTASection";

const socialPoints = [
  "Memberdayakan peternak lokal",
  "Meningkatkan literasi digital",
  "Memperluas akses terhadap teknologi",
  "Mendukung animal welfare",
  "Mempercepat respons terhadap risiko kesehatan",
];

const economicPoints = [
  "Mengurangi potensi kerugian akibat keterlambatan",
  "Meningkatkan efisiensi monitoring",
  "Mengurangi pekerjaan manual berulang",
  "Mendukung produktivitas ternak",
  "Membantu keputusan berbasis data",
];

const environmentalPoints = [
  "Efisiensi penggunaan sumber daya",
  "Pengelolaan ternak yang lebih tepat",
  "Dukungan terhadap monitoring kondisi lingkungan",
  "Potensi pengelolaan limbah dan emisi pada pengembangan berikutnya",
  "Penggunaan perangkat hemat energi",
];

export default function ImpactPage() {
  useEffect(() => {
    document.title = "Impact | Terrava";
  }, []);

  return (
    <>
      <PageHero
        badge="Impact and Sustainability"
        title="Lebih dari teknologi—Terrava membangun peternakan yang lebih tangguh."
      />
      <PillarsSection />
      <ImpactDetailSection badge="Social Impact" title="Dampak sosial bagi komunitas peternak" points={socialPoints} tone="muted" />
      <ImpactDetailSection badge="Economic Impact" title="Dampak ekonomi bagi peternakan" points={economicPoints} />
      <ImpactDetailSection badge="Environmental Impact" title="Dampak terhadap lingkungan" points={environmentalPoints} tone="muted" />
      <ImpactChartsSection />
      <SdgSection description="Kontribusi Terrava terhadap tujuan pembangunan berkelanjutan global." />
      <LongTermVisionSection />
      <CTASection
        title="Partner with Terrava"
        description="Mari berkolaborasi untuk membangun peternakan yang lebih sehat dan berkelanjutan."
        primaryLabel="Request Demo"
        primaryHref="/contact"
        secondaryLabel="Learn About Us"
        secondaryHref="/about"
      />
    </>
  );
}
