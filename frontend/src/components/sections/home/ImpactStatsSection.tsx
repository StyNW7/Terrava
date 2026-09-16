import SectionHeading from "@/components/common/SectionHeading";
import StatisticCard from "@/components/cards/StatisticCard";
import { impactStatistics } from "@/data/statistics";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export default function ImpactStatsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Prototype Capability"
          title="Dibangun untuk skala dan keandalan"
          description="Angka berikut menggambarkan target kapabilitas platform pada tahap pengembangan MVP."
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6" stagger={0.07}>
          {impactStatistics.map((stat) => (
            <StaggerItem key={stat.id} className="h-full">
              <StatisticCard stat={stat} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
