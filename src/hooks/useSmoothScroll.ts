import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Global Lenis smooth scroll.
 *
 * The instance is stored on `window.__lenis` so other components
 * (e.g. ScrollToTop) can call `lenis.scrollTo(0, { immediate })`.
 */
const useSmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // Fluid physics-based scroll for desktop wheel
      lerp: 0.08,
      wheelMultiplier: 0.9,   // Slightly softer wheel steps
      smoothWheel: true,


      syncTouch: false,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;
    // Expose globally so ScrollToTop (and any other component) can reach it
    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).__lenis;
    };
  }, []);
};

export default useSmoothScroll;
