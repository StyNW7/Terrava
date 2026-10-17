/** Pure helpers used by the auth service (kept framework-free for unit tests). */

export function initials(name: string): string {
  return name
    .replace(/^(drh\.|dr\.|ir\.)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** "Mozilla/5.0 (Windows NT 10.0...) Chrome/..." -> "Chrome - Windows". */
export function describeUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown device';
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : /okhttp|Dart|Expo/i.test(userAgent)
            ? 'Terrava Mobile App'
            : 'Browser';
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /Android/.test(userAgent)
      ? 'Android'
      : /iPhone|iPad|iOS/.test(userAgent)
        ? 'iOS'
        : /Mac OS X/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : '';
  return os ? `${browser} - ${os}` : browser;
}
