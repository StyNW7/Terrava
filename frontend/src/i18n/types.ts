/** The two locales Terrava ships with. */
export type Language = "id" | "en";

export const LANGUAGES: Language[] = ["id", "en"];

/** A single string available in both locales. */
export interface Localized {
  id: string;
  en: string;
}

/** A list of strings available in both locales. */
export interface LocalizedList {
  id: string[];
  en: string[];
}

/** Shorthand for authoring a bilingual string: `ml("Halo", "Hello")`. */
export function ml(id: string, en: string): Localized {
  return { id, en };
}

/** Shorthand for authoring a bilingual list. */
export function mlList(id: string[], en: string[]): LocalizedList {
  return { id, en };
}

export type Dictionary = Record<string, Localized>;
