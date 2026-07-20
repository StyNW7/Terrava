import { useEffect } from "react";
import { Sprout } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";

export default function OnboardingPage() {
  useEffect(() => {
    document.title = "Onboarding | Terrava";
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-terrava-bg px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-terrava-light text-terrava-primary">
        <Sprout className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold text-terrava-text sm:text-4xl">Akun Anda sudah siap</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-terrava-muted">
        Langkah onboarding lengkap untuk menghubungkan perangkat dan tim peternakan akan tersedia pada
        rilis berikutnya.
      </p>
      <PrimaryButton href="/dashboard" className="mt-8">
        Masuk ke Dashboard
      </PrimaryButton>
    </section>
  );
}
