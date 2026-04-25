import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassButton, GlassCard, FloatingShapes, PageTransition } from '../components';
import { SoftwareIcons } from '../data';

const SERVICES = [
  {
    num: '01', icon: SoftwareIcons.photoshop,
    title: 'Graphic & Brand Design',
    description: 'I create distinctive brand identities and high-impact visuals. From professional logo systems to scroll-stopping social media graphics and print materials — every element is crafted to be memorable.',
    features: ['Logo Design & Brand Systems', 'Social Media Content & Kits', 'Poster & Print Editorial', 'Color Palette & Typography', 'AI-Augmented Concept Ideation'],
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop',
  },
  {
    num: '02', icon: SoftwareIcons.premierePro,
    title: 'Video Editing & Motion',
    description: 'Cinema-quality editing combined with dynamic motion graphics. I create UGC ads using AI — creative video concepts, AI scripting, and trendy AI-driven content, plus cinematic storytelling and AI promotional video production.',
    features: ['Cinematic Color Grading', 'Motion Graphics & Particle FX', 'Kinetic Typography', 'Sound Design & Audio Sync', 'Short-form & YouTube Editing'],
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
  },
  {
    num: '03', icon: SoftwareIcons.afterEffects,
    title: 'Motion Graphics & Animation',
    description: 'Bringing static designs to life. I create engaging 2D/3D motion graphics, logo reveals, and custom animations — including 3D edits using GLB files to capture attention in an overcrowded digital landscape.',
    features: ['Custom Logo Reveals', 'Explainer Videos', '2D/3D Abstract Animations', 'UI/UX Motion Prototypes', 'Lottie Animations'],
    image: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    num: '04', icon: SoftwareIcons.davinci,
    title: 'Color Grading & Post',
    description: 'Delivering the final cinematic polish. Advanced color grading, sound design, and visual compositing to elevate raw footage to industry standards.',
    features: ['Cinematic Color Grading', 'Audio Mixing & Sound Design', 'Visual Compositing', 'LUT Creation', 'Multi-Cam Editing'],
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
  },
];

const ServicesPage: FC = () => {
  const navigate = useNavigate();

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

      <section className="section">
        <div className="container">
          <div className="services-list">
            {SERVICES.map((service, i) => (
              <motion.div key={service.num} className="service-full" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7, delay: 0.1 }}>
                <div className="service-full__content">
                  <div className="service-full__header">
                    <span className="service-full__icon">{service.icon}</span>
                    <span className="service-full__num">{service.num}</span>
                  </div>
                  <h3 className="service-full__title">{service.title}</h3>
                  <p className="service-full__desc">{service.description}</p>
                  <ul className="service-full__features">
                    {service.features.map((f) => (
                      <li key={f}><span className="feature-check">✓</span> {f}</li>
                    ))}
                  </ul>
                  <div className="service-full__footer">
                    <GlassButton variant="primary" size="sm" onClick={() => navigate('/contact')}>Get Quote ↗</GlassButton>
                  </div>
                </div>
                <div className="service-full__image">
                  <img src={service.image} alt={service.title} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <motion.div className="section-header section-header--center" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> How It Works</span>
            <h2 className="section-title">My <span className="text-thin">Process</span></h2>
          </motion.div>

          <div className="process-grid">
            {[
              { step: '01', title: 'Discovery', desc: 'We discuss your vision, goals, and requirements in detail.', icon: '💡' },
              { step: '02', title: 'Concept',   desc: 'I research, brainstorm, and create mood boards and concepts.', icon: '🎯' },
              { step: '03', title: 'Create',    desc: 'Bringing the concept to life with precision and creativity.', icon: '⚡' },
              { step: '04', title: 'Deliver',   desc: 'Final refinements and delivery in all required formats.', icon: '🚀' },
            ].map((item, i) => (
              <GlassCard key={item.step} className="process-card" delay={i * 0.15}>
                <span className="process-card__icon">{item.icon}</span>
                <span className="process-card__step">Step {item.step}</span>
                <h3 className="process-card__title">{item.title}</h3>
                <p className="process-card__desc">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ServicesPage;
