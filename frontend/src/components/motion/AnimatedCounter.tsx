import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Formatter for the displayed number (defaults to id-ID locale grouping). */
  format?: (value: number) => string;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Counts up from 0 to `value` the first time the element scrolls into view. */
export default function AnimatedCounter({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  format,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    const total = duration * 1000;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / total, 1);
      setDisplay(value * easeOutExpo(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduceMotion]);

  const text = format
    ? format(display)
    : display.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
