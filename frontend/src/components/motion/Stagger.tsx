import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Children } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's animation. */
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
}

const groupVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/** Wraps a grid or list so that each StaggerItem child animates in sequence. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  once = true,
  amount = 0.15,
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      variants={groupVariants(stagger, delay)}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

interface StaggerGridProps extends StaggerGroupProps {
  /** Class applied to the wrapper placed around every direct child. */
  itemClassName?: string;
}

/**
 * Drop-in replacement for a grid container: keeps the container's classes and
 * animates each direct child in sequence without needing explicit StaggerItems.
 */
export function StaggerGrid({ children, itemClassName = "h-full", ...groupProps }: StaggerGridProps) {
  return (
    <StaggerGroup {...groupProps}>
      {Children.map(children, (child) =>
        child === null || child === undefined || typeof child === "boolean" ? null : (
          <motion.div variants={itemVariants} className={itemClassName}>
            {child}
          </motion.div>
        )
      )}
    </StaggerGroup>
  );
}
