/**
 * RFC 4180 CSV with a UTF-8 BOM so Excel opens Indonesian characters correctly.
 * Cells starting with = + - @ are prefixed to block spreadsheet formula injection.
 */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escape = (cell: string | number | boolean | null | undefined) => {
    if (cell == null) return '';
    let text = String(cell);
    if (/^[=+\-@]/.test(text) && typeof cell === 'string') text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers, ...rows].map((row) => row.map(escape).join(','));
  return `﻿${lines.join('\r\n')}\r\n`;
}
