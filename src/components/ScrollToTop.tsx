import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the top of the page on every route change.
 *
 * Uses the global Lenis instance (window.__lenis) when available
 * so the scroll actually works with smooth-scroll hijacking,
 * and falls back to native window.scrollTo as a safety net.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      // `immediate: true` jumps instantly (no 1.2 s drift animation)
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
