import type { ReportDocument, ReportKpi } from "@/lib/reports";
import { downloadBlob, downloadCsv } from "@/lib/download";
import { fileStamp } from "@/utils/time";

/** Labels the PDF needs that are not part of the report body. */
export interface PdfLabels {
  generatedOn: string;
  scope: string;
  summary: string;
  findings: string;
  page: (current: number, total: number) => string;
  footer: string;
  locale: string;
}

type Rgb = [number, number, number];

const BRAND: Rgb = [39, 122, 77];
const BRAND_DARK: Rgb = [22, 61, 42];
const TEXT: Rgb = [21, 35, 27];
const MUTED: Rgb = [102, 115, 107];
const BORDER: Rgb = [220, 230, 223];
const SOFT: Rgb = [232, 243, 237];
const TONES: Record<NonNullable<ReportKpi["tone"]>, Rgb> = {
  default: BRAND,
  good: [39, 135, 91],
  warning: [216, 155, 50],
  danger: [201, 91, 91],
  neutral: [136, 148, 140],
};

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch("/icons/icon-192.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function reportFileName(report: ReportDocument, extension: "pdf" | "csv") {
  return `terrava-${report.type}-report_${fileStamp(report.generatedAt)}.${extension}`;
}

/** Render a report to an A4 PDF (summary tiles, bar chart, findings and tables) and download it. */
export async function downloadReportPdf(report: ReportDocument, labels: PdfLabels) {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([import("jspdf"), import("jspdf-autotable"), loadLogo()]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // --- Header band ---------------------------------------------------------
  doc.setFillColor(...BRAND_DARK);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFillColor(...BRAND);
  doc.rect(0, 36, pageWidth, 4, "F");
  if (logo) {
    // White tile so the green logo stays legible on the dark header.
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin - 1, 8, 16, 16, 3, 3, "F");
    doc.addImage(logo, "PNG", margin, 9, 14, 14);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TERRAVA", margin + (logo ? 18 : 0), 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Smart Livestock Ecosystem", margin + (logo ? 18 : 0), 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(report.title, margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const generated = `${labels.generatedOn}: ${report.generatedAt.toLocaleString(labels.locale, { dateStyle: "long", timeStyle: "short" })}`;
  doc.text(generated, pageWidth - margin, 14, { align: "right" });
  doc.text(`${labels.scope}: ${report.scope}`, pageWidth - margin, 19, { align: "right" });
  y = 50;

  const sectionTitle = (title: string) => {
    ensureSpace(14);
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + 12, y + 2);
    y += 8;
  };

  // --- KPI tiles -----------------------------------------------------------
  sectionTitle(labels.summary);
  const columns = 3;
  const gap = 4;
  const tileWidth = (contentWidth - gap * (columns - 1)) / columns;
  const tileHeight = 19;
  report.kpis.forEach((kpi, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + col * (tileWidth + gap);
    const top = y + row * (tileHeight + gap);
    doc.setFillColor(...SOFT);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, top, tileWidth, tileHeight, 2.5, 2.5, "FD");
    doc.setFillColor(...TONES[kpi.tone ?? "default"]);
    doc.roundedRect(x, top, 1.6, tileHeight, 0.8, 0.8, "F");
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(kpi.label, x + 5, top + 6.5, { maxWidth: tileWidth - 8 });
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(kpi.value, x + 5, top + 15);
  });
  y += Math.ceil(report.kpis.length / columns) * (tileHeight + gap) + 4;

  // --- Bar chart -----------------------------------------------------------
  if (report.chart && report.chart.bars.length > 0) {
    const chart = report.chart;
    const barHeight = 5.5;
    const rowGap = 2.6;
    const labelWidth = 48;
    const chartHeight = chart.bars.length * (barHeight + rowGap) + 4;
    sectionTitle(chart.title);
    ensureSpace(chartHeight);
    const max = chart.max ?? Math.max(1, ...chart.bars.map((bar) => bar.value));
    const trackWidth = contentWidth - labelWidth - 16;
    chart.bars.forEach((bar, index) => {
      const top = y + index * (barHeight + rowGap);
      doc.setTextColor(...TEXT);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const label = doc.splitTextToSize(bar.label, labelWidth - 2)[0] as string;
      doc.text(label, margin, top + barHeight - 1.4);
      doc.setFillColor(242, 246, 243);
      doc.roundedRect(margin + labelWidth, top, trackWidth, barHeight, 1.2, 1.2, "F");
      const width = Math.max(0.8, (bar.value / max) * trackWidth);
      doc.setFillColor(...TONES[bar.tone ?? "default"]);
      doc.roundedRect(margin + labelWidth, top, width, barHeight, 1.2, 1.2, "F");
      doc.setFont("helvetica", "bold");
      doc.text(`${bar.value.toLocaleString(labels.locale)}${chart.unit ?? ""}`, margin + labelWidth + trackWidth + 2, top + barHeight - 1.4);
    });
    y += chartHeight + 4;
  }

  // --- Findings ------------------------------------------------------------
  if (report.findings.length) {
    sectionTitle(labels.findings);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    report.findings.forEach((finding) => {
      const lines = doc.splitTextToSize(finding, contentWidth - 6) as string[];
      ensureSpace(lines.length * 4.6 + 2);
      doc.setFillColor(...BRAND);
      doc.circle(margin + 1.2, y - 1.2, 0.9, "F");
      doc.setTextColor(...TEXT);
      doc.text(lines, margin + 5, y);
      y += lines.length * 4.6 + 2;
    });
    y += 3;
  }

  // --- Tables --------------------------------------------------------------
  report.tables.forEach((table) => {
    sectionTitle(table.title);
    autoTable(doc, {
      startY: y,
      head: [table.columns],
      body: table.rows.map((row) => row.map((cell) => String(cell))),
      margin: { left: margin, right: margin, bottom: 18 },
      styles: { font: "helvetica", fontSize: 7.5, cellPadding: 1.8, textColor: TEXT, lineColor: BORDER, lineWidth: 0.1 },
      headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 250, 248] },
      didDrawPage: () => {
        // Repeat a slim brand bar on continuation pages.
        doc.setFillColor(...BRAND);
        doc.rect(0, 0, pageWidth, 3, "F");
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 10;
  });

  // --- Footer on every page ------------------------------------------------
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(labels.footer, margin, pageHeight - 7);
    doc.text(labels.page(page, pages), pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  downloadBlob(doc.output("blob"), reportFileName(report, "pdf"));
}

/** CSV export of a report: every table, separated by a title row. */
export function downloadReportCsv(report: ReportDocument) {
  const rows: string[][] = [[report.title], [report.scope], []];
  report.kpis.forEach((kpi) => rows.push([kpi.label, kpi.value]));
  report.tables.forEach((table) => {
    rows.push([], [table.title], table.columns);
    table.rows.forEach((row) => rows.push(row.map(String)));
  });
  const width = Math.max(...rows.map((row) => row.length));
  downloadCsv(
    reportFileName(report, "csv"),
    rows,
    Array.from({ length: width }, (_, index) => ({ header: index === 0 ? "Terrava" : "", value: (row: string[]) => row[index] ?? "" }))
  );
}
