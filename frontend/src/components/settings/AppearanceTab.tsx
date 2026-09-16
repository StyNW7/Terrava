import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { SettingsToggleRow } from "@/components/settings/SettingsField";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/context/theme-context";

const themes: { value: ThemePreference; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "Tampilan terang dan bersih", icon: Sun },
  { value: "dark", label: "Dark", description: "Nyaman untuk kondisi minim cahaya", icon: Moon },
  { value: "system", label: "System", description: "Mengikuti pengaturan perangkat", icon: Monitor },
];

export default function AppearanceTab({ onDirty }: { onDirty: () => void }) {
  const { preference: theme, setPreference: setTheme, resolved } = useTheme();
  const [compact, setCompact] = useState(false);
  const [sidebarDefault, setSidebarDefault] = useState(true);
  const [chartAnimation, setChartAnimation] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-terrava-text">Theme</h3>
        <p className="mb-4 text-sm text-terrava-muted">
          Pilih tampilan yang sesuai dengan preferensi Anda. Perubahan diterapkan seketika
          {theme === "system" && ` (saat ini mengikuti sistem: ${resolved === "dark" ? "gelap" : "terang"})`}.
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
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block text-xs ${active ? "text-terrava-primary/80" : "text-terrava-muted"}`}>{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-terrava-text">Display Preferences</h3>
        <div className="divide-y divide-terrava-border">
          <SettingsToggleRow label="Compact Mode" description="Kurangi padding untuk tampilan lebih ringkas" checked={compact} onChange={(v) => { setCompact(v); onDirty(); }} />
          <SettingsToggleRow label="Sidebar Expanded by Default" checked={sidebarDefault} onChange={(v) => { setSidebarDefault(v); onDirty(); }} />
          <SettingsToggleRow label="Chart Animation" checked={chartAnimation} onChange={(v) => { setChartAnimation(v); onDirty(); }} />
        </div>
      </div>
    </div>
  );
}
