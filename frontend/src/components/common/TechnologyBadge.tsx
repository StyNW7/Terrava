import type { LucideIcon } from "lucide-react";

interface TechnologyBadgeProps {
  icon: LucideIcon;
  label: string;
}

export default function TechnologyBadge({ icon: Icon, label }: TechnologyBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-terrava-border bg-white px-4 py-2 text-sm font-medium text-terrava-text shadow-sm">
      <Icon className="h-4 w-4 text-terrava-primary" aria-hidden="true" />
      {label}
    </div>
  );
}
