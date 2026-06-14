import React, { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GlassButton, FloatingShapes, PageTransition, ProjectCard } from '../components';
import { projects, isVerticalVideo } from '../data';
import { Project } from '../types';

const CATEGORIES = ['all', 'poster', 'video', 'logo'] as const;

/* ── Video Section: structured 3-row layout ────────────────────────── */
const VideoSection: FC<{ videos: Project[]; onViewAll: (() => void) | null }> = ({ videos, onViewAll }) => {
  const ytOriginal = videos.filter((v) => !v.tags.includes('Short-form') && v.id <= 34);
  const ytNew = videos.filter((v) => !v.tags.includes('Short-form') && v.id >= 35);
  const shorts = videos.filter((v) => v.tags.includes('Short-form'));

  return (
    <div className="portfolio-section">
      <div className="portfolio-section__header">
        <h2 className="portfolio-section__title">Video Production</h2>
        {onViewAll && (
          <GlassButton variant="ghost" size="sm" onClick={onViewAll} className="section-load-more">
            View All Videos ↗
          </GlassButton>
        )}
      </div>

      {/* Row 1 — Long-form YT (16:9), 3 cards */}
      <div className="video-row video-row--wide">
        {ytOriginal.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
      </div>

      {/* Row 2 — New YT videos, centered */}
      {ytNew.length > 0 && (
        <div className="video-row video-row--centered">
          {ytNew.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      )}

      {/* Row 3 — Shorts (9:16), rows of 3, last one centered */}
      <div className="video-row video-row--shorts">
        {shorts.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
      </div>
    </div>
  );
};

const PortfolioPage: FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const location = useLocation();

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  useEffect(() => {
    const state = location.state as { projectId?: number } | null;
    if (state?.projectId) {
      const project = projects.find((p) => p.id === state.projectId);
      if (project) { setSelectedProject(project); window.history.replaceState({}, document.title); }
    }
  }, [location]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedProject(null); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = selectedProject ? 'hidden' : '';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [selectedProject]);

  return (
    <PageTransition>
      <section className="page-hero">
        <FloatingShapes />
        <div className="container">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="section-label__line" /> My Work
          </motion.span>
          <motion.h1 className="page-hero__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Creative <span className="text-gradient">Portfolio</span>
          </motion.h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filter bar */}
          <motion.div className="portfolio-filter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {CATEGORIES.map((cat) => (
              <GlassButton key={cat} variant={filter === cat ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(cat)}>
                {cat === 'all' ? 'All Work' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </GlassButton>
            ))}
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="project-grid-container">
              {filter === 'all' ? (
                <div className="portfolio-sections">
                  {[
                    { title: 'Poster Design', items: projects.filter((p) => p.category === 'poster'), cat: 'poster' },
                    { title: 'Logo & Branding', items: projects.filter((p) => p.category === 'logo'), cat: 'logo' },
                  ].map((section) => (
                    <div className="portfolio-section" key={section.cat}>
                      <div className="portfolio-section__header">
                        <h2 className="portfolio-section__title">{section.title}</h2>
                        {section.items.length > 3 && (
                          <GlassButton variant="ghost" size="sm" onClick={() => setFilter(section.cat)} className="section-load-more">
                            View All {section.cat}s ↗
                          </GlassButton>
                        )}
                      </div>
                      <div className="project-grid">
                        {section.items.slice(0, 3).map((project, i) => (
                          <ProjectCard key={project.id} project={project} index={i} />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* ── Video Production (structured layout) ── */}
                  <VideoSection videos={projects.filter((p) => p.category === 'video')} onViewAll={() => setFilter('video')} />
                </div>
              ) : filter === 'video' ? (
                <VideoSection videos={filtered} onViewAll={null} />
              ) : (
                <div className="project-grid">
                  {filtered.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Project Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div className="project-modal" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}>
            <motion.div className="project-modal__content glass-card" initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()}>
              <button className="project-modal__close" onClick={() => setSelectedProject(null)} data-cursor="Close" aria-label="Close project modal">✕</button>

              <div className="project-modal__media-container">
                {selectedProject.video ? (() => {
                  const vert = isVerticalVideo(selectedProject);
                  const aspect = vert ? 'modal-media--9-16' : 'modal-media--16-9';
                  return (
                    <div className={`project-modal__media-wrapper ${aspect}`} style={{ maxHeight: '75vh', width: 'auto', maxWidth: '100%', margin: '0 auto' }}>
                      <video src={selectedProject.video} autoPlay loop playsInline controls controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} className="project-modal__video" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                  );
                })() : (
                  <div className="project-modal__3d-wrap" style={{ width: '100%', height: '100%' }}>
                    <div className="project-modal__media-wrapper modal-media--1-1" style={{ width: '100%' }}>
                      <img src={selectedProject.image} alt={selectedProject.title} className="project-modal__image" />
                    </div>
                  </div>
                )}
              </div>

              {!selectedProject.video && (
                <div className="project-modal__body">
                  <motion.div className="project-modal__title-shape" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="project-modal__title">{selectedProject.title}</h2>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default PortfolioPage;
