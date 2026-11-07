import React, { FC, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_KEY = 'oc_intro_seen';

const IntroAnimation: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('active'), 300);
    const t2 = setTimeout(() => setPhase('exit'), 2450);
    const t3 = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem(INTRO_KEY, '1');
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const smoothEase = [0.16, 1, 0.3, 1] as const;
  const isExit = phase === 'exit';
  const isActive = phase === 'active';

  const tickerItems = useMemo(
    () => [
      { text: 'OMKAR_CHANDRA', code: 'G.007' },
      { text: 'MOTION_GRAPHICS', code: 'G.014' },
      { text: 'BRAND_IDENTITY', code: 'G.021' },
      { text: 'CINEMATICS', code: 'G.3015' },
      { text: 'CREATIVE_DIRECTION', code: 'G.3040' },
      { text: 'PORTFOLIO_2026', code: 'G.3088' },
    ],
    []
  );

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="dich-intro-overlay"
          role="presentation"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: smoothEase }}
        >
          {/* ── Layer 1: Portfolio-Themed Dark Cinematic Background ── */}
          <div className="dich-clouds-stage" aria-hidden="true">
            <div className="dich-ambient-glow dich-ambient-glow--accent" />
            <div className="dich-ambient-glow dich-ambient-glow--cyan" />
            <div className="dich-dot-matrix" />
            <div className="dich-clouds-vignette" />
          </div>

          {/* ── Layer 2: HUD Viewport Frame (Portfolio Styling) ── */}
          <div className="dich-viewport-frame" aria-hidden="true">
            {/* Top center notch only */}
            <div className="dich-hud-top">
              <div className="dich-hud-top-bracket dich-hud-top-bracket--left" />
              <div className="dich-notch dich-notch--top">
                <span className="dich-pulse-dot" />
                <span className="dich-notch-title">PORTFOLIO // 2026 // EDITION</span>
              </div>
              <div className="dich-hud-top-bracket dich-hud-top-bracket--right" />
            </div>

            {/* Corner brackets */}
            <div className="dich-corner-bracket dich-corner-bracket--tl" />
            <div className="dich-corner-bracket dich-corner-bracket--tr" />
            <div className="dich-corner-bracket dich-corner-bracket--bl" />
            <div className="dich-corner-bracket dich-corner-bracket--br" />

            {/* Bottom ticker + coordinates */}
            <div className="dich-hud-bottom">
              <div className="dich-ticker-strip">
                {tickerItems.map((item, idx) => (
                  <span key={idx} className="dich-ticker-segment">
                    <span className="dich-ticker-text">{item.text}</span>
                    <span className="dich-ticker-sub">{item.code}</span>
                  </span>
                ))}
              </div>
              <div className="dich-notch dich-notch--bottom">
                <span className="dich-coord-text">X.0243 // Y.0340</span>
              </div>
            </div>
          </div>

          {/* ── Layer 3: Hero — Centered Logo on top, Full Name below ── */}
          <motion.div
            className="dich-hero-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={
              isExit
                ? { opacity: 0, y: -24, scale: 1.05 }
                : isActive
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            transition={{ duration: 0.65, ease: smoothEase }}
          >
            {/* Logo centered above the name */}
            <motion.div
              className="dich-hero-badge"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={
                isActive
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.4, opacity: 0 }
              }
              transition={{ delay: 0.3, duration: 0.6, ease: smoothEase }}
            >
              <img
                src={`${process.env.PUBLIC_URL || ''}/favicon.ico`}
                alt="OC Logo"
                className="dich-badge-logo"
                loading="eager"
              />
            </motion.div>

            {/* Full Name: OMKAR CHANDRA — two lines, no splitting */}
            <div className="dich-name-block">
              {/* OMKAR */}
              <div className="dich-name-row" aria-label="Omkar">
                {'OMKAR'.split('').map((char, i) => (
                  <motion.span
                    key={`f-${i}`}
                    className="dich-3d-char"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={isActive ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
                    transition={{ delay: 0.38 + i * 0.055, duration: 0.52, ease: smoothEase }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* CHANDRA */}
              <div className="dich-name-row" aria-label="Chandra">
                {'CHANDRA'.split('').map((char, i) => (
                  <motion.span
                    key={`l-${i}`}
                    className="dich-3d-char"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={isActive ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
                    transition={{ delay: 0.58 + i * 0.048, duration: 0.52, ease: smoothEase }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Layer 4: Exit Dissolve ── */}
          {isExit && (
            <motion.div
              className="dich-exit-shutter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
