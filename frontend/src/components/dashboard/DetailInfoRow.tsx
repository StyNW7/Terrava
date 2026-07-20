import type { LucideIcon } from "lucide-react";

interface DetailInfoRowProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
}

export default function DetailInfoRow({ icon: Icon, label, value }: DetailInfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-terrava-muted">
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-sm font-medium text-terrava-text">{value}</span>
    </div>
  );
}
