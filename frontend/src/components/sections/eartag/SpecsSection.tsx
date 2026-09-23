import SectionHeading from "@/components/common/SectionHeading";
import { specifications } from "@/data/earTag";
import { useLanguage } from "@/hooks/useLanguage";

export default function SpecsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("eartag.specs.badge")} title={t("eartag.specs.title")} />

        <div className="mx-auto mt-14 max-w-3xl overflow-x-auto rounded-2xl border border-terrava-border">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <tbody>
              {specifications.map((spec, index) => (
                <tr
                  key={spec.label}
                  className={index % 2 === 0 ? "bg-white" : "bg-terrava-bg"}
                >
                  <td className="px-6 py-3.5 font-medium text-terrava-text">{spec.label}</td>
                  <td className="px-6 py-3.5 text-terrava-muted">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
