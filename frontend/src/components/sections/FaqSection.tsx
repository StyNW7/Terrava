import SectionHeading from "@/components/common/SectionHeading";
import FAQAccordion from "@/components/common/FAQAccordion";
import type { FaqItem } from "@/types";

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  description?: string;
  badge?: string;
  tone?: "default" | "muted";
}

export default function FaqSection({
  faqs,
  title = "Pertanyaan yang sering diajukan",
  description,
  badge = "FAQ",
  tone = "default",
}: FaqSectionProps) {
  return (
    <section className={`py-20 sm:py-28 ${tone === "muted" ? "bg-white" : ""}`}>
      <div className="container">
        <SectionHeading badge={badge} title={title} description={description} />
        <div className="mt-12">
          <FAQAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
