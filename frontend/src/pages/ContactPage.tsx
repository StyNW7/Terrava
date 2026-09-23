import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import ContactOptionsSection from "@/components/sections/contact/ContactOptionsSection";
import ContactInfoSection from "@/components/sections/contact/ContactInfoSection";
import FaqSection from "@/components/sections/FaqSection";
import { contactFaqs } from "@/data/faqs";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Contact Terrava | Request Demo and Pilot Project";
  }, []);

  return (
    <>
      <PageHero
        badge={t("contact.hero.badge")}
        title={t("contact.hero.title")}
        description={t("contact.hero.description")}
      />
      <ContactOptionsSection />
      <ContactInfoSection />
      <FaqSection
        faqs={contactFaqs}
        badge="Quick FAQ"
        title={t("contact.faq.title")}
        tone="muted"
      />
    </>
  );
}
