import SectionHeading from "@/components/common/SectionHeading";
import { journeySteps } from "@/data/processSteps";

export default function JourneySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Step by Step"
          title="Dari pendaftaran hingga tindakan nyata"
          description="Tujuh langkah utama yang membawa peternak dari pendaftaran akun hingga pengambilan keputusan berbasis data."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step) => (
            <div key={step.id} className="overflow-hidden rounded-2xl border border-terrava-border bg-white shadow-card">
              <img src={step.image} alt={step.title} loading="lazy" className="h-36 w-full object-cover" />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terrava-primary text-xs font-bold text-white">
                    {step.number}
                  </span>
                  <step.icon className="h-5 w-5 text-terrava-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-terrava-text">{step.title}</h3>
                <p className="text-xs leading-relaxed text-terrava-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
