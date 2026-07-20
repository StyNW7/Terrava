import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types";

export default function FAQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(id);
    }
  };

  return (
    <div className="mx-auto max-w-3xl divide-y divide-terrava-border rounded-2xl border border-terrava-border bg-white">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${faq.id}`}
              onClick={() => toggle(faq.id)}
              onKeyDown={(event) => handleKeyDown(event, faq.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-sm font-semibold text-terrava-text sm:text-base">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-terrava-primary transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`faq-panel-${faq.id}`}
              role="region"
              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-terrava-muted">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
