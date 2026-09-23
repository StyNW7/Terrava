import SectionHeading from "@/components/common/SectionHeading";
import { companyValues } from "@/data/values";
import { StaggerGrid } from "@/components/motion/Stagger";
import { useLanguage } from "@/hooks/useLanguage";

export default function ValuesSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("about.values.badge")} title={t("about.values.title")} />

        <StaggerGrid className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companyValues.map((value) => (
            <div key={value.id} className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
                <value.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-terrava-text">{value.title}</h3>
              <p className="text-sm leading-relaxed text-terrava-muted">{tr(value.description)}</p>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
