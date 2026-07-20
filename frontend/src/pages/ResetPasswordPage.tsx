import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, CircleCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import PrimaryButton from "@/components/common/PrimaryButton";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/authSchemas";

export default function ResetPasswordPage() {
  useEffect(() => {
    document.title = "Reset Password | Terrava";
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password") ?? "";

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
  };

  return (
    <AuthLayout
      panelVariant="reset"
      eyebrow="New Password"
      title="Perbarui Password"
      subtitle="Buat password baru yang kuat untuk mengamankan akun Terrava Anda."
      showBackButton={!isSuccess}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-8 text-center animate-fade-in-up">
          <CircleCheck className="mb-4 h-12 w-12 text-terrava-primary" aria-hidden="true" />
          <p className="mb-6 text-sm leading-relaxed text-terrava-text">Password berhasil diperbarui.</p>
          <PrimaryButton href="/login" showArrow={false}>
            Masuk ke Terrava
          </PrimaryButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <PasswordInput
              id="password"
              label="New Password"
              placeholder="Masukkan password baru"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="Ulangi password baru"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              "Perbarui Password"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
