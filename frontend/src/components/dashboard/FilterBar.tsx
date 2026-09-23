import type { ReactNode } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface FilterBarProps {
  children: ReactNode;
}

export default function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
      {children}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="rounded-xl border border-terrava-border bg-white px-3 py-2 text-xs font-medium text-terrava-text focus:border-terrava-primary focus:outline-none"
      >
        <option value="all">{label}: {t("common.all")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
