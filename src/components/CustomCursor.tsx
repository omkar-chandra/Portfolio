import React, { FC, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   IMPORTANT INTERACTIVE ELEMENTS — contextual liquid-glass labels
   ───────────────────────────────────────────────────────────────────────── */
const LABELED_SELECTORS: { selector: string; label?: string }[] = [
  { selector: '.glass-btn--primary',                        label: 'Open'        },
  { selector: '.glass-btn--secondary',                      label: 'Go'          },
  { selector: '.portfolio-showcase-card__cta-btn',          label: 'Explore'     },
  { selector: '.portfolio-showcase-card__open-btn',         label: 'View'        },
  { selector: '.nav-logo',                                  label: 'Home'        },
  { selector: '.about-card__insta-link',                    label: '→ Instagram' },
  { selector: '.about-hover-reveal-trigger',                label: '@omkar_Chandra' },
  { selector: '.pic-modal-close',                           label: 'Close'       },
  { selector: '.lgf__action-circle',                        label: 'Play'        },
  { selector: '.fs-video-card',                             label: 'Watch'       },
  { selector: '.deck-card',                                 label: 'Flip'        },
  { selector: 'a[href^="mailto"]',                          label: 'Email'       },
  { selector: 'a[href^="https://www.instagram"]',           label: 'Instagram'   },
  { selector: 'a[href^="https://linkedin"]',                label: 'LinkedIn'    },
  { selector: 'a[href^="https://github"]',                  label: 'GitHub'      },
];

/* General interactive — dot-only feedback (no label) */
const INTERACTIVE_NO_LABEL =
  'a:not([data-no-cursor]), button:not([data-no-cursor]), [data-cursor], input, textarea, select, .nav-link, .vp-btn, .vp-progress, .vp-qpick__item, .macos-window__dot, .macos-video-window__dot, .morph-window__dot, .morph-close-corner, .smq-item, .gallery-card, .about-tilt-card';

const CustomCursor: FC = () => {
  const dotRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const mouse    = useRef({ x: -200, y: -200 });
  const dotPos   = useRef({ x: -200, y: -200 });
  const trailPos = useRef({ x: -200, y: -200 });
  const raf      = useRef(0);
  const visible  = useRef(false);
  const pressed  = useRef(false);
  const hovered  = useRef(false);
  const labelText    = useRef('');
  const labelVisible = useRef(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot   = dotRef.current;
    const trail = trailRef.current;
    const label = labelRef.current;
    if (!dot || !trail || !label) return;

    /* ── Smooth easing helper ── */
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    /* ── Animation frame loop ── */
    const tick = () => {
      const mx = mouse.current.x;
      const my = mouse.current.y;

      if (mx > -100 && my > -100) {
        // 1. Primary dot: responsive, fluid tracking with natural easing
        dotPos.current.x = lerp(dotPos.current.x, mx, 0.52);
        dotPos.current.y = lerp(dotPos.current.y, my, 0.52);

        // Snap when resting to prevent sub-pixel jitter
        if (Math.abs(mx - dotPos.current.x) < 0.1) dotPos.current.x = mx;
        if (Math.abs(my - dotPos.current.y) < 0.1) dotPos.current.y = my;

        dot.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;

        // 2. Trailing dot: subtle smooth trailing effect with natural easing
        trailPos.current.x = lerp(trailPos.current.x, mx, 0.25);
        trailPos.current.y = lerp(trailPos.current.y, my, 0.25);

        if (Math.abs(mx - trailPos.current.x) < 0.1) trailPos.current.x = mx;
        if (Math.abs(my - trailPos.current.y) < 0.1) trailPos.current.y = my;

        trail.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;

        // 3. Contextual label pill (smoothly connected to pointer)
        if (labelVisible.current) {
          label.style.transform = `translate3d(${dotPos.current.x + 14}px, ${dotPos.current.y + 14}px, 0)`;
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    /* ── Find labeled selector for an element ── */
    const findLabeledMatch = (target: HTMLElement): string | null => {
      for (const { selector, label: lbl } of LABELED_SELECTORS) {
        const el = target.closest(selector);
        if (el) {
          if (lbl) return lbl;
          const aria = el.getAttribute('aria-label');
          if (aria) return aria.slice(0, 24);
          const text = (el as HTMLElement).innerText?.trim().slice(0, 20);
          return text || null;
        }
      }
      return null;
    };

    const showLabel = (text: string) => {
      labelText.current = text;
      label.setAttribute('data-label', text);
      label.classList.add('cursor-label--visible');
      labelVisible.current = true;
    };

    const hideLabel = () => {
      label.classList.remove('cursor-label--visible');
      labelVisible.current = false;
    };

    /* ── Event handlers ── */
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!visible.current) {
        visible.current = true;
        dotPos.current.x = e.clientX;
        dotPos.current.y = e.clientY;
        trailPos.current.x = e.clientX;
        trailPos.current.y = e.clientY;
        dot.style.opacity = '1';
        trail.style.opacity = '0.45';
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const lbl = findLabeledMatch(target);
      if (lbl) {
        hovered.current = true;
        dot.classList.add('cursor-dot--hover');
        trail.classList.add('cursor-trail--hover');
        showLabel(lbl);
        return;
      }

      if (target.closest(INTERACTIVE_NO_LABEL)) {
        hovered.current = true;
        dot.classList.add('cursor-dot--hover');
        trail.classList.add('cursor-trail--hover');
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (findLabeledMatch(target)) {
        hovered.current = false;
        dot.classList.remove('cursor-dot--hover');
        trail.classList.remove('cursor-trail--hover');
        hideLabel();
        return;
      }

      if (target.closest(INTERACTIVE_NO_LABEL)) {
        hovered.current = false;
        dot.classList.remove('cursor-dot--hover');
        trail.classList.remove('cursor-trail--hover');
      }
    };

    const onDown = (e: MouseEvent) => {
      pressed.current = true;
      // Immediate precision lock on click
      dotPos.current.x = e.clientX;
      dotPos.current.y = e.clientY;
      dot.classList.add('cursor-dot--click');
    };

    const onUp = () => {
      pressed.current = false;
      dot.classList.remove('cursor-dot--click');
    };

    const onLeave = () => {
      visible.current = false;
      dot.style.opacity   = '0';
      trail.style.opacity = '0';
      hideLabel();
    };

    const onEnter = (e: MouseEvent) => {
      visible.current = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dotPos.current.x = e.clientX;
      dotPos.current.y = e.clientY;
      trailPos.current.x = e.clientX;
      trailPos.current.y = e.clientY;
      dot.style.opacity   = '1';
      trail.style.opacity = '0.45';
    };

    document.addEventListener('mousemove',  onMove,  { passive: true });
    document.addEventListener('mouseover',  onOver,  { passive: true });
    document.addEventListener('mouseout',   onOut,   { passive: true });
    document.addEventListener('mousedown',  onDown,  { passive: true });
    document.addEventListener('mouseup',    onUp,    { passive: true });
    document.addEventListener('mouseleave', onLeave, { passive: true });
    document.addEventListener('mouseenter', onEnter, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Primary sharp dot — smooth, fluid, responsive with natural easing */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Subtle trailing dot — smooth follower, clean, sharp, minimal, no glow or shadow */}
      <div ref={trailRef} className="cursor-trail" />

      {/* Liquid glass contextual label pill on important buttons */}
      <div ref={labelRef} className="cursor-label" />
    </>
  );
};

export default CustomCursor;
