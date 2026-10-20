import { useEffect } from "react";

const SELECTOR = ".card-hover, .spotlight";

/**
 * One document-level listener that feeds the cursor position to whichever
 * spotlight card is under the pointer (as --spot-x / --spot-y), so the glow
 * in index.css can follow the mouse without per-card handlers.
 */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const event = lastEvent;
      if (!event || !(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>(SELECTOR);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    };

    const handleMove = (event: PointerEvent) => {
      lastEvent = event;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handleMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
