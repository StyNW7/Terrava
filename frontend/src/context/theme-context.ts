import { createContext } from "react";
import type { TransitionOrigin } from "@/lib/themeTransition";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** What the user chose: light, dark, or follow the OS. */
  preference: ThemePreference;
  /** The theme actually applied to the document. */
  resolved: ResolvedTheme;
  isDark: boolean;
  /** Change the theme; `origin` is where the animated reveal starts. */
  setPreference: (preference: ThemePreference, origin?: TransitionOrigin) => void;
  toggle: (origin?: TransitionOrigin) => void;
}

export const THEME_STORAGE_KEY = "terrava-theme";

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
