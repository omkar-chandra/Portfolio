import React, { FC, useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, .glass-btn, [data-cursor], input, textarea, select, .project-card, .about-tilt-card, .about-card, .nav-link, .nav-logo, .pic-marquee__item';

const CustomCursor: FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const hover = useRef(false);
  const press = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current!;
    const rng = ringRef.current!;
    if (!dot || !rng) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Dot: instant position
      dot.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;

      // Ring: smooth follow
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.15);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.15);

      let scale = 1;
      if (press.current) scale = 0.75;
      else if (hover.current) scale = 1.6;

      rng.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%) scale(${scale})`;

      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!visible.current) {
        visible.current = true;
        dot.style.opacity = '1';
        rng.style.opacity = '1';
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(INTERACTIVE);
      if (target) {
        hover.current = true;
        dot.classList.add('cursor-dot--hover');
        rng.classList.add('cursor-ring--hover');
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(INTERACTIVE);
      if (target) {
        hover.current = false;
        dot.classList.remove('cursor-dot--hover');
        rng.classList.remove('cursor-ring--hover');
      }
    };

    const onDown = (e: MouseEvent) => {
      press.current = true;
      dot.classList.add('cursor-dot--click');
      rng.classList.add('cursor-ring--click');

      // Spawn click ripple
      const ripple = document.createElement('div');
      ripple.className = 'cursor-click-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    const onUp = () => {
      press.current = false;
      dot.classList.remove('cursor-dot--click');
      rng.classList.remove('cursor-ring--click');
    };

    const onLeave = () => {
      visible.current = false;
      dot.style.opacity = '0';
      rng.style.opacity = '0';
    };

    const onEnter = () => {
      visible.current = true;
      dot.style.opacity = '1';
      rng.style.opacity = '1';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default CustomCursor;
