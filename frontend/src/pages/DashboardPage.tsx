import { useEffect } from "react";
import { LayoutDashboard } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard | Terrava";
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-terrava-bg px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-terrava-light text-terrava-primary">
        <LayoutDashboard className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold text-terrava-text sm:text-4xl">Selamat datang di Terrava</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-terrava-muted">
        Dashboard operasional peternakan Anda sedang disiapkan untuk versi prototype ini.
      </p>
      <PrimaryButton href="/" className="mt-8">
        Kembali ke Beranda
      </PrimaryButton>
    </section>
  );
}
