/** Firmware shipped in iot/firmware/ear-tag; older tags are flagged by diagnostics. */
export const LATEST_EAR_TAG_FIRMWARE = 'v2.4.0';

/** Compare "v2.10.1"-style versions numerically. */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0);
  const [left, right] = [parse(a), parse(b)];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}
