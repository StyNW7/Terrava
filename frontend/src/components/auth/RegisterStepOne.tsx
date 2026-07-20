import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound, Mail, Phone } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { registerStep1Schema, type RegisterStep1Values } from "@/schemas/authSchemas";

interface RegisterStepOneProps {
  defaultValues: RegisterStep1Values;
  onNext: (values: RegisterStep1Values) => void;
}

export default function RegisterStepOne({ defaultValues, onNext }: RegisterStepOneProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterStep1Values>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues,
  });

  const password = watch("password") ?? "";

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
      <h2 className="text-lg font-semibold text-terrava-text">Informasi Akun</h2>

      <AuthInput
        id="fullName"
        label="Full Name"
        icon={UserRound}
        placeholder="Nama lengkap"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <AuthInput
        id="email"
        label="Email"
        type="email"
        icon={Mail}
        placeholder="nama@perusahaan.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-terrava-text">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terrava-muted" aria-hidden="true" />
          <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-terrava-muted">
            +62
          </span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="812 3456 7890"
            aria-invalid={!!errors.phone}
            className={`w-full rounded-xl border bg-white py-3 pl-[4.75rem] pr-4 text-sm text-terrava-text placeholder:text-terrava-muted/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terrava-primary/25 ${
              errors.phone ? "border-terrava-error focus:border-terrava-error" : "border-terrava-border focus:border-terrava-primary"
            }`}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p role="alert" className="mt-1.5 text-xs text-terrava-error">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Buat password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Ulangi password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover"
      >
        Lanjutkan
      </button>
    </form>
  );
}
