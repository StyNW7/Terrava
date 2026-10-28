import SectionHeading from "@/components/common/SectionHeading";
import { earTagVariantOrder, earTagVariants, specComparison } from "@/data/earTagVariants";
import { useLanguage } from "@/hooks/useLanguage";

export default function SpecsSection() {
  const { t, tr } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.specs.badge")} title={t("eartag.specs.title")} description={t("eartag.specs.description")} />

        {/* Phones: one card per spec so long values wrap instead of scrolling sideways. */}
        <dl className="mx-auto mt-10 divide-y divide-terrava-border overflow-hidden rounded-2xl border border-terrava-border sm:hidden">
          {specComparison.map((row, index) => (
            <div key={row.label.en} className={index % 2 === 0 ? "bg-white px-4 py-4" : "bg-terrava-bg px-4 py-4"}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-terrava-text">{tr(row.label)}</dt>
              {row.shared ? (
                <dd className="mt-1.5 text-sm leading-relaxed text-terrava-muted">
                  <span className="mr-2 inline-block rounded-full bg-terrava-light px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-terrava-primary">
                    {t("eartag.specs.both")}
                  </span>
                  {tr(row.shared)}
                </dd>
              ) : (
                earTagVariantOrder.map((id) => {
                  const value = id === "shield" ? row.shield : row.classic;
                  return (
                    <dd key={id} className="mt-1.5 flex gap-3 text-sm leading-relaxed text-terrava-muted">
                      <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] font-semibold text-terrava-primary">
                        {earTagVariants[id].code}
                      </span>
                      <span className="min-w-0">{value ? tr(value) : "—"}</span>
                    </dd>
                  );
                })
              )}
            </div>
          ))}
        </dl>

        <div className="mx-auto mt-14 hidden max-w-5xl overflow-x-auto rounded-2xl border border-terrava-border sm:block">
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
