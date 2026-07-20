import { useEffect } from "react";
import PageHero from "@/components/layout/PageHero";
import ContactOptionsSection from "@/components/sections/contact/ContactOptionsSection";
import ContactInfoSection from "@/components/sections/contact/ContactInfoSection";
import FaqSection from "@/components/sections/FaqSection";
import { contactFaqs } from "@/data/faqs";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact Terrava | Request Demo and Pilot Project";
  }, []);

  return (
    <>
      <PageHero
        badge="Contact Terrava"
        title="Mari bangun masa depan peternakan bersama."
        description="Hubungi tim Terrava untuk demo, pilot project, kemitraan teknologi, kolaborasi riset, atau implementasi pada peternakan dan koperasi."
      />
      <ContactOptionsSection />
      <ContactInfoSection />
      <FaqSection
        faqs={contactFaqs}
        badge="Quick FAQ"
        title="Pertanyaan seputar demo dan kemitraan"
        tone="muted"
      />
    </>
  );
}
