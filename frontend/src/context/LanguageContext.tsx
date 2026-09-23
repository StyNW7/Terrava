import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, LANGUAGE_STORAGE_KEY } from "@/context/language-context";
import type { LanguageContextValue } from "@/context/language-context";
import type { Language, Localized, LocalizedList } from "@/i18n/types";
import { formatRelative, translate, translateTerm } from "@/i18n";

function readLanguage(): Language {
  if (typeof window === "undefined") return "id";
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "id" || stored === "en") return stored;
  } catch {
    // ignore storage errors
  }
  // Indonesian is the primary audience, so it stays the default until a
  // visitor picks otherwise.
  return "id";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => readLanguage());

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const setLanguage = useCallback((next: Language) => setLangState(next), []);
  const toggle = useCallback(() => setLangState((current) => (current === "id" ? "en" : "id")), []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLanguage,
      toggle,
      t: (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
      tr: (value: Localized) => (value ? value[lang] ?? value.id : ""),
      trList: (value: LocalizedList) => (value ? value[lang] ?? value.id : []),
      tt: (namespace: string, value: string) => translateTerm(lang, namespace, value),
      tRel: (value: string) => formatRelative(lang, value),
    }),
    [lang, setLanguage, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
