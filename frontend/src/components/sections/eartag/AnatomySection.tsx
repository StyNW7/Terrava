import { useState } from "react";
import SectionHeading from "@/components/common/SectionHeading";
import { anatomyCallouts } from "@/data/earTag";

export default function AnatomySection() {
  const [activeId, setActiveId] = useState(anatomyCallouts[0].id);
  const activeCallout = anatomyCallouts.find((callout) => callout.id === activeId) ?? anatomyCallouts[0];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Product Anatomy"
          title="Anatomi interaktif smart ear tag"
          description="Klik setiap titik untuk melihat penjelasan komponen perangkat."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="/Images/ear-tag-anatomy.png"
              alt="Anatomi smart ear tag Terrava"
              loading="lazy"
              className="h-[320px] w-full object-cover sm:h-[420px]"
            />
            {anatomyCallouts.map((callout) => (
              <button
                key={callout.id}
                type="button"
                onClick={() => setActiveId(callout.id)}
                aria-pressed={activeId === callout.id}
                aria-label={callout.label}
                style={{ top: callout.top, left: callout.left }}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md transition-transform duration-200 hover:scale-110 ${
                  activeId === callout.id ? "bg-terrava-primary scale-110" : "bg-terrava-dark/70"
                }`}
              >
                +
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-terrava-border bg-terrava-bg p-6">
            <div className="flex flex-wrap gap-2">
              {anatomyCallouts.map((callout) => (
                <button
                  key={callout.id}
                  type="button"
                  onClick={() => setActiveId(callout.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeId === callout.id
                      ? "bg-terrava-primary text-white"
                      : "bg-white text-terrava-muted hover:text-terrava-primary"
                  }`}
                >
                  {callout.label}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold text-terrava-text">{activeCallout.label}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{activeCallout.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
