import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the scroll position on every route change. The jump is instant so it
 * happens underneath the page transition instead of visibly scrolling.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
