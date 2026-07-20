import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { SettingsToggleRow } from "@/components/settings/SettingsField";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function AppearanceTab({ onDirty }: { onDirty: () => void }) {
  const [theme, setTheme] = useState("light");
  const [compact, setCompact] = useState(false);
  const [sidebarDefault, setSidebarDefault] = useState(true);
  const [chartAnimation, setChartAnimation] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-terrava-border bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-terrava-text">Theme</h3>
        <p className="mb-4 text-sm text-terrava-muted">Pilih tampilan yang sesuai dengan preferensi Anda.</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setTheme(item.value);
                onDirty();
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium ${
                theme === item.value ? "border-terrava-primary bg-terrava-light text-terrava-primary" : "border-terrava-border text-terrava-text hover:bg-terrava-bg"
              }`}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </button>
          ))}
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
