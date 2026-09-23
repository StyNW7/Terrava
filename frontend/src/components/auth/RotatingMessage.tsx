import { useEffect, useState } from "react";
import { rotatingMessages } from "@/data/auth";
import { useLanguage } from "@/hooks/useLanguage";

export default function RotatingMessage() {
  const { trList } = useLanguage();
  const messages = trList(rotatingMessages);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="h-6 overflow-hidden">
      <p key={index} className="animate-fade-in-up text-sm font-medium text-white/90">
        {messages[index % messages.length]}
      </p>
    </div>
  );
}
