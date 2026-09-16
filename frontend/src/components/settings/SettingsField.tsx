import type { ReactNode } from "react";

export function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6">
      <h3 className="text-base font-semibold text-terrava-text">{title}</h3>
      {description && <p className="mt-1 text-sm text-terrava-muted">{description}</p>}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function SettingsField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-terrava-text">{label}</label>
      {children}
    </div>
  );
}

export const settingsInputClass =
  "w-full rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20";

export function SettingsToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-terrava-text">{label}</p>
        {description && <p className="text-xs text-terrava-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-terrava-primary" : "bg-terrava-border dark:bg-terrava-neutral/40"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-terrava-text ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
