import React, { FC, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionValue } from 'framer-motion';
import GlassButton from './GlassButton';

interface Pillar {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  accent: string;
  secondColor: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'motion',
    title: 'Kinetic Motion',
    tagline: '60fps Dynamic VFX',
    icon: '✦',
    accent: '#C0FB67',
    secondColor: '#E6F6B9',
  },
  {
    id: 'identity',
    title: 'Visual Identity',
    tagline: 'Distinctive Marks & Art',
    icon: '◆',
    accent: '#00ffcc',
    secondColor: '#7dd8ff',
  },
  {
    id: 'impact',
    title: 'High Impact',
    tagline: 'Retention & Emotion',
    icon: '▲',
    accent: '#b8fc3a',
    secondColor: '#d4ff70',
  },
];

interface InteractiveCtaCardProps {
  ctaScale?: MotionValue<number>;
  ctaOpacity?: MotionValue<number>;
  onContactClick: () => void;
}

const InteractiveCtaCard: FC<InteractiveCtaCardProps> = ({
  ctaScale,
  ctaOpacity,
  onContactClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const [slotted, setSlotted] = useState<Record<string, boolean>>({
    motion: false,
    identity: false,
    impact: false,
  });

  const [isNearDropzone, setIsNearDropzone] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [shockwaveKey, setShockwaveKey] = useState(0);

  const slottedCount = Object.values(slotted).filter(Boolean).length;
  const isFullyElevated = slottedCount === PILLARS.length;

  // Soundless visual haptic trigger
  const triggerHapticShockwave = () => {
    setShockwaveKey((prev) => prev + 1);
  };

  // Check if a point is within the dropzone bounds (with generous magnetic tolerance)
  const isPointOverDropzone = useCallback((point: { x: number; y: number }) => {
    if (!dropzoneRef.current) return false;
    const rect = dropzoneRef.current.getBoundingClientRect();
    const tolerance = 35; // Magnetism cushion
    return (
      point.x >= rect.left - tolerance &&
      point.x <= rect.right + tolerance &&
      point.y >= rect.top - tolerance &&
      point.y <= rect.bottom + tolerance
    );
  }, []);

  // Slot a pillar
  const slotPillar = useCallback((id: string) => {
    setSlotted((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
    triggerHapticShockwave();
  }, []);

  // Reset the interactive game
  const resetGame = () => {
    setSlotted({
      motion: false,
      identity: false,
      impact: false,
    });
    setIsNearDropzone(false);
    setActiveDragId(null);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`cta-glass cta-glass--enhanced cta-reactor ${isFullyElevated ? 'cta-reactor--elevated' : ''}`}
      style={{
        scale: ctaScale,
        opacity: ctaOpacity,
      }}
    >
      {/* ── Ambient Liquid Glass background elements ── */}
      <motion.div
        className="cta-glass__sparkle"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      />

      {/* Atmospheric Elevation Glow when completed */}
      <AnimatePresence>
        {isFullyElevated && (
          <motion.div
            className="cta-reactor__aurora-burst"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* ── Card Header ── */}
      <div className="cta-reactor__header">
        <motion.div
          className="cta-reactor__pill-tag"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="cta-reactor__pill-dot" />
          <span className="cta-reactor__pill-text">
            {isFullyElevated ? '✦ 100% MAXIMUM BRAND ELEVATION' : '✦ INTERACTIVE BRAND IGNITION'}
          </span>
        </motion.div>

        <motion.h2
          className="cta-glass__title cta-reactor__title"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Ready to Elevate{' '}
          <span className={`text-gradient ${isFullyElevated ? 'text-gradient--ignited' : ''}`}>
            Your Brand?
          </span>
        </motion.h2>

        <motion.p
          className="cta-glass__text cta-reactor__subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {isFullyElevated
            ? 'All creative pillars aligned. Your visual presence is primed for maximum market impact.'
            : "Let's craft a visual identity that leaves a lasting impression."}
        </motion.p>
      </div>

      {/* ── Interactive Playground Bay ── */}
      <div className="cta-reactor__interactive-zone">
        {/* Micro HUD Instructions */}
        <div className="cta-reactor__hud-bar">
          <div className="cta-reactor__hud-status">
            <span className="cta-reactor__hud-icon">⚡</span>
            <span className="cta-reactor__hud-label">
              {isFullyElevated ? (
                <span className="text-lime">Core Fully Charged</span>
              ) : isNearDropzone ? (
                <span className="text-lime animate-pulse">Magnetic Lock: Release to Slot!</span>
              ) : (
                'Drag or tap pillars to elevate'
              )}
            </span>
          </div>

          <div className="cta-reactor__hud-meter">
            <span className="cta-reactor__hud-count">
              {slottedCount} / {PILLARS.length}
            </span>
            <div className="cta-reactor__meter-track">
              <motion.div
                className="cta-reactor__meter-fill"
                initial={false}
                animate={{ width: `${(slottedCount / PILLARS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              />
            </div>
            {isFullyElevated && (
              <button
                className="cta-reactor__reset-btn"
                onClick={resetGame}
                data-cursor="Click"
                title="Reset interactive playground"
                aria-label="Reset experience"
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Draggable Pillars Bay ── */}
        <div className="cta-reactor__tokens-dock">
          {PILLARS.map((pillar, i) => {
            const isSlotted = slotted[pillar.id];

            return (
              <div key={pillar.id} className="cta-reactor__token-slot">
                {!isSlotted ? (
                  <motion.div
                    className={`cta-token-card ${activeDragId === pillar.id ? 'cta-token-card--dragging' : ''}`}
                    drag
                    dragConstraints={cardRef}
                    dragElastic={0.16}
                    dragMomentum={true}
                    dragTransition={{ bounceStiffness: 450, bounceDamping: 28 }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 1.08, cursor: 'grabbing' }}
                    onDragStart={() => setActiveDragId(pillar.id)}
                    onDrag={(_, info) => {
                      const isOver = isPointOverDropzone(info.point);
                      setIsNearDropzone(isOver);
                    }}
                    onDragEnd={(_, info) => {
                      setActiveDragId(null);
                      const isOver = isPointOverDropzone(info.point);
                      setIsNearDropzone(false);
                      if (isOver) {
                        slotPillar(pillar.id);
                      }
                    }}
                    onClick={() => slotPillar(pillar.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: [0, -4, 0],
                      transition: {
                        y: {
                          repeat: Infinity,
                          duration: 3.5 + i * 0.7,
                          ease: 'easeInOut',
                        },
                        opacity: { duration: 0.4 },
                      },
                    }}
                    style={{
                      '--pillar-accent': pillar.accent,
                      '--pillar-second': pillar.secondColor,
                      touchAction: 'none',
                    } as React.CSSProperties}
                    data-cursor="Drag"
                  >
                    <div className="cta-token-card__glint" />
                    <div className="cta-token-card__body">
                      <span className="cta-token-card__icon" style={{ color: pillar.accent }}>
                        {pillar.icon}
                      </span>
                      <div className="cta-token-card__info">
                        <span className="cta-token-card__title">{pillar.title}</span>
                        <span className="cta-token-card__tagline">{pillar.tagline}</span>
                      </div>
                      <span className="cta-token-card__handle">⠿</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="cta-token-placeholder">
                    <span className="cta-token-placeholder__dot" />
                    <span className="cta-token-placeholder__text">Slotted ✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Magnetic Elevation Core (Dropzone) ── */}
        <div
          ref={dropzoneRef}
          className={`cta-dropzone ${isNearDropzone ? 'cta-dropzone--magnetized' : ''} ${isFullyElevated ? 'cta-dropzone--completed' : ''}`}
        >
          {/* Shockwave ring on snap */}
          <AnimatePresence>
            {shockwaveKey > 0 && (
              <motion.span
                key={shockwaveKey}
                className="cta-dropzone__shockwave"
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 2.1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </AnimatePresence>

          <div className="cta-dropzone__inner">
            {/* Left Beacon */}
            <div className="cta-dropzone__beacon">
              <span className={`cta-dropzone__beacon-ring ${isNearDropzone ? 'animate-ping' : ''}`} />
              <span className="cta-dropzone__beacon-dot">⌖</span>
            </div>

            {/* Middle: Live State / Slot Receptacles */}
            {!isFullyElevated ? (
              <div className="cta-dropzone__content">
                <span className="cta-dropzone__prompt">
                  {isNearDropzone ? 'Release to snap into Elevation Core' : 'Drop elements into core'}
                </span>
                <div className="cta-dropzone__slots">
                  {PILLARS.map((p) => {
                    const isFilled = slotted[p.id];
                    return (
                      <div
                        key={p.id}
                        className={`cta-dropzone__slot-chip ${isFilled ? 'cta-dropzone__slot-chip--filled' : ''}`}
                        style={{ '--chip-color': p.accent } as React.CSSProperties}
                      >
                        <span className="cta-dropzone__chip-icon">{isFilled ? '✓' : p.icon}</span>
                        <span className="cta-dropzone__chip-label">{p.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <motion.div
                className="cta-dropzone__success-banner"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="cta-dropzone__success-badge">✦ BRAND ELEVATION ENGINE ENGAGED</span>
                <span className="cta-dropzone__success-sub">
                  Motion, Identity & Impact fully calibrated. Ready for launch.
                </span>
              </motion.div>
            )}

            {/* Right Status Pill */}
            <div className="cta-dropzone__status-pill">
              {isFullyElevated ? 'READY' : `${slottedCount}/3`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Call to Action ── */}
      <motion.div
        className="cta-reactor__actions"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <div className="cta-reactor__button-wrap">
          <GlassButton
            variant="primary"
            size="lg"
            onClick={onContactClick}
            className={isFullyElevated ? 'glass-btn--ignited' : ''}
          >
            {isFullyElevated ? '✦ Start Your Elevation ↗' : 'Get In Touch ↗'}
          </GlassButton>
        </div>

        {isFullyElevated && (
          <motion.span
            className="cta-reactor__accelerator-notice"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            ✦ Next available collaboration window: Q4 / Immediate Booking
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InteractiveCtaCard;
