import SectionHeading from "@/components/common/SectionHeading";
import StatisticCard from "@/components/cards/StatisticCard";
import { impactStatistics } from "@/data/statistics";

export default function ImpactStatsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Prototype Capability"
          title="Dibangun untuk skala dan keandalan"
          description="Angka berikut menggambarkan target kapabilitas platform pada tahap pengembangan MVP."
        />

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {impactStatistics.map((stat) => (
            <StatisticCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
