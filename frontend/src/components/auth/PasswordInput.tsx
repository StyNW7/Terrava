import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <AuthInput
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        icon={LockKeyhole}
        type={visible ? "text" : "password"}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-terrava-muted transition-colors hover:text-terrava-primary"
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        }
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
