import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";

export interface TimelineItem {
  id: string;
  label: string;
  timestamp: string;
  icon?: LucideIcon;
  description?: string;
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-0">
      {items.map((item, index) => {
        const Icon = item.icon ?? Circle;
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-6">
            {!isLast && <span className="absolute left-[15px] top-8 h-full w-px bg-terrava-border" aria-hidden="true" />}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terrava-light text-terrava-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-terrava-text">{item.label}</p>
              {item.description && <p className="mt-0.5 text-xs text-terrava-muted">{item.description}</p>}
              <p className="mt-0.5 text-xs text-terrava-muted">{item.timestamp}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
