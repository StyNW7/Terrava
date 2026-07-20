import { useEffect } from "react";
import { MapPinned } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Terrava | Halaman Tidak Ditemukan";
  }, []);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-terrava-light text-terrava-primary">
          <MapPinned className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-terrava-text sm:text-4xl">Halaman tidak ditemukan</h1>
        <p className="mt-4 text-sm leading-relaxed text-terrava-muted">
          Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia. Kembali ke beranda atau
          hubungi tim kami untuk bantuan lebih lanjut.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton href="/">Back to Home</PrimaryButton>
          <SecondaryButton href="/contact">Contact Support</SecondaryButton>
        </div>
      </div>
    </section>
  );
}
