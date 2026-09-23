import { createContext } from "react";
import type { Language, Localized, LocalizedList } from "@/i18n/types";

export interface LanguageContextValue {
  /** The active locale. */
  lang: Language;
  setLanguage: (language: Language) => void;
  /** Flip between Indonesian and English. */
  toggle: () => void;
  /** Look up a dictionary key, with optional `{placeholder}` values. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Resolve an inline bilingual string coming from a data file. */
  tr: (value: Localized) => string;
  /** Resolve an inline bilingual list coming from a data file. */
  trList: (value: LocalizedList) => string[];
  /** Translate a canonical term stored in data, e.g. `tt("status", "Healthy")`. */
  tt: (namespace: string, value: string) => string;
  /** Localize a canonical relative timestamp, e.g. `tRel("3 hours ago")`. */
  tRel: (value: string) => string;
}

export const LANGUAGE_STORAGE_KEY = "terrava-language";

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
