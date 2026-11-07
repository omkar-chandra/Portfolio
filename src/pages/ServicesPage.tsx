import React, { FC } from 'react';
import { motion } from 'framer-motion';
import {
  FloatingShapes, PageTransition,
  GraphicDesignStudio, VideoEditorStudio, MotionGraphicsStudio, ColorGradingStudio,
  ServiceCardWrapper, ServicesHeaderNav,
  LightbulbIcon, TargetCompassIcon, ZapIcon, RocketIcon
} from '../components';
import { SoftwareIcons } from '../data';

const ServicesPage: FC = () => {

  return (
    <PageTransition>
      <section className="page-hero">
        <FloatingShapes />
        <div className="container">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="section-label__line" /> What I Do
          </motion.span>
          <motion.h1 className="page-hero__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            My <span className="text-gradient">Services</span>
          </motion.h1>
          <motion.p className="page-hero__subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            Comprehensive creative solutions tailored to your needs
          </motion.p>
        </div>
      </section>

      {/* ── Redesigned Interactive Creative Studios Suite ── */}
      <section className="section services-interactive-section">
        <div className="container">
          {/* Quick jump tabs */}
          <ServicesHeaderNav />

          {/* 4 Perfectly Aligned Studios Arranged Vertically */}
          <div className="services-studios-stack">
            {/* 01: Graphic Design Studio */}
            <ServiceCardWrapper
              id="graphic-design-studio"
              number="01"
              softwareBadge="Vector & Layout Engine"
              softwareIcon={SoftwareIcons.illustrator}
              title="Graphic & Brand Design"
              tags={['Brand Identity', 'Typography', 'Vector Artboard', 'Vector Export']}
              contactServiceQuery="Graphic Design"
            >
              <GraphicDesignStudio />
            </ServiceCardWrapper>

            {/* 02: Video Editing Studio */}
            <ServiceCardWrapper
              id="video-editing-studio"
              number="02"
              softwareBadge="Premiere Pro Lab"
              softwareIcon={SoftwareIcons.premierePro}
              title="Cinematic Video Editing"
              tags={['4K Timeline', 'Razor Cut Tool', 'Text Overlay', 'Audio Mastering']}
              contactServiceQuery="Video Editing"
            >
              <VideoEditorStudio />
            </ServiceCardWrapper>

            {/* 03: Motion Graphics Studio */}
            <ServiceCardWrapper
              id="motion-graphics-studio"
              number="03"
              softwareBadge="After Effects Engine"
              softwareIcon={SoftwareIcons.afterEffects}
              title="Motion Graphics & Dynamics"
              tags={['Kinetic Typo', '10 Motion Elements', 'Interactive Scrub Timeline', 'Rig Animation']}
              contactServiceQuery="Motion Graphics"
            >
              <MotionGraphicsStudio />
            </ServiceCardWrapper>

            {/* 04: Color Grading Studio */}
            <ServiceCardWrapper
              id="color-grading-studio"
              number="04"
              softwareBadge="DaVinci Resolve Suite"
              softwareIcon={SoftwareIcons.davinci}
              title="Cinematic Color Grading"
              tags={['5 Raw Images', 'Split Wipe Slider', 'Film LUT Packs', '3-Way Color Wheels']}
              contactServiceQuery="Color Grading"
            >
              <ColorGradingStudio />
            </ServiceCardWrapper>
          </div>
        </div>
      </section>

      <section className="section section--dark process-section-redesign">
        <div className="container">
          <motion.div
            className="section-header section-header--center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label"><span className="section-label__line" /> How It Works</span>
            <h2 className="section-title">My <span className="text-thin">Process</span></h2>
            <p className="process-intro-text">Four deliberate stages. One cohesive result.</p>
          </motion.div>

          <div className="process-flow">
            {[
              {
                step: '01',
                title: 'Discovery',
                desc: 'We discuss your vision, goals, and requirements in detail. Deep listening, sharp questions — the foundation everything else rests on.',
                icon: <LightbulbIcon size={26} />,
                accent: '#B3E32B',
                tag: 'Brief & Goals',
              },
              {
                step: '02',
                title: 'Concept',
                desc: 'Research, mood boards, and creative exploration. I map out the creative territory before touching a single tool.',
                icon: <TargetCompassIcon size={26} />,
                accent: '#00d2ff',
                tag: 'Creative Direction',
              },
              {
                step: '03',
                title: 'Create',
                desc: 'Bringing the concept to life with precision and creativity. Every pixel, every frame — crafted with intention.',
                icon: <ZapIcon size={26} />,
                accent: '#a855f7',
                tag: 'Production',
              },
              {
                step: '04',
                title: 'Deliver',
                desc: 'Final refinements and delivery in all required formats. Clean handoff, thorough documentation, and ongoing support.',
                icon: <RocketIcon size={26} />,
                accent: '#ff6b35',
                tag: 'Launch Ready',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className={`process-flow__item ${i % 2 === 1 ? 'process-flow__item--alt' : ''}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Giant ghost number — graphic weight anchor */}
                <div className="process-flow__ghost-num" aria-hidden="true">
                  {item.step}
                </div>

                {/* Icon column */}
                <div className="process-flow__icon-col">
                  <div
                    className="process-flow__icon-ring"
                    style={{ '--ring-color': item.accent } as React.CSSProperties}
                  >
                    <span className="process-flow__icon-vector" style={{ color: item.accent }}>
                      {item.icon}
                    </span>
                  </div>
                  {/* Vertical connector line (hidden on last item) */}
                  {i < 3 && (
                    <div className="process-flow__connector" style={{ '--connector-color': item.accent } as React.CSSProperties} />
                  )}
                </div>

                {/* Content */}
                <div className="process-flow__content">
                  <div className="process-flow__meta">
                    <span
                      className="process-flow__tag"
                      style={{ '--tag-color': item.accent } as React.CSSProperties}
                    >
                      {item.tag}
                    </span>
                    <span className="process-flow__step-label">Step {item.step}</span>
                  </div>
                  <h3 className="process-flow__title">{item.title}</h3>
                  <p className="process-flow__desc">{item.desc}</p>
                  {/* Accent rule */}
                  <div
                    className="process-flow__rule"
                    style={{ '--rule-color': item.accent } as React.CSSProperties}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ServicesPage;
