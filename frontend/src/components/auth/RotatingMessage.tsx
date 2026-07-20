import { useEffect, useState } from "react";
import { rotatingMessages } from "@/data/auth";

export default function RotatingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingMessages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 overflow-hidden">
      <p key={index} className="animate-fade-in-up text-sm font-medium text-white/90">
        {rotatingMessages[index]}
      </p>
    </div>
  );
}
