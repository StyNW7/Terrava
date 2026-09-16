import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-terrava-border bg-white px-6 py-3 text-sm font-semibold text-terrava-text transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-terrava-primary hover:text-terrava-primary hover:shadow-card active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terrava-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    if (href) {
      return (
        <Link to={href} className={cn(baseClasses, className)}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cn(baseClasses, className)} {...props}>
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;
