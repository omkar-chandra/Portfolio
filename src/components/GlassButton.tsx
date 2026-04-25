import React, { FC, ReactNode, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

const GlassButton: FC<Props> = ({
  children, onClick, variant = 'primary', size = 'md', className = '', href,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const idRef = useRef(0);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).closest('.glass-btn')!.getBoundingClientRect();
    const newRipple = { id: idRef.current++, x: e.clientX - rect.left, y: e.clientY - rect.top };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 800);
    onClick?.();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMagnetPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.15,
      y: (e.clientY - rect.top - rect.height / 2) * 0.15,
    });
  };

  const btn = (
    <motion.button
      ref={btnRef}
      className={`glass-btn glass-btn--${variant} glass-btn--${size} ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMagnetPos({ x: 0, y: 0 })}
      data-cursor="Click"
      animate={{ x: magnetPos.x, y: magnetPos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="glass-btn__bg" />
      <span className="glass-btn__shine" />
      <span className="glass-btn__content">{children}</span>
      {ripples.map((r) => (
        <span key={r.id} className="glass-btn__ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </motion.button>
  );

  return href ? <Link to={href}>{btn}</Link> : btn;
};

export default GlassButton;
