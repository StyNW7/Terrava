import type { ReactNode } from "react";
import { Download, Maximize2 } from "lucide-react";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isEmpty?: boolean;
  loading?: boolean;
  actions?: ReactNode;
  onExport?: () => void;
  onExpand?: () => void;
}

export default function ChartCard({
  title,
  description,
  children,
  isEmpty = false,
  loading = false,
  actions,
  onExport,
  onExpand,
}: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-terrava-text">{title}</h3>
          {description && <p className="mt-1 text-xs text-terrava-muted">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          {onExport && (
            <button type="button" onClick={onExport} aria-label={`Export ${title}`} className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg hover:text-terrava-primary">
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {onExpand && (
            <button type="button" onClick={onExpand} aria-label={`Expand ${title}`} className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg hover:text-terrava-primary">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4" role="img" aria-label={title}>
        {loading ? (
          <LoadingSkeleton variant="chart" />
        ) : isEmpty ? (
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
