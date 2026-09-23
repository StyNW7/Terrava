import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { Language } from "@/i18n/types";
import { cn } from "@/lib/utils";

interface LanguageOption {
  code: Language;
  short: string;
  label: string;
  native: string;
}

const options: LanguageOption[] = [
  { code: "id", short: "ID", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "en", short: "EN", label: "English", native: "English" },
];

interface LanguageToggleProps {
  className?: string;
  /** Use light foreground colors (for dark/gradient backgrounds). */
  inverted?: boolean;
  /** Render as a plain switch instead of a dropdown. */
  compact?: boolean;
}

/** Globe menu that swaps the whole interface between Indonesian and English. */
export default function LanguageToggle({ className, inverted = false, compact = false }: LanguageToggleProps) {
  const { lang, setLanguage, toggle, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const current = options.find((option) => option.code === lang) ?? options[0];

  const triggerClass = cn(
    "relative flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all duration-300",
    inverted
      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
      : "border-terrava-border bg-white text-terrava-text hover:border-terrava-primary/40 hover:text-terrava-primary",
    className
  );

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        className={triggerClass}
        aria-label={t("language.switchTo", { language: lang === "id" ? "English" : "Bahasa Indonesia" })}
        title={t("language.switchTo", { language: lang === "id" ? "English" : "Bahasa Indonesia" })}
      >
        <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
        <span>{current.short}</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("language.change")}
        title={t("language.change")}
      >
        <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
        <span>{current.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("language.change")}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-terrava-border bg-white p-1.5 shadow-lg"
          >
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-terrava-muted">
              {t("language.change")}
            </p>
            {options.map((option) => {
              const active = option.code === lang;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLanguage(option.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active ? "bg-terrava-light text-terrava-primary" : "text-terrava-text hover:bg-terrava-light/60"
                  )}
                >
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium">{option.native}</span>
                    <span className="text-[11px] text-terrava-muted">{option.label}</span>
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : <span className="text-[11px] font-semibold text-terrava-muted">{option.short}</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
