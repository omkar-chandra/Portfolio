import React, { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroAnimation: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'logo' | 'name' | 'exit'>('logo');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 1400);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => { setDone(true); onComplete(); }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const nameFirst = 'OMKAR';
  const nameLast  = 'CHANDRA';

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="intro-overlay"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ambient particles */}
          <div className="intro-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="intro-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
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
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/favicon.ico" alt="OC Logo" className="intro-logo" />
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
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="intro-tagline__line" />
              <span className="intro-tagline__text">Creative Designer & Video Editor</span>
              <span className="intro-tagline__line" />
            </motion.div>
          </motion.div>

          {/* Wipe line */}
          {phase === 'exit' && (
            <motion.div
              className="intro-wipe"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
