import { flushSync } from "react-dom";

/** Viewport point the theme reveal grows from (usually the clicked toggle). */
export interface TransitionOrigin {
  x: number;
  y: number;
}

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionLike;
};

const REVEAL_MS = 750;
const FADE_MS = 550;
const EASE_OUT_EXPO = "cubic-bezier(0.22, 1, 0.36, 1)";

function motionDisabled() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.hasAttribute("data-reduce-motion")
  );
}

/** Centre of an element, used as the origin of the circular reveal. */
export function originFromElement(element: Element | null | undefined): TransitionOrigin | undefined {
  if (!element) return undefined;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Apply a theme change with an animated reveal.
 *
 * Browsers with the View Transitions API get a circular wipe that grows from
 * `origin`, with the old theme gently dimming behind it. Other browsers fall
 * back to a smooth colour crossfade. Reduced-motion users get an instant swap.
 */
export function runThemeTransition(update: () => void, origin?: TransitionOrigin) {
  const root = document.documentElement;
  const doc = document as DocumentWithViewTransition;

  if (motionDisabled()) {
    update();
    return;
  }

  if (typeof doc.startViewTransition !== "function") {
    root.classList.add("theme-fade");
    update();
    window.setTimeout(() => root.classList.remove("theme-fade"), FADE_MS);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  root.classList.add("theme-vt");
  const transition = doc.startViewTransition(() => flushSync(update));

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          filter: ["brightness(1.25) saturate(1.2)", "brightness(1) saturate(1)"],
        },
        { duration: REVEAL_MS, easing: EASE_OUT_EXPO, pseudoElement: "::view-transition-new(root)" }
      );
      root.animate(
        { filter: ["blur(0px) brightness(1)", "blur(3px) brightness(0.75)"] },
        { duration: REVEAL_MS, easing: EASE_OUT_EXPO, pseudoElement: "::view-transition-old(root)" }
      );
    })
    .catch(() => {
      // The transition was skipped; the update has still been applied.
    });

  transition.finished.finally(() => root.classList.remove("theme-vt"));
}
