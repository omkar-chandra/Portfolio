import React, { FC, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassButton from './GlassButton';

const NAV_ITEMS = [
  { path: '/',          label: 'Home'      },
  { path: '/about',     label: 'About'     },
  { path: '/services',  label: 'Services'  },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/contact',   label: 'Contact'   },
];

const Navigation: FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      <motion.nav
        className={`nav-glass ${scrolled ? 'nav-glass--scrolled' : ''} ${menuOpen ? 'nav-glass--open' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-glass__inner">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="nav-logo" data-cursor="Home">
              <img src="/LOGO.webp" alt="Omkar Chandra" className="nav-logo__img" />
              <div className="nav-logo__glow" />
            </Link>
          </motion.div>

          {/* Desktop links */}
          <div className="nav-links-desktop">
            <div className="nav-links-desktop__shimmer" />
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <motion.div key={item.path} whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
                  <Link
                    to={item.path}
                    className={`nav-link ${active ? 'nav-link--active' : ''}`}
                    data-cursor="Navigate"
                  >
                    <span className="nav-link__text">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <GlassButton variant="primary" size="sm" href="/contact" className="nav-cta">
              Get in Touch
            </GlassButton>
            <button
              className={`nav-burger ${menuOpen ? 'nav-burger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              data-cursor="Menu"
              aria-label="Toggle menu"
            >
              <div className="nav-burger__line" />
              <div className="nav-burger__line" />
              <div className="nav-burger__line" />
            </button>
          </div>
        </div>

        {/* Liquid shimmer line */}
        <div className="nav-glass__shimmer-line" />
      </motion.nav>

      {/* Mobile nav */}
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
              {NAV_ITEMS.map((item, i) => (
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
                    onClick={() => setMenuOpen(false)}
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
