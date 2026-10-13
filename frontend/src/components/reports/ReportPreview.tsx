import type { ReportDocument, ReportKpi } from "@/lib/reports";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const toneBar: Record<NonNullable<ReportKpi["tone"]>, string> = {
  default: "bg-terrava-primary",
  good: "bg-terrava-success",
  warning: "bg-terrava-warning",
  danger: "bg-terrava-error",
  neutral: "bg-terrava-neutral",
};

const PREVIEW_ROWS = 8;

/** On-screen version of a generated report; mirrors what the PDF contains. */
export default function ReportPreview({ report }: { report: ReportDocument }) {
  const { t, lang } = useLanguage();
  const chart = report.chart;
  const max = chart ? chart.max ?? Math.max(1, ...chart.bars.map((bar) => bar.value)) : 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-terrava-dark to-terrava-primary p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Terrava · {t("reports.pdf.summary")}</p>
        <p className="mt-1 text-lg font-bold">{report.title}</p>
        <p className="mt-1 text-xs text-white/80">
          {t("reports.pdf.scope")}: {report.scope} · {t("reports.pdf.generatedOn")}{" "}
          {report.generatedAt.toLocaleString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {report.kpis.map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-xl border border-terrava-border bg-terrava-bg px-3.5 py-3">
            <span className={cn("absolute inset-y-0 left-0 w-1", toneBar[kpi.tone ?? "default"])} aria-hidden="true" />
            <p className="text-[11px] text-terrava-muted">{kpi.label}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-terrava-text">{kpi.value}</p>
          </div>
        ))}
      </div>

      {chart && chart.bars.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-terrava-text">{chart.title}</h3>
          <ul className="space-y-2">
            {chart.bars.map((bar) => (
              <li key={bar.label} className="grid grid-cols-[minmax(0,9rem)_1fr_3.5rem] items-center gap-3 text-xs">
                <span className="truncate text-terrava-text" title={bar.label}>
                  {bar.label}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-terrava-bg">
                  <span className={cn("block h-full rounded-full", toneBar[bar.tone ?? "default"])} style={{ width: `${Math.max(2, (bar.value / max) * 100)}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums text-terrava-text">
                  {bar.value.toLocaleString(lang === "id" ? "id-ID" : "en-GB")}
                  {chart.unit ?? ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.findings.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-terrava-text">{t("reports.pdf.findings")}</h3>
          <ul className="space-y-1.5">
            {report.findings.map((finding) => (
              <li key={finding} className="flex gap-2 rounded-xl bg-terrava-light/60 px-3 py-2 text-sm text-terrava-text">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terrava-primary" aria-hidden="true" />
                {finding}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.tables.map((table) => (
        <section key={table.title}>
          <h3 className="mb-2 text-sm font-bold text-terrava-text">{table.title}</h3>
          <div className="overflow-x-auto rounded-xl border border-terrava-border">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-terrava-primary text-white">
                <tr>
                  {table.columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.slice(0, PREVIEW_ROWS).map((row, index) => (
                  <tr key={index} className="border-t border-terrava-border-muted even:bg-terrava-bg/60">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="whitespace-nowrap px-3 py-1.5 text-terrava-text">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.rows.length > PREVIEW_ROWS && (
            <p className="mt-1.5 text-xs text-terrava-muted">{t("reports.moreRows", { count: table.rows.length - PREVIEW_ROWS })}</p>
          )}
          {table.rows.length === 0 && <p className="mt-1.5 text-xs text-terrava-muted">{t("rpt.empty")}</p>}
        </section>
      ))}
    </div>
  );
}
