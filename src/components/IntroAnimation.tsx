import React, { FC, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_KEY = 'oc_intro_seen';

const IntroAnimation: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'logo' | 'name' | 'exit'>('logo');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 700);   // logo → name at 0.7 s
    const t2 = setTimeout(() => setPhase('exit'), 1700);  // name hold → exit at 1.7 s
    const t3 = setTimeout(() => {                          // fully done at 2.5 s
      setDone(true);
      sessionStorage.setItem(INTRO_KEY, '1');
      onComplete();
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const nameFirst = 'OMKAR';
  const nameLast = 'CHANDRA';

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
    })),
    []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="intro-overlay"
          role="presentation"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ambient particles */}
          <div className="intro-particles">
            {particles.map((p) => (
              <span
                key={p.id}
                className="intro-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
          </div>

          {/* Logo */}
          <motion.div
            className="intro-logo-wrap"
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={
              phase === 'logo'
                ? { scale: 1, opacity: 1, rotate: 0 }
                : phase === 'name'
                  ? { scale: 0.55, opacity: 1, rotate: 0, y: -80 }
                  : { scale: 0.3, opacity: 0, y: -200 }
            }
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="https://ik.imagekit.io/ocg/IMAGES/Logo/OC%20Logo.webp?updatedAt=1792695186045" alt="OC Logo" className="intro-logo" />
            <div className="intro-logo-glow" />
          </motion.div>

          {/* Name */}
          <motion.div
            className="intro-name"
            initial={{ opacity: 0 }}
            animate={
              phase === 'name'
                ? { opacity: 1, y: 30 }
                : phase === 'exit'
                  ? { opacity: 0, y: -40 }
                  : { opacity: 0, y: 60 }
            }
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="intro-name__first">
              {nameFirst.split('').map((char, i) => (
                <motion.span
                  key={`f-${i}`}
                  className="intro-letter"
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={
                    phase !== 'logo'
                      ? { opacity: 1, y: 0, rotateX: 0 }
                      : { opacity: 0, y: 40, rotateX: -90 }
                  }
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <div className="intro-name__last">
              {nameLast.split('').map((char, i) => (
                <motion.span
                  key={`l-${i}`}
                  className="intro-letter intro-letter--accent"
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={
                    phase !== 'logo'
                      ? { opacity: 1, y: 0, rotateX: 0 }
                      : { opacity: 0, y: 40, rotateX: -90 }
                  }
                  transition={{ delay: 0.08 + i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <motion.div
              className="intro-tagline"
              initial={{ opacity: 0, width: 0 }}
              animate={
                phase === 'name'
                  ? { opacity: 1, width: '100%' }
                  : { opacity: 0, width: 0 }
              }
              transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="intro-tagline__line" />
              <span className="intro-tagline__text">Video Editor & Graphic Designer</span>
              <span className="intro-tagline__line" />
            </motion.div>
          </motion.div>

          {/* Wipe line */}
          {phase === 'exit' && (
            <motion.div
              className="intro-wipe"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
