import SectionHeading from "@/components/common/SectionHeading";
import TimelineStep from "@/components/cards/TimelineStep";
import { companyTimeline } from "@/data/timeline";

export default function StorySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          badge="Our Story"
          align="left"
          title="Perjalanan menuju smart livestock ecosystem"
          description="Terrava lahir dari serangkaian iterasi produk yang terus mendekatkan teknologi dengan kebutuhan nyata peternak Indonesia."
        />
        <div>
          {companyTimeline.map((entry, index) => (
            <TimelineStep
              key={entry.id}
              year={entry.year}
              title={entry.title}
              description={entry.description}
              isLast={index === companyTimeline.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
