import { contactOptions } from "@/data/contactOptions";
import { StaggerGrid } from "@/components/motion/Stagger";

export default function ContactOptionsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contactOptions.map((option) => (
            <div key={option.id} className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                <option.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{option.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{option.description}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
