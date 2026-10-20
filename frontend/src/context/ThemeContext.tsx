import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext, THEME_STORAGE_KEY } from "@/context/theme-context";
import type { ResolvedTheme, ThemeContextValue, ThemePreference } from "@/context/theme-context";
import { runThemeTransition } from "@/lib/themeTransition";
import type { TransitionOrigin } from "@/lib/themeTransition";

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

function appliedTheme(): ResolvedTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
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

  // Keep the document in sync on first render and persist every choice.
  useEffect(() => {
    applyTheme(resolve(preference));
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore storage errors
    }
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference, origin?: TransitionOrigin) => {
    const target = resolve(next);
    const commit = () => {
      applyTheme(target);
      setPreferenceState(next);
      setResolved(target);
    };
    // Only animate when the visible theme actually changes (light -> system may not).
    if (target === appliedTheme()) commit();
    else runThemeTransition(commit, origin);
  }, []);

  const toggle = useCallback(
    (origin?: TransitionOrigin) => setPreference(appliedTheme() === "dark" ? "light" : "dark", origin),
    [setPreference]
  );

  // Follow OS changes while in "system" mode.
  useEffect(() => {
    if (preference !== "system") return;
    const query = media();
    if (!query) return;
    const handle = () => {
      const next = resolve("system");
      runThemeTransition(() => {
        applyTheme(next);
        setResolved(next);
      });
    };
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, [preference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, isDark: resolved === "dark", setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
