import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, LoaderCircle, CircleAlert, Chrome, AppWindow, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import DemoAccountCard from "@/components/auth/DemoAccountCard";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchemas";
import { useAuth } from "@/hooks/useAuth";
import { primaryDemoAccount, toAuthUser } from "@/data/demoAccounts";
import type { DemoAccount } from "@/data/demoAccounts";
import { useLanguage } from "@/hooks/useLanguage";

const firstName = (name: string) => name.replace(/^(drh\.|dr\.|ir\.)\s*/i, "").split(" ")[0];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAs } = useAuth();
  const { t } = useLanguage();
  const [authError, setAuthError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [quickLoading, setQuickLoading] = useState<"demo" | "google" | "microsoft" | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    document.title = "Login | Terrava";
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const busy = isSubmitting || quickLoading !== null;

  const finishLogin = (name: string) => {
    toast.success(t("auth.welcomeBack", { name: firstName(name) }));
    navigate(redirectTo, { replace: true });
  };

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    const result = await login(values.email, values.password, values.rememberMe);

    if (result.ok) {
      finishLogin(result.user?.name ?? values.email.split("@")[0]);
      return;
    }

    setAuthError(t(result.message ?? "auth.error.generic"));
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const fillDemo = (account: DemoAccount) => {
    setAuthError(null);
    clearErrors();
    setValue("email", account.email, { shouldValidate: false, shouldDirty: true });
    setValue("password", account.password, { shouldValidate: false, shouldDirty: true });
    toast.success(t("auth.demo.filled"));
  };

  const quickLogin = async (account: DemoAccount) => {
    setAuthError(null);
    setQuickLoading("demo");
    await new Promise((resolve) => setTimeout(resolve, 800));
    loginAs(toAuthUser(account), true);
    setQuickLoading(null);
    finishLogin(account.name);
  };

  const socialLogin = async (provider: "google" | "microsoft") => {
    setAuthError(null);
    setQuickLoading(provider);
    const label = provider === "google" ? "Google" : "Microsoft";
    const pending = toast.loading(t("auth.social.connecting", { provider: label }));
    await new Promise((resolve) => setTimeout(resolve, 1300));
    toast.dismiss(pending);
    loginAs(toAuthUser(primaryDemoAccount), true);
    setQuickLoading(null);
    toast.success(t("auth.social.signedIn", { provider: label }));
    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthLayout
      panelVariant="login"
      eyebrow={t("auth.login.eyebrow")}
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footerText={t("auth.login.footerText")}
      footerLinkText={t("auth.login.footerLink")}
      footerLinkPath="/register"
    >
      <div className="mb-6">
        <DemoAccountCard onFill={fillDemo} onQuickLogin={quickLogin} disabled={busy} />
      </div>

      <div className="relative mb-6 text-center">
        <span className="relative bg-terrava-bg px-3 text-xs font-medium uppercase tracking-wide text-terrava-muted">
          {t("auth.login.orManual")}
        </span>
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-terrava-border" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={`space-y-5 ${shake ? "animate-shake" : ""}`}>
        <AnimatePresence>
          {authError && (
            <motion.div
              key="auth-error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-terrava-error/30 bg-terrava-error/10 px-4 py-3 text-sm text-terrava-error"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {authError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <div>
          <PasswordInput
            id="password"
            label={t("auth.field.password")}
            placeholder={t("auth.placeholder.password")}
            autoComplete="current-password"
            error={errors.password?.message && t(errors.password.message)}
            {...register("password")}
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-terrava-text">
              <input type="checkbox" className="h-4 w-4 rounded accent-terrava-primary" {...register("rememberMe")} />
              {t("auth.login.rememberMe")}
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-terrava-primary hover:text-terrava-hover">
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={isSubmitting}
          className="group inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("auth.login.verifying")}
            </>
          ) : (
            <>
              {t("auth.login.submit")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </button>

        <div className="relative py-1 text-center">
          <span className="relative bg-terrava-bg px-3 text-xs font-medium uppercase tracking-wide text-terrava-muted">
            {t("auth.login.orContinueWith")}
          </span>
          <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-terrava-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialLoginButton
            icon={Chrome}
            label={t("auth.social.google")}
            loading={quickLoading === "google"}
            disabled={busy}
            onClick={() => socialLogin("google")}
          />
          <SocialLoginButton
            icon={AppWindow}
            label={t("auth.social.microsoft")}
            loading={quickLoading === "microsoft"}
            disabled={busy}
            onClick={() => socialLogin("microsoft")}
          />
        </div>

        <p className="text-center text-xs leading-relaxed text-terrava-muted">
          {t("auth.login.terms")}
        </p>
      </form>
    </AuthLayout>
  );
}
