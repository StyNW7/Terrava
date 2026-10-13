import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import { buildReport, type ReportDocument, type ReportType } from "@/lib/reports";
import { downloadReportCsv, downloadReportPdf } from "@/lib/reportPdf";
import type { ReportFilters } from "@/context/data-store-context";

/** Build, download and log reports from any page. */
export function useReportActions() {
  const store = useDataStore();
  const { lang, t, tr, tt, tRel } = useLanguage();
  const [busy, setBusy] = useState<string | null>(null);

  const build = useCallback(
    (type: ReportType, filters: ReportFilters): ReportDocument => buildReport(type, store, filters, { lang, t, tr, tt, tRel }),
    [store, lang, t, tr, tt, tRel]
  );

  const log = useCallback(
    (type: ReportType, format: "pdf" | "csv", filters: ReportFilters) =>
      store.addReportHistory({ id: `RPT-${Date.now()}`, reportType: type, format, generatedAt: new Date().toISOString(), filters }),
    [store]
  );

  const downloadPdf = useCallback(
    async (type: ReportType, filters: ReportFilters, report?: ReportDocument) => {
      const doc = report ?? build(type, filters);
      setBusy(`${type}-pdf`);
      try {
        await downloadReportPdf(doc, {
          generatedOn: t("reports.pdf.generatedOn"),
          scope: t("reports.pdf.scope"),
          summary: t("reports.pdf.summary"),
          findings: t("reports.pdf.findings"),
          footer: t("reports.pdf.footer"),
          page: (current, total) => t("reports.pdf.page", { current, total }),
          locale: lang === "id" ? "id-ID" : "en-GB",
        });
        log(type, "pdf", filters);
        toast.success(t("reports.toast.downloaded", { title: doc.title }));
      } catch (error) {
        console.error(error);
        toast.error(t("reports.toast.failed"));
      } finally {
        setBusy(null);
      }
    },
    [build, log, t, lang]
  );

  const downloadCsv = useCallback(
    (type: ReportType, filters: ReportFilters, report?: ReportDocument) => {
      const doc = report ?? build(type, filters);
      downloadReportCsv(doc);
      log(type, "csv", filters);
      toast.success(t("reports.toast.downloaded", { title: doc.title }));
    },
    [build, log, t]
  );

  return { build, downloadPdf, downloadCsv, busy };
}
