import { CheckCircle2 } from "lucide-react";
import type { SolutionItem } from "@/types";
import ImageWithOverlay from "@/components/common/ImageWithOverlay";
import { useLanguage } from "@/hooks/useLanguage";

export default function SolutionCard({
  solution,
  reverse = false,
}: {
  solution: SolutionItem;
  reverse?: boolean;
}) {
  const { t, tr, trList } = useLanguage();
  const Icon = solution.icon;

  return (
    <div
      className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <ImageWithOverlay
        src={solution.image}
        alt={t("solutions.illustrationAlt", { title: solution.title })}
        className="aspect-[4/3]"
      />
      <div>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-terrava-text">{solution.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-terrava-muted">
          <span className="font-semibold text-terrava-text">{t("solutions.problemLabel")} </span>
          {tr(solution.problem)}
        </p>
        <p className="mb-5 text-sm leading-relaxed text-terrava-muted">
          <span className="font-semibold text-terrava-text">{t("solutions.solutionLabel")} </span>
          {tr(solution.solution)}
        </p>
        <ul className="mb-5 space-y-2">
          {trList(solution.capabilities).map((capability) => (
            <li key={capability} className="flex items-start gap-2 text-sm text-terrava-text">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />
              {capability}
            </li>
          ))}
        </ul>
        <div className="rounded-xl bg-terrava-light px-4 py-3 text-sm font-medium text-terrava-dark">
          {tr(solution.benefit)}
        </div>
      </div>
    </div>
  );
}
