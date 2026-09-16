import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  once?: boolean;
  /** Portion of the element that must be visible before animating (0-1). */
  amount?: number;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Fades and slides its children into view when they enter the viewport.
 * Respects the user's reduced-motion preference.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 24,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, x: offset.x * distance, y: offset.y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
