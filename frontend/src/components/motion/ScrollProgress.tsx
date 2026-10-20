import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/** Thin brand-gradient bar that fills as the page is scrolled. */
export default function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      className={cn(
        "pointer-events-none h-0.5 origin-left bg-gradient-to-r from-terrava-primary via-terrava-success to-emerald-300",
        className
      )}
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
