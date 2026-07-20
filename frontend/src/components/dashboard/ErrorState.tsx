import { TriangleAlert, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat mengambil data. Silakan coba lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-terrava-error/30 bg-terrava-error/5 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terrava-error/10 text-terrava-error">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-terrava-text">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-terrava-muted">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
