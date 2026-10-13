import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import {
  SettingsContext,
  SETTINGS_STORAGE_KEY,
  SIDEBAR_STORAGE_KEY,
  defaultSettings,
  type AppSettings,
} from "@/context/settings-context";

function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const saved = JSON.parse(raw) as Partial<AppSettings>;
    // Merge section by section so settings added later get their defaults.
    return {
      profile: { ...defaultSettings.profile, ...saved.profile },
      farm: { ...defaultSettings.farm, ...saved.farm },
      notifications: { ...defaultSettings.notifications, ...saved.notifications },
      thresholds: { ...defaultSettings.thresholds, ...saved.thresholds },
      appearance: { ...defaultSettings.appearance, ...saved.appearance },
      privacy: { ...defaultSettings.privacy, ...saved.privacy },
      security: { ...defaultSettings.security, ...saved.security },
    };
  } catch {
    return defaultSettings;
  }
}

/** User preferences saved in the browser and applied across the app. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readSettings);

  // Compact mode scales every rem-based size down slightly.
  useEffect(() => {
    document.documentElement.style.fontSize = settings.appearance.compact ? "15px" : "";
  }, [settings.appearance.compact]);

  const saveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!next.appearance.sidebarExpanded));
      // Let a mounted sidebar pick up the new default immediately.
      window.dispatchEvent(new Event("terrava-sidebar-change"));
    } catch {
      // Storage unavailable: settings still apply for this session.
    }
  }, []);

  const resetSettings = useCallback(() => {
    try {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(() => ({ settings, saveSettings, resetSettings }), [settings, saveSettings, resetSettings]);

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion={settings.appearance.animations ? "user" : "always"}>{children}</MotionConfig>
    </SettingsContext.Provider>
  );
}
