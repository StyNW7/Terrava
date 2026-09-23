import type { Dictionary, Language } from "@/i18n/types";
import { common } from "@/i18n/dict/common";
import { landing } from "@/i18n/dict/landing";
import { pages } from "@/i18n/dict/pages";
import { auth } from "@/i18n/dict/auth";
import { dashboard } from "@/i18n/dict/dashboard";

/**
 * Every UI string in the product, keyed by a dotted path. Indonesian and
 * English live side by side so a key can never drift out of sync.
 */
export const dictionary: Dictionary = {
  ...common,
  ...landing,
  ...pages,
  ...auth,
  ...dashboard,
};

/** Replace `{name}` placeholders with the supplied values. */
function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

export function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  const entry = dictionary[key];
  if (!entry) {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${key}`);
    return key;
  }
  return interpolate(entry[lang] ?? entry.id, vars);
}

/**
 * Translate a canonical term stored in data (a role, status, category, ...).
 * The value is slugified into `<namespace>.<slug>`; if no entry exists the raw
 * value is returned unchanged, so unknown terms degrade gracefully.
 */
export function translateTerm(lang: Language, namespace: string, value: string): string {
  if (!value) return value;
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const entry = dictionary[`${namespace}.${slug}`];
  return entry ? entry[lang] ?? entry.id : value;
}

const RELATIVE_PATTERN = /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i;

/**
 * Localize a canonical relative timestamp such as `"3 hours ago"`. Mock data
 * stores the English form; anything that does not match falls back to a term
 * lookup and then to the raw value.
 */
export function formatRelative(lang: Language, value: string): string {
  if (!value) return value;
  const match = RELATIVE_PATTERN.exec(value.trim());
  if (!match) return translateTerm(lang, "time", value);
  const count = Number(match[1]);
  const unit = match[2].toLowerCase();
  // English needs the singular form for a count of one; Indonesian does not
  // inflect, but the extra keys keep both locales explicit.
  const suffix = count === 1 ? "Ago" : "sAgo";
  return translate(lang, `time.${unit}${suffix}`, { count });
}
