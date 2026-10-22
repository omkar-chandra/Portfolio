import React, { FC, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassButton } from '../index';

interface ServiceCardWrapperProps {
  id: string;
  number: string;
  softwareBadge: string;
  softwareIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  tags: string[];
  contactServiceQuery: string;
  onReset?: () => void;
  resetLabel?: string;
  children: React.ReactNode;
}

export const ServiceCardWrapper: FC<ServiceCardWrapperProps> = ({
  id,
  number,
  softwareBadge,
  softwareIcon,
  title,
  subtitle,
  tags,
  contactServiceQuery,
  onReset,
  resetLabel = 'Reset Studio',
  children,
}) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    wrapperRef.current.style.setProperty('--card-mx', `${x}px`);
    wrapperRef.current.style.setProperty('--card-my', `${y}px`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.setProperty('--card-mx', '-999px');
    wrapperRef.current.style.setProperty('--card-my', '-999px');
  }, []);

  return (
    <motion.article
      id={id}
      ref={wrapperRef}
      className="service-studio-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dynamic Lime Ambient Border Highlight */}
      <div className="service-studio-card__glow-border" aria-hidden="true" />

      {/* Card Header */}
      <header className="service-studio-card__header">
        <div className="service-studio-card__meta">
          <div className="service-studio-card__num-badge">
            <span className="service-studio-card__num">{number}</span>
            <span className="service-studio-card__dot" />
          </div>

          <div className="service-studio-card__software-pill">
            {softwareIcon && <span className="service-studio-card__software-icon">{softwareIcon}</span>}
            <span className="service-studio-card__software-name">{softwareBadge}</span>
          </div>

          <div className="service-studio-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="service-studio-card__tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="service-studio-card__title-row">
          <div className="service-studio-card__title-group">
            <h3 className="service-studio-card__title">{title}</h3>
            <p className="service-studio-card__subtitle">{subtitle}</p>
          </div>

          <div className="service-studio-card__actions">
            {onReset && (
              <button
                type="button"
                className="service-studio-card__reset-btn"
                onClick={onReset}
                title="Reset to default composition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>{resetLabel}</span>
              </button>
            )}

            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate(`/contact?service=${encodeURIComponent(contactServiceQuery)}`)}
            >
              Hire For This ↗
            </GlassButton>
          </div>
        </div>
      </header>

      {/* Interactive Tool Body */}
      <div className="service-studio-card__body">
        {children}
      </div>
    </motion.article>
  );
};
