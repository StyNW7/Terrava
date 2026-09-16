import type { LucideIcon } from "lucide-react";
import { LoaderCircle } from "lucide-react";

interface SocialLoginButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function SocialLoginButton({ icon: Icon, label, onClick, loading = false, disabled = false }: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-terrava-border bg-white px-4 py-3 text-sm font-medium text-terrava-text transition-all duration-200 hover:-translate-y-0.5 hover:border-terrava-primary/40 hover:shadow-card disabled:pointer-events-none disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin text-terrava-primary" aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
