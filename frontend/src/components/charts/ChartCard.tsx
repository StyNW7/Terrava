import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isEmpty?: boolean;
}

export default function ChartCard({ title, description, children, isEmpty = false }: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
      <h3 className="text-base font-semibold text-terrava-text">{title}</h3>
      {description && <p className="mt-1 text-xs text-terrava-muted">{description}</p>}
      <div className="mt-4" role="img" aria-label={title}>
        {isEmpty ? (
          <div className="flex h-64 items-center justify-center rounded-xl bg-terrava-bg text-sm text-terrava-muted">
            Data belum tersedia
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
