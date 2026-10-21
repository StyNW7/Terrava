import SectionHeading from "@/components/common/SectionHeading";
import { earTagVariantOrder, earTagVariants, specComparison } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";

export default function SpecsSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.specs.badge")} title={t("eartag.specs.title")} description={t("eartag.specs.description")} />

        <div className="mx-auto mt-14 max-w-5xl overflow-x-auto rounded-2xl border border-terrava-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-terrava-forest text-white">
                <th scope="col" className="w-[22%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {t("eartag.specs.spec")}
                </th>
                {earTagVariantOrder.map((id) => (
                  <th key={id} scope="col" className="px-6 py-4">
                    <span className="mr-2 font-mono text-xs text-emerald-300">{earTagVariants[id].code}</span>
                    <span className="font-semibold">{earTagVariants[id].name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specComparison.map((row, index) => (
                <tr key={row.label.en} className={index % 2 === 0 ? "bg-white" : "bg-terrava-bg"}>
                  <th scope="row" className="px-6 py-3.5 font-medium text-terrava-text">
                    {tr(row.label)}
                  </th>
                  {row.shared ? (
                    <td colSpan={2} className="px-6 py-3.5 text-terrava-muted">
                      <span className="mr-2 rounded-full bg-terrava-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-terrava-primary">
                        {t("eartag.specs.both")}
                      </span>
                      {tr(row.shared)}
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-3.5 text-terrava-muted">{row.shield && tr(row.shield)}</td>
                      <td className="px-6 py-3.5 text-terrava-muted">{row.classic && tr(row.classic)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
