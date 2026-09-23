import SectionHeading from "@/components/common/SectionHeading";
import FAQAccordion from "@/components/common/FAQAccordion";
import type { FaqItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  description?: string;
  badge?: string;
  tone?: "default" | "muted";
}

export default function FaqSection({
  faqs,
  title,
  description,
  badge = "FAQ",
  tone = "default",
}: FaqSectionProps) {
  const { t } = useLanguage();

  return (
    <section className={`py-20 sm:py-28 ${tone === "muted" ? "bg-white" : ""}`}>
      <div className="container">
        <SectionHeading badge={badge} title={title ?? t("faq.defaultTitle")} description={description} />
        <div className="mt-12">
          <FAQAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
