import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Mail, LoaderCircle, CircleAlert, Chrome, AppWindow } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchemas";

const DEMO_EMAIL = "demo@terrava.id";
const DEMO_PASSWORD = "Terrava123";

export default function LoginPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.title = "Login | Terrava";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (values.email === DEMO_EMAIL && values.password === DEMO_PASSWORD) {
      navigate("/dashboard");
      return;
    }

    setAuthError("Email atau password tidak sesuai. Silakan coba kembali.");
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <AuthLayout
      panelVariant="login"
      eyebrow="Welcome Back"
      title="Masuk ke Terrava"
      subtitle="Akses dashboard peternakan Anda."
      footerText="Belum memiliki akun?"
      footerLinkText="Daftar sekarang"
      footerLinkPath="/register"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={`space-y-5 ${shake ? "animate-shake" : ""}`}>
        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-terrava-error/30 bg-terrava-error/10 px-4 py-3 text-sm text-terrava-error"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {authError}
          </div>
        )}

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
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2 text-right">
            <a href="/forgot-password" className="text-sm font-medium text-terrava-primary hover:text-terrava-hover">
              Lupa password?
            </a>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-terrava-text">
          <input type="checkbox" className="h-4 w-4 accent-terrava-primary" {...register("rememberMe")} />
          Ingat saya
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
          style={{ height: 54 }}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </button>

        <div className="relative py-1 text-center">
          <span className="relative bg-terrava-bg px-3 text-xs font-medium uppercase tracking-wide text-terrava-muted">
            atau lanjutkan dengan
          </span>
          <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-terrava-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialLoginButton icon={Chrome} label="Continue with Google" />
          <SocialLoginButton icon={AppWindow} label="Continue with Microsoft" />
        </div>

        <p className="text-center text-xs leading-relaxed text-terrava-muted">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Terrava.
        </p>
      </form>
    </AuthLayout>
  );
}
