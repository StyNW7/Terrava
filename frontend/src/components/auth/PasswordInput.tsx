import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { Eye, EyeOff, LockKeyhole, TriangleAlert } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, onKeyUp, onBlur, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
      setCapsLock(event.getModifierState?.("CapsLock") ?? false);
      onKeyUp?.(event);
    };

    return (
      <div>
        <AuthInput
          ref={ref}
          label={label}
          error={error}
          hint={hint}
          icon={LockKeyhole}
          type={visible ? "text" : "password"}
          onKeyUp={handleKeyUp}
          onBlur={(event) => {
            setCapsLock(false);
            onBlur?.(event);
          }}
          endAdornment={
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-terrava-muted transition-colors hover:bg-terrava-bg hover:text-terrava-primary"
            >
              {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          }
          {...props}
        />
        {capsLock && !error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-terrava-warning" role="status">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Caps Lock aktif
          </p>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
