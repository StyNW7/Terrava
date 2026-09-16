import { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPinned } from "lucide-react";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Terrava | Halaman Tidak Ditemukan";
  }, []);

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-md text-center"
      >
        <p className="text-[6rem] font-bold leading-none tracking-tight text-terrava-light sm:text-[8rem]" aria-hidden="true">
          404
        </p>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto -mt-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-terrava-primary shadow-lift"
        >
          <MapPinned className="h-8 w-8" aria-hidden="true" />
        </motion.div>
        <h1 className="text-3xl font-bold text-terrava-text sm:text-4xl">Halaman tidak ditemukan</h1>
        <p className="mt-4 text-sm leading-relaxed text-terrava-muted">
          Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia. Kembali ke beranda atau
          hubungi tim kami untuk bantuan lebih lanjut.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton href="/">Back to Home</PrimaryButton>
          <SecondaryButton href="/contact">Contact Support</SecondaryButton>
        </div>
      </motion.div>
    </section>
  );
}
