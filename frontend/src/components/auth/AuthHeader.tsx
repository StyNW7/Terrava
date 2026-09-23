import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

interface AuthHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function AuthHeader({ eyebrow, title, subtitle, showBackButton = true }: AuthHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <div className="mb-8 flex items-center justify-between">
        {showBackButton ? (
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-terrava-muted transition-colors hover:text-terrava-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
            {t("common.backToHome")}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <LanguageToggle className="h-9" />
          <ThemeToggle className="h-9 w-9" />
        </div>
      </div>

      {eyebrow && (
        <span className="mb-3 inline-flex items-center rounded-full bg-terrava-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-terrava-text sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-terrava-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}
