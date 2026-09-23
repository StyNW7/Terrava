import SectionHeading from "@/components/common/SectionHeading";
import TimelineStep from "@/components/cards/TimelineStep";
import { companyTimeline } from "@/data/timeline";
import { useLanguage } from "@/hooks/useLanguage";

export default function StorySection() {
  const { t, tr } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          badge={t("about.story.badge")}
          align="left"
          title={t("about.story.title")}
          description={t("about.story.description")}
        />
        <div>
          {companyTimeline.map((entry, index) => (
            <TimelineStep
              key={entry.id}
              year={tr(entry.year)}
              title={entry.title}
              description={tr(entry.description)}
              isLast={index === companyTimeline.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
