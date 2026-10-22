import React, { FC, ReactNode, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
}

const GlassCard: FC<Props> = ({ children, className = '', delay = 0, ...rest }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xRel = (e.clientX - rect.left) / rect.width;   // 0–1
    const yRel = (e.clientY - rect.top)  / rect.height;  // 0–1
    const tiltX = (yRel - 0.5) * -10;   // ±5° pitch
    const tiltY = (xRel - 0.5) *  10;   // ±5° yaw

    el.style.transform =
      `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    // Cursor-tracked spotlight
    el.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--sy', `${e.clientY - rect.top}px`);
    // Specular glare
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(circle at ${xRel * 100}% ${yRel * 100}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
      glowRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform =
      'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.setProperty('--sx', '-999px');
    el.style.setProperty('--sy', '-999px');
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-50px' }}
      {...rest}
    >
      <div
        ref={glowRef}
        className="glass-card__glare"
        style={{ opacity: 0, transition: 'opacity 0.35s ease' }}
      />
      {children}
    </motion.div>
  );
};

export default GlassCard;
