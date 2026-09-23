import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, CircleCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import PrimaryButton from "@/components/common/PrimaryButton";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/authSchemas";
import { useLanguage } from "@/hooks/useLanguage";

export default function ResetPasswordPage() {
  const { t } = useLanguage();

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
      eyebrow={t("auth.reset.eyebrow")}
      title={t("auth.reset.title")}
      subtitle={t("auth.reset.subtitle")}
      showBackButton={!isSuccess}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-8 text-center animate-fade-in-up">
          <CircleCheck className="mb-4 h-12 w-12 text-terrava-primary" aria-hidden="true" />
          <p className="mb-6 text-sm leading-relaxed text-terrava-text">{t("auth.reset.success")}</p>
          <PrimaryButton href="/login" showArrow={false}>
            {t("auth.reset.goToLogin")}
          </PrimaryButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <PasswordInput
              id="password"
              label={t("auth.field.newPassword")}
              placeholder={t("auth.placeholder.newPasswordEnter")}
              autoComplete="new-password"
              error={errors.password?.message && t(errors.password.message)}
              {...register("password")}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            id="confirmPassword"
            label={t("auth.field.confirmNewPassword")}
            placeholder={t("auth.placeholder.confirmNewPassword")}
            autoComplete="new-password"
            error={errors.confirmPassword?.message && t(errors.confirmPassword.message)}
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
                {t("auth.processing")}
              </>
            ) : (
              t("auth.reset.submit")
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
