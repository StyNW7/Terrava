import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults?: number;
  pageSize?: number;
}

export default function Pagination({ page, totalPages, onPageChange, totalResults, pageSize }: PaginationProps) {
  const start = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const end = pageSize && totalResults ? Math.min(page * pageSize, totalResults) : undefined;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-terrava-border px-4 py-3.5 sm:flex-row">
      {totalResults !== undefined && (
        <p className="text-xs text-terrava-muted">
          Menampilkan {start}-{end} dari {totalResults} hasil
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-terrava-border text-terrava-text hover:bg-terrava-bg disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="px-2 text-xs font-medium text-terrava-text">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-terrava-border text-terrava-text hover:bg-terrava-bg disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
