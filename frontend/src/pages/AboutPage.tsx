import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import VisionMissionSection from "@/components/sections/about/VisionMissionSection";
import ValuesSection from "@/components/sections/about/ValuesSection";
import RecognitionSection from "@/components/sections/about/RecognitionSection";
import TeamSection from "@/components/sections/about/TeamSection";
import SdgSection from "@/components/sections/SdgSection";
import CTASection from "@/components/sections/CTASection";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Terrava | AI-Powered Smart Livestock Ecosystem";
  }, []);

  return (
    <>
      <PageHero
        badge="About Terrava"
        title="Teknologi yang tumbuh dari kebutuhan nyata peternak."
        description="Terrava dibangun untuk menghubungkan kesehatan ternak, data, dan pengambilan keputusan dalam satu ekosistem yang modular dan mudah digunakan."
        image="Images/close-up-ear-tag.png"
        imageAlt="Tim Terrava bersama teknologi peternakan"
      />
      <VisionMissionSection />
      <ValuesSection />
      <RecognitionSection />
      <TeamSection />
      <SdgSection description="Terrava berkontribusi pada tujuan pembangunan berkelanjutan melalui inovasi teknologi peternakan." />
      <CTASection
        title="Kenali Terrava lebih dekat"
        description="Lihat bagaimana teknologi kami bekerja langsung di lapangan."
        primaryLabel="Meet Terrava in Action"
        primaryHref="/how-it-works"
        secondaryLabel="Contact Our Team"
        secondaryHref="/contact"
      />
    </>
  );
}
