import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { FeatureItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function FeatureCard({ feature }: { feature: FeatureItem }) {
  const { t, tr } = useLanguage();
  const Icon = feature.icon;

  return (
    <div className="card-hover group flex h-full flex-col rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-terrava-light text-terrava-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-terrava-primary group-hover:text-white group-hover:shadow-glow">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-terrava-text">{feature.title}</h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-terrava-muted">
        {tr(feature.description)}
      </p>
      {feature.href && (
        <Link
          to={feature.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-terrava-primary"
        >
          {t("common.learnMoreShort")}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
