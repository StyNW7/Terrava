export default function HealthScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-terrava-primary/10 text-terrava-primary"
      : score >= 60
      ? "bg-terrava-warning/10 text-terrava-warning"
      : "bg-terrava-error/10 text-terrava-error";

  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${tone}`}>
      {score}
    </span>
  );
}
