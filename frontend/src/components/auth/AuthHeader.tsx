import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { images } from "@/data/images";

interface AuthHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export default function AuthHeader({ eyebrow, title, subtitle, showBackButton = true }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-8 flex items-center justify-between lg:justify-start">
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <img src={images.logoIcon} alt="Terrava logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-terrava-text">Terrava</span>
        </Link>

        {showBackButton && (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-terrava-muted transition-colors hover:text-terrava-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        )}
      </div>

      {eyebrow && (
        <span className="mb-3 inline-flex items-center rounded-full bg-terrava-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-terrava-primary">
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl font-bold text-terrava-text sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-terrava-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}
