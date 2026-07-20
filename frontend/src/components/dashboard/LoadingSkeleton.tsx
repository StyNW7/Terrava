interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "chart" | "text";
  rows?: number;
}

export default function LoadingSkeleton({ variant = "text", rows = 5 }: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-terrava-border bg-white">
        <div className="h-11 animate-pulse bg-terrava-bg" />
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-t border-terrava-border px-4 py-3.5">
            <div className="h-9 w-9 animate-pulse rounded-full bg-terrava-bg" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-terrava-bg" />
            <div className="h-3 w-1/6 animate-pulse rounded bg-terrava-bg" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-terrava-bg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl border border-terrava-border bg-terrava-bg" />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return <div className="h-64 w-full animate-pulse rounded-2xl bg-terrava-bg" />;
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-3.5 w-full animate-pulse rounded bg-terrava-bg" />
      ))}
    </div>
  );
}
