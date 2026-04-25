import React, { FC, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassButton, GlassCard, FloatingShapes, PageTransition, ProjectCard } from '../components';
import { projects } from '../data';

const HomePage: FC = () => {
  const navigate = useNavigate();
  const titleRef  = useRef<HTMLHeadingElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const handleTitleMouseMove = (e: React.MouseEvent) => {
    if (!titleRef.current || !revealRef.current) return;
    const rect = titleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    revealRef.current.style.maskImage        = `radial-gradient(circle 180px at ${x}px ${y}px, black 0%, transparent 100%)`;
    revealRef.current.style.webkitMaskImage  = `radial-gradient(circle 180px at ${x}px ${y}px, black 0%, transparent 100%)`;
    revealRef.current.style.opacity = '1';
  };

  const handleTitleMouseLeave = () => {
    if (revealRef.current) revealRef.current.style.opacity = '0';
  };

  return (
    <PageTransition>
      {/* ── Hero ── */}
      <section className="hero">
        <FloatingShapes />
        <div className="hero__bg-text">
          <motion.span
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            O_C CREATIVE STUDIO ✦ DESIGN ✦ VIDEO ✦ MOTION ✦ O_C CREATIVE STUDIO ✦ DESIGN ✦ VIDEO ✦ MOTION ✦&nbsp;
          </motion.span>
        </div>

        <div className="hero__content">
          <motion.div
            className="hero__badge glass-pill"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="pulse-dot" />
            Available for Freelance Projects
          </motion.div>

          <motion.h1
            ref={titleRef}
            className="hero__title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleTitleMouseMove}
            onMouseLeave={handleTitleMouseLeave}
          >
            <span className="hero__title-line hero__title-line--outline">Creative</span>
            <span className="hero__title-line"><span className="text-gradient">Designer</span> &</span>
            <span className="hero__title-line">Video <span className="text-gradient">Editor</span></span>

            <div ref={revealRef} className="hero__title-reveal" style={{ opacity: 0, transition: 'opacity 0.3s ease' }} aria-hidden="true">
              <span className="hero__title-line hero__title-line--outline">Creative</span>
              <span className="hero__title-line">Designer &</span>
              <span className="hero__title-line">Video Editor</span>
            </div>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            I transform ideas into stunning visuals and cinematic experiences.
            Every pixel is intentional. Every frame tells a story.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <GlassButton variant="primary"   size="lg" onClick={() => navigate('/portfolio')}>Explore My Work ↗</GlassButton>
            <GlassButton variant="secondary" size="lg" onClick={() => navigate('/contact'  )}>Let's Talk</GlassButton>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee">
        <motion.div className="marquee__track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
          {['Graphic Design','Video Editing','Motion Graphics','Brand Identity','UI/UX','Color Grading','Typography','3D Design']
            .concat(['Graphic Design','Video Editing','Motion Graphics','Brand Identity','UI/UX','Color Grading','Typography','3D Design'])
            .map((item, i) => (
              <span key={i} className="marquee__item">{item} <span className="marquee__star">✦</span></span>
            ))}
        </motion.div>
      </div>

      {/* ── Featured Projects ── */}
      <section className="section">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="section-label"><span className="section-label__line" />Featured Work</span>
            <h2 className="section-title">Selected <span className="text-thin">Projects</span></h2>
          </motion.div>

          <div className="project-grid">
            {projects.slice(0, 6).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

          <motion.div className="section-footer" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginTop: '60px' }}>
            <GlassButton variant="secondary" size="lg" onClick={() => navigate('/portfolio')}>Explore Full Gallery ↗</GlassButton>
          </motion.div>
        </div>
      </section>

      {/* ── Services Quick ── */}
      <section className="section section--dark">
        <div className="container">
          <motion.div className="section-header section-header--center" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> What I Do</span>
            <h2 className="section-title">Services <span className="text-thin">I Offer</span></h2>
          </motion.div>

          <div className="services-quick-grid">
            {[
              { num: '01', title: 'Graphic Design',       desc: 'Logos, brand guides, and visual systems that define a professional and unforgettable brand identity.', image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=700&auto=format&fit=crop&q=60' },
              { num: '02', title: 'Video Editing',        desc: 'Cinematic edits, professional color grading, and motion graphics that turn raw footage into compelling stories.', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop' },
              { num: '03', title: 'Motion Graphics',      desc: 'Custom animations, 2D/3D logo reveals, and kinetic typography that breathe life into static designs.', image: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { num: '04', title: 'Color Grading & Post', desc: 'Cinematic color grading, advanced compositing, and pristine audio mixing for premium post-production.', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop' },
            ].map((s, i) => (
              <div
                key={s.num}
                className="skill-glow-wrap"
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.setProperty('--mx', '-999px');
                  e.currentTarget.style.setProperty('--my', '-999px');
                }}
              >
                <GlassCard className="service-quick-card" delay={i * 0.1}>
                  <div className="service-quick-card__image-wrap">
                    <img src={s.image} alt={s.title} className="service-quick-card__img" />
                  </div>
                  <span className="service-quick-card__num">{s.num}</span>
                  <h3 className="service-quick-card__title">{s.title}</h3>
                  <p className="service-quick-card__desc">{s.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>

          <motion.div className="section-footer" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <GlassButton variant="ghost" size="lg" onClick={() => navigate('/services')}>All Services →</GlassButton>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <motion.div className="cta-glass" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="cta-glass__title">Ready to Elevate <span className="text-gradient">Your Brand?</span></h2>
            <p className="cta-glass__text">Let's craft a visual identity that leaves a lasting impression.</p>
            <GlassButton variant="primary" size="lg" onClick={() => navigate('/contact')}>Get In Touch ↗</GlassButton>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default HomePage;
