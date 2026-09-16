import { createContext } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** What the user chose: light, dark, or follow the OS. */
  preference: ThemePreference;
  /** The theme actually applied to the document. */
  resolved: ResolvedTheme;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

export const THEME_STORAGE_KEY = "terrava-theme";

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
