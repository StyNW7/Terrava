import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  showArrow?: boolean;
}

const baseClasses =
  "group inline-flex items-center justify-center gap-2 rounded-xl bg-terrava-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-terrava-hover hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terrava-primary focus-visible:ring-offset-2 disabled:opacity-50";

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, href, showArrow = true, ...props }, ref) => {
    if (href) {
      return (
        <Link to={href} className={cn(baseClasses, className)}>
          {children}
          {showArrow && (
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cn(baseClasses, className)} {...props}>
        {children}
        {showArrow && (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
