import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { FloatingShapes, PageTransition } from '../components';

const PrivacyPage: FC = () => {
  return (
    <PageTransition>
      <section className="page-hero">
        <FloatingShapes />
        <div className="container">
          <motion.span className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="section-label__line" /> Legal
          </motion.span>
          <motion.h1 className="page-hero__title" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Privacy <span className="text-gradient">Policy</span>
          </motion.h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-content">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="privacy-update">Last Updated: April 2025</p>

              <div className="privacy-block">
                <h2>1. Introduction</h2>
                <p>
                  Welcome to the portfolio of Omkar Chandra. This Privacy Policy explains how I collect, use,
                  and protect your personal information when you visit this website. Your privacy matters — I take
                  it seriously.
                </p>
              </div>

              <div className="privacy-block">
                <h2>2. Information I Collect</h2>
                <p>When you interact with this website, I may collect:</p>
                <ul>
                  <li><strong>Contact Information</strong> — Name, email address, and message content when you use the contact form.</li>
                  <li><strong>Usage Data</strong> — Pages visited, time spent, browser type, and device information via analytics.</li>
                  <li><strong>Technical Data</strong> — IP address, browser version, and operating system for security purposes.</li>
                </ul>
              </div>

              <div className="privacy-block">
                <h2>3. How I Use Your Information</h2>
                <ul>
                  <li>To respond to your inquiries and project requests.</li>
                  <li>To improve the website experience and performance.</li>
                  <li>To protect against unauthorized access and abuse.</li>
                </ul>
              </div>

              <div className="privacy-block">
                <h2>4. Data Protection</h2>
                <p>
                  I implement industry-standard security measures to protect your personal data.
                  Your information is never sold, rented, or shared with third parties for marketing purposes.
                </p>
              </div>

              <div className="privacy-block">
                <h2>5. Cookies</h2>
                <p>
                  This website may use essential cookies for functionality. No third-party tracking cookies
                  are used without your consent.
                </p>
              </div>

              <div className="privacy-block">
                <h2>6. Third-Party Services</h2>
                <p>
                  This site may embed content from YouTube, Vimeo, or other platforms. These services have
                  their own privacy policies which govern their data collection.
                </p>
              </div>

              <div className="privacy-block">
                <h2>7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Request access to your personal data.</li>
                  <li>Request correction or deletion of your data.</li>
                  <li>Withdraw consent at any time.</li>
                </ul>
              </div>

              <div className="privacy-block">
                <h2>8. No Scraping or Copying</h2>
                <p>
                  All content on this website — including designs, videos, code, and text — is the
                  intellectual property of Omkar Chandra. Automated scraping, crawling, or copying of any
                  content is strictly prohibited. This site's <code>robots.txt</code> disallows all external
                  bots and crawlers.
                </p>
              </div>

              <div className="privacy-block">
                <h2>9. Contact</h2>
                <p>
                  For any privacy-related questions, reach out at{' '}
                  <a href="mailto:zanoc.designer@gmail.com" className="privacy-email">zanoc.designer@gmail.com</a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default PrivacyPage;
