import PDFDocument from 'pdfkit';
import { toCsv } from '../../common/utils/csv';
import type { ReportDocument, Tone } from './report.types';

const COLORS = {
  brand: '#277a4d',
  brandDark: '#163d2a',
  text: '#1f2d25',
  muted: '#6b7c72',
  border: '#dfe8e2',
  soft: '#f3f7f4',
  good: '#277a4d',
  warning: '#d48a06',
  danger: '#c0392b',
  neutral: '#8a9a90',
  default: '#277a4d',
} as const;

const toneColor = (tone?: Tone) => COLORS[tone ?? 'default'];

/** CSV export: every table of the document, separated by a title row. */
export function renderCsv(doc: ReportDocument): string {
  const blocks = doc.tables.map((table) => {
    const csv = toCsv(table.columns, table.rows).replace(/^﻿/, '');
    return `"${table.title.replace(/"/g, '""')}"\r\n${csv}`;
  });
  const header = toCsv(['Report', 'Scope', 'Generated'], [[doc.title, doc.scope, doc.generatedAt]]).replace(/^﻿/, '');
  const kpis = toCsv(
    ['KPI', 'Value'],
    doc.kpis.map((k) => [k.label, k.value]),
  ).replace(/^﻿/, '');
  return `﻿${header}\r\n${kpis}\r\n${blocks.join('\r\n')}`;
}

/**
 * A4 PDF with a branded header, KPI tiles, a bar chart, key findings and
 * paginated tables (header row repeated on each page).
 */
