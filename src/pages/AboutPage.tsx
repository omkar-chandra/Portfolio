import React, { FC, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingShapes, PageTransition } from '../components';
import { skillGroups, SoftwareIcons, education, experience } from '../data';

/* ── Skill card with mouse-tracked border glow ── */
const SkillGlowCard: FC<{ children: React.ReactNode; isLarge?: boolean }> = ({ children, isLarge }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--mx', '-999px');
    ref.current.style.setProperty('--my', '-999px');
  }, []);

  return (
    <div
      ref={ref}
      className={`skill-glow-wrap ${isLarge ? 'skill-glow-wrap--large' : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

/* ── 3D tilt card for about sections ── */
const TiltCard: FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -8;
    const tiltY = (x - 0.5) * 8;
    cardRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    // Spotlight tracking
    cardRef.current.style.setProperty('--sx', `${(e.clientX - rect.left)}px`);
    cardRef.current.style.setProperty('--sy', `${(e.clientY - rect.top)}px`);
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    cardRef.current.style.setProperty('--sx', '50%');
    cardRef.current.style.setProperty('--sy', '50%');
  };

  return (
    <motion.div
      ref={cardRef}
      className={`about-tilt-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const AboutPage: FC = () => {
  const [selectedPic, setSelectedPic] = useState<string | null>(null);

  return (
    <PageTransition>
      <section className="page-hero">
        <FloatingShapes />
        <div className="container">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="section-label__line" /> About Me
          </motion.span>
          <motion.h1 className="page-hero__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
            The Story <span className="text-thin">Behind</span><br />
            <span className="text-gradient">The Pixels</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Bio Card Section ── */}
      <section className="section">
        <div className="container">
          <div className="about-cards-grid">
            {/* Left — Image card */}
            <TiltCard className="about-card about-card--image" delay={0.1}>
              <div className="about-card__image-wrap">
                <img src="/omkar.webp" alt="Omkar Chandra" className="about-card__img" />
                <div className="about-card__image-overlay">
                  <span className="about-card__exp-badge">3+ YRS</span>
                </div>
              </div>
            </TiltCard>

            {/* Right — Bio card */}
            <TiltCard className="about-card about-card--bio" delay={0.2}>
              <div className="about-card__content">
                <span className="about-card__eyebrow">Who I Am</span>
                <h2 className="about-card__name">
                  <span className="about-card__name-first">Omkar</span>
                  <span className="about-card__name-last">Chandra</span>
                </h2>
                <div className="about-card__divider" />
                <p className="about-card__bio">
                  I'm a creative professional with 3+ years of experience producing compelling visual stories
                  across video, motion graphics, and brand design — including 1.5+ years of full-time work at
                  Zanthium Technosoft. I create high-impact UGC ads using AI: creative video concepts, AI
                  scripting, and trendy AI-driven content.
                </p>
                <p className="about-card__bio">
                  I am fluent in the full Adobe ecosystem and cutting-edge AI tools, bridging the gap between
                  traditional design and the future of digital creativity. In motion graphics, I specialize in
                  3D edits using GLB files — bringing a new dimension to digital storytelling.
                </p>
                <div className="about-card__tags">
                  <span className="about-card__tag">Video Editor</span>
                  <span className="about-card__tag">Motion Designer</span>
                  <span className="about-card__tag">Brand Designer</span>
                  <span className="about-card__tag">AI Creative</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── Live Pictures Marquee ── */}
      <section className="section" style={{ padding: '20px 0 60px 0' }}>
        <div className="pic-marquee">
          <div className="pic-marquee__track">
            {/* Render twice for seamless infinite scroll */}
            {[...Array.from({ length: 8 }, (_, i) => `/Pic/Pic (${i + 1}).webp`), 
              ...Array.from({ length: 8 }, (_, i) => `/Pic/Pic (${i + 1}).webp`)].map((src, idx) => (
              <div 
                key={idx} 
                className="pic-marquee__item"
                onClick={() => setSelectedPic(src)}
              >
                <img src={src} alt="Omkar Live" className="pic-marquee__img" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience Cards ── */}
      <section className="section section--dark">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> Experience</span>
            <h2 className="section-title">Work <span className="text-thin">History</span></h2>
          </motion.div>

          <div className="about-timeline-cards">
            {experience.map((item, i) => {
              const [start, end] = item.year.split('—').map(s => s.trim());
              return (
                <TiltCard key={i} className="about-card about-card--timeline" delay={i * 0.12}>
                  <div className="about-card__content">
                    <div className="about-card__timeline-header">
                      <div className="about-card__year-badge">
                        <span className="about-card__year-start">{start}</span>
                        {end && (
                          <>
                            <span className="about-card__year-sep">→</span>
                            <span className="about-card__year-end">{end}</span>
                          </>
                        )}
                      </div>
                      <span className="about-card__timeline-num">0{i + 1}</span>
                    </div>
                    <h3 className="about-card__timeline-title">{item.title}</h3>
                    <span className="about-card__timeline-sub">{item.subtitle}</span>
                    <p className="about-card__bio">{item.description}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Education Cards ── */}
      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> Education</span>
            <h2 className="section-title">Academic <span className="text-thin">Background</span></h2>
          </motion.div>

          <div className="about-timeline-cards">
            {education.map((item, i) => {
              const [start, end] = item.year.split('—').map(s => s.trim());
              return (
                <TiltCard key={i} className="about-card about-card--timeline" delay={i * 0.12}>
                  <div className="about-card__content">
                    <div className="about-card__timeline-header">
                      <div className="about-card__year-badge">
                        <span className="about-card__year-start">{start}</span>
                        {end && (
                          <>
                            <span className="about-card__year-sep">→</span>
                            <span className="about-card__year-end">{end}</span>
                          </>
                        )}
                      </div>
                      <span className="about-card__timeline-num">0{i + 1}</span>
                    </div>
                    <h3 className="about-card__timeline-title">{item.title}</h3>
                    <span className="about-card__timeline-sub">{item.subtitle}</span>
                    <p className="about-card__bio">{item.description}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="section section--dark">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> My Arsenal</span>
            <h2 className="section-title">Skills & <span className="text-thin">Tools</span></h2>
          </motion.div>

          <div className="skills-container">
            {skillGroups.map((group, gIdx) => (
              <div key={group.title} className={`skills-section ${group.isLarge ? 'skills-section--large' : ''}`}>
                <h3 className="skills-section__title">{group.title}</h3>
                <div className="skills-grid">
                  {group.items.map((skill, i) => (
                    <SkillGlowCard key={skill.name} isLarge={!!group.isLarge}>
                      <div className={`glass-card skill-card ${group.isLarge ? 'skill-card--large' : ''}`}>
                        <div className="skill-card__header">
                          <span className="skill-card__icon">{SoftwareIcons[skill.icon]}</span>
                          <div className="skill-card__info">
                            <span className="skill-card__name">{skill.name}</span>
                            {skill.description && <span className="skill-card__desc">{skill.description}</span>}
                          </div>
                          <span className="skill-card__level">{skill.level}%</span>
                        </div>
                        <div className="skill-bar">
                          <motion.div
                            className="skill-bar__fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: (gIdx * 3 + i) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    </SkillGlowCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Picture Modal ── */}
      <AnimatePresence>
        {selectedPic && (
          <motion.div 
            className="pic-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPic(null)}
          >
            <motion.button 
              className="pic-modal-close"
              onClick={() => setSelectedPic(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              ✕
            </motion.button>
            <motion.div 
              className="pic-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedPic} alt="Live view" className="pic-modal-img" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
};

export default AboutPage;
