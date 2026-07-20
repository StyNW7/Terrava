import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-terrava-border bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terrava-bg text-terrava-muted">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-terrava-text">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-terrava-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
