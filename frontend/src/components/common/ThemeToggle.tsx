import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** Use light foreground colors (for dark/gradient backgrounds). */
  inverted?: boolean;
}

/** Animated sun/moon switch between light and dark mode. */
export default function ThemeToggle({ className, inverted = false }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
      aria-pressed={isDark}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300",
        inverted
          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
          : "border-terrava-border bg-white text-terrava-text hover:border-terrava-primary/40 hover:text-terrava-primary",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex"
        >
          {isDark ? <Moon className="h-[18px] w-[18px]" aria-hidden="true" /> : <Sun className="h-[18px] w-[18px]" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
