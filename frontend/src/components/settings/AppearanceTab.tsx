import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { SettingsToggleRow } from "@/components/settings/SettingsField";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/context/theme-context";
import { useLanguage } from "@/hooks/useLanguage";

const themes: { value: ThemePreference; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export default function AppearanceTab({ onDirty }: { onDirty: () => void }) {
  const { preference: theme, setPreference: setTheme, resolved } = useTheme();
  const { t } = useLanguage();
  const [compact, setCompact] = useState(false);
  const [sidebarDefault, setSidebarDefault] = useState(true);
  const [chartAnimation, setChartAnimation] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-terrava-text">{t("settings.appearance.theme")}</h3>
        <p className="mb-4 text-sm text-terrava-muted">
          {t("settings.appearance.themeDescription")}
          {theme === "system" &&
            ` ${t("settings.appearance.followingSystem", {
              mode: resolved === "dark" ? t("theme.dark") : t("theme.light"),
            })}`}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themes.map((item) => {
            const active = theme === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                aria-pressed={active}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 sm:flex-col sm:items-center sm:text-center ${
                  active
                    ? "border-terrava-primary bg-terrava-light text-terrava-primary shadow-glow"
                    : "border-terrava-border text-terrava-text hover:border-terrava-primary/40 hover:bg-terrava-bg"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active ? "bg-terrava-primary text-white" : "bg-terrava-bg text-terrava-muted group-hover:text-terrava-primary"
                  }`}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t("settings.theme." + item.value + ".label")}</span>
                  <span className={`block text-xs ${active ? "text-terrava-primary/80" : "text-terrava-muted"}`}>
                    {t("settings.theme." + item.value + ".description")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">{t("settings.appearance.displayPreferences")}</h3>
        <div className="divide-y divide-terrava-border">
          <SettingsToggleRow label={t("settings.appearance.compactMode")} description={t("settings.appearance.compactModeDescription")} checked={compact} onChange={(v) => { setCompact(v); onDirty(); }} />
          <SettingsToggleRow label={t("settings.appearance.sidebarExpanded")} checked={sidebarDefault} onChange={(v) => { setSidebarDefault(v); onDirty(); }} />
          <SettingsToggleRow label={t("settings.appearance.chartAnimation")} checked={chartAnimation} onChange={(v) => { setChartAnimation(v); onDirty(); }} />
        </div>
      </div>
    </div>
  );
}
