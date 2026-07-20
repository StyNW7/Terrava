import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";

export interface ActivityFeedItem {
  id: string;
  icon?: LucideIcon;
  title: string;
  timestamp: string;
  actor?: string;
}

export default function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon ?? Activity;
        return (
          <li key={item.id} className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-terrava-bg">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terrava-light text-terrava-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-terrava-text">{item.title}</p>
              <p className="text-xs text-terrava-muted">
                {item.actor ? `${item.actor} · ` : ""}
                {item.timestamp}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
