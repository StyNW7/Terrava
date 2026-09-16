import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext, THEME_STORAGE_KEY } from "@/context/theme-context";
import type { ResolvedTheme, ThemeContextValue, ThemePreference } from "@/context/theme-context";

const media = () => (typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null);

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // ignore storage errors
  }
  return "light";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return media()?.matches ? "dark" : "light";
  return preference;
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0B1611" : "#F7FAF8";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readPreference());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readPreference()));

  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore storage errors
    }
  }, [preference]);

  // Follow OS changes while in "system" mode.
  useEffect(() => {
    if (preference !== "system") return;
    const query = media();
    if (!query) return;
    const handle = () => {
      const next = resolve("system");
      setResolved(next);
      applyTheme(next);
    };
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => setPreferenceState(next), []);
  const toggle = useCallback(() => {
    setPreferenceState((current) => (resolve(current) === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, isDark: resolved === "dark", setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
