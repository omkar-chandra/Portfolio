import React, { FC, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GlassButton, FloatingShapes, PageTransition, VideoPlayer } from '../components';
import { projects, isVerticalVideo, getYouTubeThumbnail } from '../data';
import { Project } from '../types';

const CATEGORIES = ['all', 'video', 'poster', 'logo'] as const;

const getVideoThumb = (p: Project): string => {
  if (p.thumbnail) return p.thumbnail;
  if (p.image) return p.image;
  if (p.video) return getYouTubeThumbnail(p.video);
  return '';
};

const CuttingMatTexture: FC = () => (
  <svg
    className="cutting-mat-texture"
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
      opacity: 0.18,
      mixBlendMode: 'overlay',
    }}
  >
    <filter id="cuttingMatGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#cuttingMatGrain)" />
  </svg>
);

interface PreviewModalProps {
  project: Project;
  originRect: DOMRect | null;
  onClose: () => void;
}

const MorphingPreviewModal: FC<PreviewModalProps> = ({ project, originRect, onClose }) => {
  const isVideo = !!project.video;
  const isVert = isVideo && isVerticalVideo(project);
  const is4by5 = !isVideo && (project.aspectRatio === '4/5' || project.aspectRatio === '4:5');

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

  let targetW = 900;
  let targetH = 550;
  if (isVideo) {
    if (isVert) {
      targetW = Math.min((winH * 0.86 - 44) * (9 / 16), winW * 0.9, 420);
      targetH = targetW * (16 / 9) + 44;
    } else {
      targetW = Math.min((winH * 0.84 - 44) * (16 / 9), winW * 0.92, 1100);
      targetH = targetW * (9 / 16) + 44;
    }
  } else if (is4by5) {
    targetW = Math.min((winH * 0.84 - 44) * (4 / 5), winW * 0.92, 600);
    targetH = targetW * (5 / 4) + 44;
  } else {
    targetW = Math.min(winH * 0.84 - 44, winW * 0.92, 740);
    targetH = targetW + 44;
  }

  const initX = originRect ? originRect.left + originRect.width / 2 - winW / 2 : 0;
  const initY = originRect ? originRect.top + originRect.height / 2 - winH / 2 : 24;
  const initScale = originRect ? Math.max(0.2, originRect.width / targetW) : 0.92;

  return (
    <motion.div
      className="morph-overlay morph-overlay--cutting-mat"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onClick={onClose}
    >
      <div className="cutting-mat-backdrop">
        <div className="cutting-mat-grid" />
        <div className="cutting-mat-crosshairs" />
        <div className="cutting-mat-ruler-top" />
        <div className="cutting-mat-ruler-left" />
        <div className="cutting-mat-vignette" />
        <CuttingMatTexture />
        <div className="cutting-mat-stamp">
          <span className="cutting-mat-stamp__code">CM-900 STUDIO</span>
          <span className="cutting-mat-stamp__spec">3.0MM SELF-HEALING MAT • DUAL METRIC GRID</span>
        </div>
      </div>

      <motion.button
        className="morph-close-corner"
        onClick={onClose}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Close preview"
      >
        ✕
      </motion.button>

      <motion.div
        className={`morph-window ${isVideo
          ? isVert
            ? 'morph-window--video-portrait'
            : 'morph-window--video-landscape'
          : is4by5
            ? 'morph-window--image-4-5'
            : 'morph-window--image'
          }`}
        initial={{
          x: initX,
          y: initY,
          scale: initScale,
          opacity: originRect ? 0.9 : 0,
        }}
        animate={{
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        }}
        exit={{
          x: initX,
          y: initY,
          scale: initScale,
          opacity: 0,
          transition: { duration: 0.22, ease: [0.32, 0, 0.67, 0] },
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 300,
          mass: 0.85,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="morph-window__titlebar">
          <div className="morph-window__dots">
            <button
              className="morph-window__dot morph-window__dot--close"
              onClick={onClose}
              aria-label="Close window"
            />
            <span className="morph-window__dot morph-window__dot--minimize" />
            <span className="morph-window__dot morph-window__dot--maximize" />
          </div>
          <div className="morph-window__title-group">
            <span className="morph-window__title">{project.name || project.title}</span>
          </div>
          <div className="morph-window__spacer" />
        </div>

        <div className="morph-window__body">
          {isVideo ? (
            <VideoPlayer
              src={project.video!}
              autoPlay
              loop
              playsInline
              controls
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="morph-window__img"
              draggable={false}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface LiquidGlassFolderProps {
  items: Project[];
  format: 'landscape' | 'portrait' | 'square';
  accentColor: string;
  secondColor: string;
  label: string;
  count: number;
  index?: string | number;
  onOpenFolder: () => void;
}

const LiquidGlassFolder: FC<LiquidGlassFolderProps> = ({
  items,
  format,
  accentColor,
  secondColor,
  label,
  count,
  index = '01',
  onOpenFolder,
}) => {
  const card1 = items[0];
  const card2 = items[1] || items[0];
  const card3 = items[2] || items[0];

  const getThumb = (p?: Project) => (p ? getVideoThumb(p) : '');
  const fmtIdx = typeof index === 'number' ? String(index).padStart(2, '0') : index;

  return (
    <div
      className={`lgf lgf--${format}`}
      onClick={onOpenFolder}
      role="button"
      tabIndex={0}
      aria-label={`Open ${label} portfolio collection`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenFolder();
        }
      }}
    >
      {/* Ambient Back Glow */}
      <div
        className="lgf__ambient-glow"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${accentColor}48 0%, ${secondColor}1c 50%, transparent 75%)`,
        }}
      />

      {/* 1. Folder Back Plate with Tab */}
      <div className="lgf__back">
        <div className="lgf__back-tab">
          <span className="lgf__back-tab-text">{label}</span>
          <span className="lgf__back-tab-idx">{fmtIdx}</span>
        </div>
        <div className="lgf__back-watermark">{fmtIdx}</div>
      </div>

      {/* 2. Stacked Project Cards Deck (Fanning inside pocket) */}
      <div className="lgf__deck">
        {card1 && (
          <div className="lgf__card lgf__card--left" title={card1.name || card1.title}>
            <div className="lgf__card-inner">
              <img src={getThumb(card1)} alt={card1.title} className="lgf__card-img" draggable={false} />
              <div className="lgf__card-sheen" />
            </div>
          </div>
        )}
        {card3 && (
          <div className="lgf__card lgf__card--right" title={card3.name || card3.title}>
            <div className="lgf__card-inner">
              <img src={getThumb(card3)} alt={card3.title} className="lgf__card-img" draggable={false} />
              <div className="lgf__card-sheen" />
            </div>
          </div>
        )}
        {card2 && (
          <div className="lgf__card lgf__card--center" title={card2.name || card2.title}>
            <div className="lgf__card-inner">
              <img src={getThumb(card2)} alt={card2.title} className="lgf__card-img" draggable={false} />
              <div className="lgf__card-glow" style={{ boxShadow: `0 0 24px ${accentColor}44` }} />
              <div className="lgf__card-sheen" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Front Liquid Glass Flap (Apple-Style Frosted Glass Pocket) */}
      <div className="lgf__front">
        <div className="lgf__front-glass">
          <div className="lgf__front-reflection" />
          <div className="lgf__front-specular-lip" />
          <div
            className="lgf__front-accent-line"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accentColor}77 30%, ${secondColor}77 70%, transparent 100%)`,
            }}
          />

          {/* Top subtle micro-tag (Ref 2/3 style) */}
          <div className="lgf__front-top">
            <span className="lgf__front-tag">*COLLECTION ARCHIVE</span>
          </div>

          {/* Bottom info bar + Circular CTA button */}
          <div className="lgf__front-bottom">
            <div className="lgf__badge-pill">
              <span className="lgf__badge-dot" style={{ backgroundColor: accentColor }} />
              <span className="lgf__badge-text">{count} {count === 1 ? 'Work' : 'Works'}</span>
            </div>

            {/* Reference 2 / 3 Iconic Circular Action Button */}
            <div className="lgf__action-circle" title={`Explore ${label}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ShowcaseSectionProps {
  title: string;
  subtitle: string;
  label: string;
  items: Project[];
  accentColor: string;
  secondColor: string;
  chips: string[];
  format: 'landscape' | 'portrait' | 'square';
  index?: string | number;
  defaultOpen?: boolean;
  onProjectSelect: (project: Project, e: React.MouseEvent) => void;
}

function getContrastTextColor(hexColor: string): '#06130e' | '#ffffff' {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#06130e' : '#ffffff';
}

function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

const ShowcaseSection: FC<ShowcaseSectionProps> = ({
  title,
  subtitle,
  label,
  items,
  accentColor,
  secondColor,
  chips,
  format,
  index = '01',
  defaultOpen = false,
  onProjectSelect,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const cssVars = {
    '--fa': accentColor,
    '--fb': secondColor,
  } as React.CSSProperties;

  return (
    <div className="fs-wrapper" style={cssVars}>
      <AnimatePresence mode="wait" initial={false}>
        {!isOpen ? (
          <motion.div
            key="showcaseClosed"
            className="portfolio-showcase-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portfolio-showcase-card__glow-border" />

            <div className="portfolio-showcase-card__tabbar">
              <div className="portfolio-showcase-card__pill">
                <span className="portfolio-showcase-card__pill-dot" style={{ backgroundColor: accentColor }} />
                <span className="portfolio-showcase-card__pill-text">{label}</span>
              </div>
              <span className="portfolio-showcase-card__count">{items.length} works</span>
            </div>

            <div className="portfolio-showcase-card__body">
              <div className="portfolio-showcase-card__visual">
                <LiquidGlassFolder
                  items={items}
                  format={format}
                  accentColor={accentColor}
                  secondColor={secondColor}
                  label={label}
                  count={items.length}
                  index={index}
                  onOpenFolder={() => setIsOpen(true)}
                />
              </div>

              <div className="portfolio-showcase-card__content">
                <div className="portfolio-showcase-card__header">
                  <span className="portfolio-showcase-card__category" style={{ color: accentColor }}>
                    {label}
                  </span>
                  <h3 className="portfolio-showcase-card__title">{title}</h3>
                  <p className="portfolio-showcase-card__subtitle">{subtitle}</p>
                </div>

                <div className="portfolio-showcase-card__chips">
                  {chips.map((chip, i) => (
                    <span key={i} className="portfolio-showcase-card__chip">
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="portfolio-showcase-card__actions">
                  <button
                    className="portfolio-showcase-card__cta-btn"
                    onClick={() => setIsOpen(true)}
                    aria-label={`Explore ${title} collection`}
                    style={{
                      '--folder-accent': accentColor,
                      '--folder-second': secondColor,
                      '--folder-hover-text': getContrastTextColor(accentColor),
                    } as React.CSSProperties}
                  >
                    <span className="portfolio-showcase-card__cta-text">Explore Collection</span>
                    <span className="portfolio-showcase-card__cta-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                    <div
                      className="portfolio-showcase-card__cta-glow"
                      style={{ background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)` }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="showcaseOpen"
            className={`fs-open fs-open--${format}`}
            initial={{ opacity: 0, scaleY: 0.94, transformOrigin: 'top' }}
            animate={{ opacity: 1, scaleY: 1, transformOrigin: 'top' }}
            exit={{ opacity: 0, scaleY: 0.94, transformOrigin: 'top' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="fs-open__bar">
              <div className="fs-open__bar-left">
                <div className="fs-open__dots">
                  <span /><span /><span />
                </div>
                <div className="fs-open__breadcrumb">
                  <span className="fs-open__breadcrumb-root">Portfolio</span>
                  <span className="fs-open__breadcrumb-sep">›</span>
                  <span className="fs-open__breadcrumb-current" style={{ color: accentColor }}>
                    {title}
                  </span>
                </div>
              </div>

              <div className="fs-open__bar-right">
                <span className="fs-open__count-chip">{items.length} works</span>
                <motion.button
                  className="fs-close-btn"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Close folder"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <motion.div
              className="fs-open__divider"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className={`fs-grid fs-grid--${format}`}>
              {items.map((item, i) => {
                const isVideo = !!item.video;
                const isVert = isVideo && isVerticalVideo(item);
                const displayTags = item.tags.filter(
                  (t) => !t.startsWith('Row') && t !== 'Short-form' && t !== 'Vertical Video' && t !== 'Shorts' && t !== 'Reel'
                );

                return (
                  <motion.div
                    key={item.id}
                    className="fs-grid__item"
                    initial={{ opacity: 0, scale: 0.9, y: 22 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: 0.04 + i * 0.03,
                      duration: 0.48,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div
                      className={`fs-grid-card ${isVideo ? 'fs-grid-card--video' : 'fs-grid-card--image'} ${item.category === 'logo' ? 'fs-grid-card--logo' : ''}`}
                      onClick={(e) => onProjectSelect(item, e)}
                      role="button"
                      tabIndex={0}
                      style={item.color1 ? { '--fa-rgb': hexToRgbString(item.color1) } as React.CSSProperties : undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onProjectSelect(item, e as unknown as React.MouseEvent);
                        }
                      }}
                    >
                      <div
                        className={`fs-grid-card__media ${isVert
                          ? 'fs-grid-card__media--portrait'
                          : format === 'landscape'
                            ? 'fs-grid-card__media--landscape'
                            : item.aspectRatio === '4/5' || item.aspectRatio === '4:5'
                              ? 'fs-grid-card__media--4-5'
                              : 'fs-grid-card__media--square'
                          }`}
                      >
                        <img
                          src={getVideoThumb(item)}
                          alt={item.title}
                          className="fs-grid-card__img"
                          loading="lazy"
                          draggable={false}
                        />

                        {item.year && (
                          <div className="fs-grid-card__topbar">
                            <span className="fs-grid-card__year">{item.year}</span>
                          </div>
                        )}

                        <div className="fs-grid-card__play">
                          {isVideo ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="8,5 19,12 8,19" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <path d="M21 21l-4.35-4.35" />
                            </svg>
                          )}
                        </div>

                        <div className="fs-grid-card__gradient" />
                        <div className="fs-grid-card__shine" />
                      </div>

                      <div className="fs-grid-card__meta">
                        <h4 className="fs-grid-card__name">{item.name || item.title}</h4>

                        {displayTags.length > 0 && (
                          <div className="fs-grid-card__tags">
                            {displayTags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="fs-grid-card__tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PortfolioPage: FC = () => {
  const [filter, setFilter] = useState<string>(() => sessionStorage.getItem('portfolioFilter') || 'all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    const savedId = sessionStorage.getItem('portfolioProject');
    if (savedId) {
      const p = projects.find((pr) => pr.id.toString() === savedId);
      if (p) return p;
    }
    return null;
  });
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('portfolioFilter', filter);
  }, [filter]);

  useEffect(() => {
    if (selectedProject) {
      sessionStorage.setItem('portfolioProject', selectedProject.id.toString());
    } else {
      sessionStorage.removeItem('portfolioProject');
    }
  }, [selectedProject]);

  useEffect(() => {
    const state = location.state as { projectId?: number } | null;
    if (state?.projectId) {
      const project = projects.find((p) => p.id === state.projectId);
      if (project) {
        setSelectedProject(project);
        setOriginRect(null);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };
    document.addEventListener('keydown', handleEsc);

    if (selectedProject) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [selectedProject]);

  const posterProjects = projects.filter((p) => p.category === 'poster');
  const logoProjects = projects.filter((p) => p.category === 'logo');
  const videoProjects = projects.filter((p) => p.category === 'video');
  const longFormVideos = videoProjects.filter((p) => !isVerticalVideo(p));
  const shortFormVideos = videoProjects.filter((p) => isVerticalVideo(p));

  const handleProjectSelect = useCallback((project: Project, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <PageTransition>
      <section className="page-hero">
        <FloatingShapes />
        <div className="container">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="section-label__line" /> Curated Archive
          </motion.span>
          <motion.h1
            className="page-hero__title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Selected <span className="text-gradient">Projects</span>
          </motion.h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div
            className="portfolio-filter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {CATEGORIES.map((cat) => (
              <GlassButton
                key={cat}
                className={`portfolio-filter-btn portfolio-filter-btn--${cat}`}
                variant={filter === cat ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All Work' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </GlassButton>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="project-grid-container"
            >
              {filter === 'all' && (
                <div className="portfolio-sections">
                  <ShowcaseSection
                    title="Video Production"
                    subtitle="Cinematic brand films, commercial edits & motion graphics"
                    label="Long-form Videos"
                    items={longFormVideos}
                    accentColor="#00ffcc"
                    secondColor="#0052ff"
                    chips={['4K Master', 'Color Grading', 'Sound Design', 'Motion VFX']}
                    format="landscape"
                    index="01"
                    onProjectSelect={handleProjectSelect}
                  />
                  <ShowcaseSection
                    title="Shorts & Reels"
                    subtitle="Vertical kinetic design, fast-paced edits & viral hooks"
                    label="Short-form Videos"
                    items={shortFormVideos}
                    accentColor="#a855f7"
                    secondColor="#ff3d9a"
                    chips={['9:16 Vertical', 'Kinetic Typography', 'Social Hooks', 'Fast Paced']}
                    format="portrait"
                    index="02"
                    onProjectSelect={handleProjectSelect}
                  />
                  <ShowcaseSection
                    title="Poster Design"
                    subtitle="High-impact key visuals, event creatives & digital art"
                    label="Poster Design"
                    items={posterProjects}
                    accentColor="#b8fc3a"
                    secondColor="#d4ff70"
                    chips={['Key Visuals', 'Digital Art', 'Typography', 'Print & Social']}
                    format="square"
                    index="03"
                    onProjectSelect={handleProjectSelect}
                  />
                  <ShowcaseSection
                    title="Logo & Branding"
                    subtitle="Distinctive marks, identity systems & complete brand guidelines"
                    label="Logo & Branding"
                    items={logoProjects}
                    accentColor="#00cfff"
                    secondColor="#7dd8ff"
                    chips={['Brand Systems', 'Vector Marks', 'Identity Guides', 'Iconography']}
                    format="square"
                    index="04"
                    onProjectSelect={handleProjectSelect}
                  />
                </div>
              )}

              {filter === 'poster' && (
                <ShowcaseSection
                  title="Poster Design"
                  subtitle="High-impact key visuals, event creatives & digital art"
                  label="Poster Design"
                  items={posterProjects}
                  accentColor="#b8fc3a"
                  secondColor="#d4ff70"
                  chips={['Key Visuals', 'Digital Art', 'Typography', 'Print & Social']}
                  format="square"
                  index="01"
                  defaultOpen
                  onProjectSelect={handleProjectSelect}
                />
              )}

              {filter === 'logo' && (
                <ShowcaseSection
                  title="Logo & Branding"
                  subtitle="Distinctive marks, identity systems & complete brand guidelines"
                  label="Logo & Branding"
                  items={logoProjects}
                  accentColor="#00cfff"
                  secondColor="#7dd8ff"
                  chips={['Brand Systems', 'Vector Marks', 'Identity Guides', 'Iconography']}
                  format="square"
                  index="01"
                  defaultOpen
                  onProjectSelect={handleProjectSelect}
                />
              )}

              {filter === 'video' && (
                <div className="portfolio-sections">
                  <ShowcaseSection
                    title="Video Production"
                    subtitle="Cinematic brand films, commercial edits & motion graphics"
                    label="Long-form Videos"
                    items={longFormVideos}
                    accentColor="#00ffcc"
                    secondColor="#0052ff"
                    chips={['4K Master', 'Color Grading', 'Sound Design', 'Motion VFX']}
                    format="landscape"
                    index="01"
                    defaultOpen
                    onProjectSelect={handleProjectSelect}
                  />
                  <ShowcaseSection
                    title="Shorts & Reels"
                    subtitle="Vertical kinetic design, fast-paced edits & viral hooks"
                    label="Short-form Videos"
                    items={shortFormVideos}
                    accentColor="#a855f7"
                    secondColor="#ff3d9a"
                    chips={['9:16 Vertical', 'Kinetic Typography', 'Social Hooks', 'Fast Paced']}
                    format="portrait"
                    index="02"
                    defaultOpen
                    onProjectSelect={handleProjectSelect}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <MorphingPreviewModal
                key={`preview-${selectedProject.id}`}
                project={selectedProject}
                originRect={originRect}
                onClose={handleCloseModal}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </PageTransition>
  );
};

export default PortfolioPage;
