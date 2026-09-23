import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function BackToTopButton() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > 400);
      setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("common.backToTop")}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-terrava-primary text-white shadow-lift"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
