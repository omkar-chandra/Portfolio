import React, { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const SOCIALS = [
  { href: 'https://www.instagram.com/omkar_chandra',                   icon: '/Icon/instagram-icon.svg', label: 'Instagram', handle: '@omkar_chandra'    },
  { href: 'https://www.linkedin.com/in/omkar-chandra-gour-09a556319/', icon: '/Icon/linkedin-icon.svg',   label: 'LinkedIn',  handle: '@omkarchandragour' },
  { href: 'https://www.facebook.com/omkar.chandra01',                  icon: '/Icon/facebook-icon.svg',  label: 'Facebook',  handle: '@omkar.chandra01'  },
  { href: 'https://pin.it/1amgKKpKN',                                  icon: '/Icon/pinterest-icon.svg', label: 'Pinterest', handle: 'Pinterest'         },
];

const Footer: FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [socialOpen, setSocialOpen] = useState(false);

  return (
    <footer className="footer-editorial">
      <div className="status-badge" data-cursor="Status">
        <div className="status-dot" />
        <span className="status-text">Currently open to new opportunities</span>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Have a project<br />
        <span>in mind?</span>
      </motion.h2>

      <button
        onClick={() => navigate('/contact')}
        className="btn-editorial"
        data-cursor="Click"
      >
        Start a Project ↗
      </button>

      <a
        href="mailto:zanoc.designer@gmail.com"
        className="email-huge"
        data-cursor="Email"
      >
        zanoc.designer@gmail.com
      </a>

      {/* Desktop social links — visible on larger screens */}
      <div className="social-links social-links--desktop">
        {SOCIALS.map(({ href, icon, label, handle }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" data-cursor="Visit">
            <img src={icon} width="22" height="22" alt={label} />
            {handle}
          </a>
        ))}
      </div>

      {/* Mobile social burger — visible on small screens */}
      <div className="social-mobile">
        <button
          className={`social-burger ${socialOpen ? 'social-burger--open' : ''}`}
          onClick={() => setSocialOpen(!socialOpen)}
          aria-label="Toggle social links"
        >
          <span className="social-burger__icon">
            <span className="social-burger__line" />
            <span className="social-burger__line" />
            <span className="social-burger__line" />
          </span>
          <span className="social-burger__label">{socialOpen ? 'Close' : 'Connect'}</span>
        </button>

        <AnimatePresence>
          {socialOpen && (
            <motion.div
              className="social-mobile__list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {SOCIALS.map(({ href, icon, label, handle }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-mobile__link"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.06 }}
                  data-cursor="Visit"
                >
                  <img src={icon} width="24" height="24" alt={label} />
                  <div className="social-mobile__info">
                    <span className="social-mobile__label">{label}</span>
                    <span className="social-mobile__handle">{handle}</span>
                  </div>
                  <span className="social-mobile__arrow">↗</span>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        className="back-to-top glass-card"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
        data-cursor="Top"
      >
        ↑
      </motion.button>

      {/* ── Copyright Bar ── */}
      <div className="footer-copyright">
        <div className="footer-copyright__inner">
          <p className="footer-copyright__text">
            © {currentYear} Made by me, Omkar Chandra. All rights reserved. <span className="footer-copyright__oc">oc</span>
          </p>
          <Link to="/privacy" className="footer-copyright__link" data-cursor="Privacy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
