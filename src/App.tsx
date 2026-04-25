import React, { FC, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';

import useSmoothScroll from './hooks/useSmoothScroll';
import {
  CustomCursor, Navigation, Footer, GlassButton, PageTransition, ScrollToTop, IntroAnimation,
} from './components';
import { motion } from 'framer-motion';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

// ── Smooth scroll lives in App root ──
const AppRoot: FC = () => {
  useSmoothScroll();
  const location = useLocation();
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <div className="app">
      <CustomCursor />

      {/* Intro animation overlay — blocks site until done */}
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Nav + content fade in after intro */}
      <div style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
        <Navigation />
      </div>
      <ScrollToTop />
      <main style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <div style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}>
        <Footer />
      </div>
    </div>
  );
};

const NotFound: FC = () => (
  <PageTransition>
    <section className="page-hero" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.h1 className="page-hero__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(6rem, 15vw, 12rem)', lineHeight: 1 }}>
          4<span className="text-gradient">0</span>4
        </motion.h1>
        <motion.p className="page-hero__subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: '20px' }}>
          The page you're looking for doesn't exist.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: '40px' }}>
          <GlassButton variant="primary" size="lg" href="/">Back to Home ↗</GlassButton>
        </motion.div>
      </div>
    </section>
  </PageTransition>
);

const App: FC = () => (
  <Router>
    <AppRoot />
  </Router>
);

export default App;