export function renderPdf(doc: ReportDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: { Title: doc.title, Author: 'Terrava', Subject: doc.scope },
    });
    const chunks: Buffer[] = [];
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    const left = pdf.page.margins.left;
    const width = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;
    const bottom = () => pdf.page.height - pdf.page.margins.bottom;
    const ensure = (height: number) => {
      if (pdf.y + height > bottom()) pdf.addPage();
    };
    const locale = doc.language === 'id' ? 'id-ID' : 'en-GB';
    const fmtDate = (iso: string) =>
      new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

    // --- Header band --------------------------------------------------------------
    pdf.rect(0, 0, pdf.page.width, 92).fill(COLORS.brandDark);
    pdf.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('TERRAVA', left, 24, { characterSpacing: 2 });
    pdf.font('Helvetica-Bold').fontSize(18).text(doc.title, left, 40, { width });
    pdf
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#cfe3d6')
      .text(
        `${doc.scope}  ·  ${fmtDate(doc.period.from)} – ${fmtDate(doc.period.to)}  ·  ${doc.language === 'id' ? 'Dibuat' : 'Generated'} ${fmtDate(doc.generatedAt)}`,
        left,
        66,
        { width },
      );
    pdf.y = 112;

    // --- KPI tiles ----------------------------------------------------------------
    if (doc.kpis.length) {
      const perRow = Math.min(3, doc.kpis.length);
      const gap = 10;
      const tileW = (width - gap * (perRow - 1)) / perRow;
      const tileH = 52;
      doc.kpis.forEach((kpi, i) => {
        const col = i % perRow;
        if (col === 0 && i > 0) pdf.y += tileH + gap;
        const x = left + col * (tileW + gap);
        const y = pdf.y;
        pdf.roundedRect(x, y, tileW, tileH, 8).fillAndStroke(COLORS.soft, COLORS.border);
        pdf.rect(x, y + 10, 3, tileH - 20).fill(toneColor(kpi.tone));
        pdf
          .fillColor(COLORS.muted)
          .font('Helvetica')
          .fontSize(8)
          .text(kpi.label.toUpperCase(), x + 12, y + 10, { width: tileW - 20 });
        pdf
          .fillColor(COLORS.text)
          .font('Helvetica-Bold')
          .fontSize(16)
          .text(kpi.value, x + 12, y + 25, { width: tileW - 20 });
        pdf.y = y;
      });
      pdf.y += tileH + 20;
    }

    // --- Bar chart -----------------------------------------------------------------
    if (doc.chart && doc.chart.bars.length) {
      const chart = doc.chart;
      const rowH = 18;
      ensure(30 + chart.bars.length * rowH);
      pdf.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text(chart.title, left, pdf.y);
      pdf.moveDown(0.5);
      const labelW = 130;
      const barMaxW = width - labelW - 50;
      const max = chart.max ?? Math.max(1, ...chart.bars.map((b) => b.value));
      for (const bar of chart.bars) {
        const y = pdf.y;
        pdf
          .fillColor(COLORS.muted)
          .font('Helvetica')
          .fontSize(8.5)
          .text(bar.label, left, y + 3, { width: labelW - 8, ellipsis: true, lineBreak: false });
        pdf.roundedRect(left + labelW, y + 2, barMaxW, 11, 3).fill(COLORS.soft);
        const w = Math.max(2, (bar.value / max) * barMaxW);
        pdf.roundedRect(left + labelW, y + 2, w, 11, 3).fill(toneColor(bar.tone));
        pdf
          .fillColor(COLORS.text)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`${bar.value}${chart.unit ?? ''}`, left + labelW + barMaxW + 6, y + 3);
        pdf.y = y + rowH;
      }
      pdf.moveDown(1);
    }

    // --- Findings --------------------------------------------------------------------
    if (doc.findings.length) {
      ensure(40);
      pdf
        .fillColor(COLORS.text)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(doc.language === 'id' ? 'Temuan utama' : 'Key findings', left, pdf.y);
      pdf.moveDown(0.4);
      for (const finding of doc.findings) {
        ensure(20);
        const y = pdf.y;
        pdf.circle(left + 3, y + 5, 2).fill(COLORS.brand);
        pdf
          .fillColor(COLORS.text)
          .font('Helvetica')
          .fontSize(9.5)
          .text(finding, left + 12, y, { width: width - 12 });
        pdf.moveDown(0.3);
      }
      pdf.moveDown(0.8);
    }

    // --- Tables ------------------------------------------------------------------------
    for (const table of doc.tables) {
      ensure(60);
      pdf.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text(table.title, left, pdf.y);
      pdf.moveDown(0.4);
      if (!table.rows.length) {
        pdf
          .fillColor(COLORS.muted)
          .font('Helvetica-Oblique')
          .fontSize(9)
          .text(doc.language === 'id' ? 'Tidak ada data.' : 'No data.', left, pdf.y);
        pdf.moveDown(1);
        continue;
      }
      const colW = width / table.columns.length;
      const drawHeader = () => {
        const y = pdf.y;
        pdf.rect(left, y, width, 18).fill(COLORS.brand);
        table.columns.forEach((col, i) => {
          pdf
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(7.5)
            .text(col, left + i * colW + 4, y + 5, { width: colW - 8, ellipsis: true, lineBreak: false });
        });
        pdf.y = y + 18;
      };
      drawHeader();
      table.rows.forEach((row, rowIndex) => {
        const rowH = 16;
        if (pdf.y + rowH > bottom()) {
          pdf.addPage();
          drawHeader();
        }
        const y = pdf.y;
        if (rowIndex % 2 === 1) pdf.rect(left, y, width, rowH).fill(COLORS.soft);
        row.forEach((cell, i) => {
          pdf
            .fillColor(COLORS.text)
            .font('Helvetica')
            .fontSize(7.5)
            .text(String(cell ?? ''), left + i * colW + 4, y + 4, {
              width: colW - 8,
              ellipsis: true,
              lineBreak: false,
            });
        });
        pdf.y = y + rowH;
      });
      pdf
        .moveTo(left, pdf.y)
        .lineTo(left + width, pdf.y)
        .strokeColor(COLORS.border)
        .stroke();
      pdf.moveDown(1.2);
    }

    // --- Footer with page numbers ----------------------------------------------------------
    const range = pdf.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      pdf.switchToPage(i);
      // Writing inside the bottom margin would otherwise trigger an automatic page break.
      pdf.page.margins.bottom = 0;
      const y = pdf.page.height - 28;
      pdf.fillColor(COLORS.muted).font('Helvetica').fontSize(7.5);
      pdf.text('Terrava · AI-Powered Smart Livestock Ecosystem', left, y, { width: width / 2, lineBreak: false });
      pdf.text(`${i + 1} / ${range.count}`, left + width / 2, y, {
        width: width / 2,
        align: 'right',
        lineBreak: false,
      });
    }
    pdf.end();
  });
}
