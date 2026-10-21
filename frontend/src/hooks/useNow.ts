import { useEffect, useState } from "react";

/**
 * The current time from the visitor's device clock, re-rendering on every
 * whole second (aligned to the second boundary so a clock never lags).
 */
export function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(tick, 1000 - current.getMilliseconds());
    };
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
    // Catch up immediately after the tab was hidden or the device slept.
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return now;
}
