import { useEffect } from "react";
import { motion } from "framer-motion";
import { images } from "@/data/images";

const DURATION_MS = 1100;

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="terrava-loading"
      role="status"
      aria-label="Memuat Terrava"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-terrava-bg"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-terrava-light blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-terrava-soft/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <div className="relative">
          <span className="absolute inset-0 -m-3 rounded-3xl bg-terrava-primary/10 animate-ping-slow" aria-hidden="true" />
          <img src={images.logoIcon} alt="Terrava" className="relative h-24 w-24 rounded-2xl object-contain sm:h-28 sm:w-28" />
        </div>
        <p className="mt-6 text-2xl font-bold tracking-tight text-terrava-text">Terrava</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-terrava-muted">
          Smart Livestock Ecosystem
        </p>

        <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-terrava-soft">
          <motion.div
            className="h-full rounded-full bg-terrava-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: DURATION_MS / 1000, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
