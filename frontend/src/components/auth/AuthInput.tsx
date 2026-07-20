import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  endAdornment?: ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, hint, endAdornment, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-terrava-text">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terrava-muted"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "w-full rounded-xl border bg-white py-3 text-sm text-terrava-text placeholder:text-terrava-muted/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terrava-primary/25",
              Icon ? "pl-10" : "pl-4",
              endAdornment ? "pr-11" : "pr-4",
              error
                ? "border-terrava-error focus:border-terrava-error"
                : "border-terrava-border focus:border-terrava-primary",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAdornment}</div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-terrava-error">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-xs text-terrava-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";

export default AuthInput;
