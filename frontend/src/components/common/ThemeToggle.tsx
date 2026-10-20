import { useId, useState } from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { originFromElement } from "@/lib/themeTransition";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** Use light foreground colors (for dark/gradient backgrounds). */
  inverted?: boolean;
}

const spring: Transition = { type: "spring", stiffness: 260, damping: 22 };

/** Eight short rays around the sun, as [x1, y1, x2, y2] in a 24px box. */
const rays = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  const [inner, outer] = [7.6, 10.4];
  return [
    12 + Math.cos(angle) * inner,
    12 + Math.sin(angle) * inner,
    12 + Math.cos(angle) * outer,
    12 + Math.sin(angle) * outer,
  ];
});

/** Four-point sparkle centred on (x, y). */
function sparkle(x: number, y: number, size: number) {
  const s = size;
  const k = size * 0.28;
  return `M${x} ${y - s}L${x + k} ${y - k}L${x + s} ${y}L${x + k} ${y + k}L${x} ${y + s}L${x - k} ${y + k}L${x - s} ${y}L${x - k} ${y - k}Z`;
}

const stars = [
  { d: sparkle(19.6, 4.2, 2.1), delay: 0.18 },
  { d: sparkle(21.4, 11.2, 1.3), delay: 0.28 },
];

/**
 * Sun/moon switch. The sun's rays spin away while a shadow slides across the
 * disc to carve the crescent moon, and the page itself is revealed in a circle
 * growing out of this button (see `runThemeTransition`).
 */
export default function ThemeToggle({ className, inverted = false }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();
  const { t } = useLanguage();
  const [burst, setBurst] = useState(0);
  const maskId = `theme-mask-${useId().replace(/:/g, "")}`;

  return (
    <button
      type="button"
      onClick={(event) => {
        setBurst((count) => count + 1);
        toggle(originFromElement(event.currentTarget));
      }}
      aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
      aria-pressed={isDark}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 active:scale-95",
        inverted
          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
          : "border-terrava-border bg-white text-terrava-text hover:border-terrava-primary/40 hover:shadow-glow",
        className
      )}
    >
      {/* Soft halo that matches the current celestial body. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          isDark
            ? "bg-[radial-gradient(circle_at_50%_50%,rgb(165_180_252/0.28),transparent_70%)]"
            : "bg-[radial-gradient(circle_at_50%_50%,rgb(251_191_36/0.28),transparent_70%)]"
        )}
        aria-hidden="true"
      />

      {burst > 0 && (
        <motion.span
          key={burst}
          className={cn(
            "pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full",
            isDark ? "bg-indigo-300/35" : "bg-amber-300/45"
          )}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      )}

      <motion.svg
        viewBox="0 0 24 24"
        className={cn(
          "relative h-5 w-5 overflow-visible transition-colors duration-500",
          inverted ? "text-white" : isDark ? "text-indigo-200" : "text-amber-500"
        )}
        initial={false}
        animate={{ rotate: isDark ? 0 : 90 }}
        transition={spring}
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
            <rect x="-4" y="-4" width="32" height="32" fill="white" />
            <motion.circle
              r="8"
              fill="black"
              initial={false}
              animate={isDark ? { cx: 17, cy: 7.5 } : { cx: 31, cy: -6 }}
              transition={spring}
            />
          </mask>
        </defs>

        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: isDark ? 8.6 : 5 }}
          transition={spring}
        />

        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={isDark ? { opacity: 0, scale: 0.4, rotate: -60 } : { opacity: 1, scale: 1, rotate: 0 }}
          transition={spring}
          style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        >
          {rays.map(([x1, y1, x2, y2], index) => (
            <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </motion.g>

        {stars.map((star) => (
          <motion.path
            key={star.d}
            d={star.d}
            fill="currentColor"
            initial={false}
            animate={isDark ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ ...spring, delay: isDark ? star.delay : 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
      </motion.svg>
    </button>
  );
}
