import { CheckCircle2, CircleAlert } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import { useLanguage } from "@/hooks/useLanguage";

const rows = ["monitoring", "detection", "history", "accessibility", "alert", "scalability", "decision"];

export default function ComparisonTableSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading badge={t("solutions.comparison.badge")} title={t("solutions.comparison.title")} />

        <div className="mt-14 overflow-x-auto rounded-2xl border border-terrava-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-terrava-bg">
                <th className="px-6 py-4 font-semibold text-terrava-text">{t("solutions.comparison.aspect")}</th>
                <th className="px-6 py-4 font-semibold text-terrava-muted">{t("solutions.comparison.traditional")}</th>
                <th className="px-6 py-4 font-semibold text-terrava-primary">Terrava</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="border-t border-terrava-border">
                  <td className="px-6 py-4 font-medium text-terrava-text">
                    {t("solutions.comparison." + row + ".aspect")}
                  </td>
                  <td className="px-6 py-4 text-terrava-muted">
                    <span className="flex items-start gap-2">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-terrava-warning" aria-hidden="true" />
                      {t("solutions.comparison." + row + ".traditional")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-terrava-text">
                    <span className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
                      {t("solutions.comparison." + row + ".terrava")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
