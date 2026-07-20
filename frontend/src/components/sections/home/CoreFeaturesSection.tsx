import SectionHeading from "@/components/common/SectionHeading";
import FeatureCard from "@/components/cards/FeatureCard";
import { coreFeatures } from "@/data/features";

export default function CoreFeaturesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Core Features"
          title="Semua yang dibutuhkan untuk peternakan yang lebih cerdas"
          description="Enam pilar utama Terrava yang bekerja bersama untuk menjaga kesehatan dan produktivitas ternak Anda."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
