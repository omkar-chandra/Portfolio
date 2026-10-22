import React, { FC, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SOCIALS = [
  { href: 'https://www.instagram.com/omkar_chandra', icon: '/Icon/instagram-icon.svg', label: 'Instagram', handle: '@omkar_chandra', glow: '225,48,108' },
  { href: 'https://www.linkedin.com/in/omkar-chandra/', icon: '/Icon/linkedin-icon.svg', label: 'LinkedIn', handle: '@omkar-chandra', glow: '10,102,194' },
  { href: 'https://in.pinterest.com/omkar_chandra/', icon: '/Icon/pinterest-icon.svg', label: 'Pinterest', handle: '@omkar_chandra', glow: '230,0,35' },
];

/* Animated text ticker */
const TICKER_ITEMS = [
  'Frame by Frame', 'Motion Design', 'Kinetic Type', 'Color Science',
  'Brand Systems', 'Edit with Intent', 'Visual Rhythm', 'Story First',
  'Type & Motion', 'Creative Direction', 'Pixel Perfect', 'Made to Move',
];

const Footer: FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  /* Spotlight hover effect on headline */
  const headlineRef = useRef<HTMLDivElement>(null);
  const onHeadlineMove = useCallback((e: React.MouseEvent) => {
    if (!headlineRef.current) return;
    const r = headlineRef.current.getBoundingClientRect();
    headlineRef.current.style.setProperty('--hx', `${e.clientX - r.left}px`);
    headlineRef.current.style.setProperty('--hy', `${e.clientY - r.top}px`);
  }, []);

  return (
    <footer className="footer-v2">

      {/* ── Ambient glow orbs ── */}
      <div className="footer-v2__orb footer-v2__orb--1" aria-hidden="true" />
      <div className="footer-v2__orb footer-v2__orb--2" aria-hidden="true" />
      <div className="footer-v2__orb footer-v2__orb--3" aria-hidden="true" />

      {/* ── Main editorial section ── */}
      <div className="footer-v2__main">

        {/* Availability badge */}
        <motion.div
          className="footer-v2__badge"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="footer-v2__badge-dot" />
          <span>Available for freelance projects</span>
        </motion.div>

        {/* Massive editorial headline */}
        <motion.div
          ref={headlineRef}
          className="footer-v2__headline"
          onMouseMove={onHeadlineMove}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="footer-v2__headline-spotlight" aria-hidden="true" />
          <h2 className="footer-v2__headline-text">
            <span className="footer-v2__headline-solid">Let's Create</span>
            <span className="footer-v2__headline-outline">Something</span>
            <span className="footer-v2__headline-solid footer-v2__headline-accent">Great.</span>
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="footer-v2__subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          Frames that feel. Brands that stick. Motion that moves people.
          Let's build something worth remembering.
        </motion.p>

        {/* Dual CTA row */}
        <motion.div
          className="footer-v2__ctas"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            className="footer-v2__cta footer-v2__cta--primary"
            onClick={() => navigate('/contact')}
            data-cursor="Click"
          >
            Start a Project ↗
          </button>
          <button
            className="footer-v2__cta footer-v2__cta--secondary"
            onClick={() => navigate('/portfolio')}
            data-cursor="Click"
          >
            <span className="footer-v2__cta-text">View My Work →</span>
          </button>
        </motion.div>
      </div>

      {/* ── Social links strip ── */}
      <motion.div
        className="footer-v2__socials"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {/* Desktop: handle cards */}
        <div className="footer-v2__socials-desktop">
          {SOCIALS.map(({ href, icon, label, handle, glow }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="footer-v2__social-link"
              style={{ '--glow': glow } as React.CSSProperties}
              data-cursor="Visit"
              aria-label={`${label}: ${handle}`}
            >
              {/* Icon bubble */}
              <div className="footer-v2__social-icon">
                <img src={icon} alt={label} />
              </div>
              {/* Handle only */}
              <span className="footer-v2__social-handle">{handle}</span>
            </a>
          ))}
        </div>

        {/* Mobile: icon + handle inline */}
        <div className="footer-v2__socials-mobile">
          {SOCIALS.map(({ href, icon, label, handle, glow }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="footer-v2__social-icon-btn"
              style={{ '--glow': glow } as React.CSSProperties}
              data-cursor="Visit"
              aria-label={`${label}: ${handle}`}
            >
              <img src={icon} alt={label} />
            </a>
          ))}
        </div>
      </motion.div>

      {/* ── Ticker strip ── */}
      <div className="footer-v2__ticker" aria-hidden="true">
        <div className="footer-v2__ticker-mask" />
        <motion.div
          className="footer-v2__ticker-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 50,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="footer-v2__ticker-item">
              <span className="footer-v2__ticker-dot footer-v2__ticker-dot--accent">◆</span>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-v2__bottom">
        {/* Glowing separator line */}
        <div className="footer-v2__separator" aria-hidden="true" />

        <div className="footer-v2__bottom-inner">
          {/* Left — brand mark + copyright */}
          <div className="footer-v2__bottom-left">
            <span className="footer-v2__brand-mark">OC</span>
            <span className="footer-v2__copyright">
              © {currentYear} Omkar Chandra
            </span>
          </div>

          {/* Center — status pill */}
          <div className="footer-v2__status-pill">
            <span className="footer-v2__status-dot" />
            <span>Open to work</span>
          </div>

          {/* Right — craft line + back-to-top */}
          <div className="footer-v2__bottom-right">
            <span className="footer-v2__craft">Designed &amp; built by Omkar</span>
            <button
              className="footer-v2__top-btn"
              onClick={() => {
                const lenis = (window as any).__lenis;
                lenis ? lenis.scrollTo(0, { immediate: false, duration: 1.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Back to top"
              data-cursor="Top"
            >
              ↑
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
