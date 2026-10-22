import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Center pill items: Contact removed, Services added ── */
const CENTER_NAV = [
  { path: '/',          label: 'Home' },
  { path: '/about',     label: 'About' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/services',  label: 'Services' },
];

/* ── All items for mobile nav ── */
const ALL_NAV = [
  { path: '/',          label: 'Home' },
  { path: '/about',     label: 'About' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/services',  label: 'Services' },
  { path: '/contact',   label: 'Contact' },
];

const Navigation: FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navPillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = useCallback(() => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      requestAnimationFrame(() => {
        lenis.scrollTo(0, { immediate: true });
      });
    }
  }, []);

  return (
    <>
      <nav
        className={`nav-glass ${scrolled ? 'nav-glass--scrolled' : ''} ${menuOpen ? 'nav-glass--open' : ''}`}
      >
        <div className="nav-glass__inner">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="nav-logo" data-cursor="Home" onClick={handleNavClick}>
              <img src="https://ik.imagekit.io/ocg/IMAGES/Logo/OC%20Logo.webp?updatedAt=1792695186045" alt="Omkar Chandra" className="nav-logo__img" />
              <div className="nav-logo__glow" />
            </Link>
          </motion.div>

          {/* ── Center glass pill: Home | About | Portfolio | Services ── */}
          <div className="nav-bubble-pill" ref={navPillRef}>
            {/* Liquid Glass layers */}
            <div className="nav-bubble-pill__fill" />
            <div className="nav-bubble-pill__border" />
            <div className="nav-bubble-pill__specular" />

            {CENTER_NAV.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-bubble-link ${active ? 'nav-bubble-link--active' : ''}`}
                  data-cursor="Navigate"
                  onClick={handleNavClick}
                >
                  <span className="nav-bubble-link__text">{item.label}</span>
                  {active && (
                    <motion.div
                      className="nav-bubble-indicator"
                      layoutId="nav-active-bubble"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                        mass: 0.8,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right zone: only Get in Touch CTA ── */}
          <div className="nav-actions">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.965 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              <Link
                to="/contact"
                className="nav-cta-bubble"
                data-cursor="Click"
                onClick={handleNavClick}
              >
                {/* Liquid Glass layers */}
                <span className="nav-cta-bubble__fill" />
                <span className="nav-cta-bubble__border" />
                <span className="nav-cta-bubble__specular" />
                <span className="nav-cta-bubble__shimmer" />
                <span className="nav-cta-bubble__text">Get in Touch</span>
              </Link>
            </motion.div>

            {/* Mobile burger */}
            <button
              className={`nav-burger ${menuOpen ? 'nav-burger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              data-cursor="Menu"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <div className="nav-burger__line" />
              <div className="nav-burger__line" />
              <div className="nav-burger__line" />
            </button>
          </div>
        </div>

        {/* Liquid shimmer line */}
        <div className="nav-glass__shimmer-line" />
      </nav>

      {/* ── Mobile fullscreen nav ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav-glass"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="mobile-nav__inner">
              {ALL_NAV.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={item.path}
                    className={`mobile-nav__link ${location.pathname === item.path ? 'mobile-nav__link--active' : ''}`}
                    onClick={() => {
                      setMenuOpen(false);
                      handleNavClick();
                    }}
                  >
                    <span className="mobile-nav__number">0{i + 1}</span>
                    <span className="mobile-nav__text">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
