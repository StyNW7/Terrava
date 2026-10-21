import { useEffect, useState, type RefObject } from "react";

/**
 * Becomes `true` once the element comes within `margin` of the viewport and
 * stays true, so heavy widgets (3D scenes) only load when a visitor scrolls
 * towards them.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "600px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, near]);

  return near;
}
