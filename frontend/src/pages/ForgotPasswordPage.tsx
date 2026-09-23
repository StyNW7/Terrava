import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LoaderCircle, CircleCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/authSchemas";
import { useLanguage } from "@/hooks/useLanguage";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Forgot Password | Terrava";
  }, []);

  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSent(true);
  };

  return (
    <AuthLayout
      panelVariant="forgot"
      eyebrow={t("auth.forgot.eyebrow")}
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footerText={t("auth.forgot.footerText")}
      footerLinkText={t("auth.login.submit")}
      footerLinkPath="/login"
    >
      {isSent ? (
        <div className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-8 text-center animate-fade-in-up">
          <CircleCheck className="mb-4 h-12 w-12 text-terrava-primary" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-terrava-text">
            {t("auth.forgot.sent")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <AuthInput
            id="email"
            label={t("auth.field.email")}
            type="email"
            icon={Mail}
            placeholder={t("auth.placeholder.email")}
            autoComplete="email"
            error={errors.email?.message && t(errors.email.message)}
            {...register("email")}
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
                {t("auth.forgot.sending")}
              </>
            ) : (
              t("auth.forgot.submit")
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
