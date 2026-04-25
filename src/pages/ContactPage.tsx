import React, { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition, BorderGlow } from '../components';

const ContactPage: FC = () => {
  const [form, setForm] = useState({ name: '', email: '', service: '', budget: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = encodeURIComponent(`Portfolio Inquiry — ${form.service || 'New Project'}`);
    const b = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nService: ${form.service}\nBudget: ${form.budget}\n\nMessage:\n${form.message}`);
    window.location.href = `mailto:zanoc.designer@gmail.com?subject=${s}&body=${b}`;
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: '', email: '', service: '', budget: '', message: '' }); }, 3000);
  };

  const detailItems = [
    { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, label: 'EMAIL', value: 'zanoc.designer@gmail.com', dot: false },
    { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>, label: 'LOCATION', value: 'India, Earth', dot: true },
    { icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, label: 'AVAILABILITY', value: 'Mon - Sat | 10AM - 7PM IST', dot: true },
  ];

  const inputIcon = (d: React.ReactNode) => (
    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  );

  return (
    <PageTransition>
      <section className="contact-v2">
        <div className="container">
          <div className="contact-v2__grid">

            {/* ── LEFT ── */}
            <motion.div className="contact-v2__left" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="contact-pill"><span className="contact-pill__star">✦</span> GET IN TOUCH</div>

              <h1 className="contact-v2__heading">
                Let's Create<br/>
                Something <span className="text-gradient">Amazing</span>
              </h1>

              <p className="contact-v2__sub">
                Have a project in mind? Let's bring your ideas to life.
                Fill out the form and I'll get back to you as soon as possible.
              </p>

              <div className="contact-v2__details">
                {detailItems.map((d, i) => (
                  <BorderGlow key={i} className="contact-v2__detail-glow" radius={200}>
                    <div className="contact-v2__detail">
                      <div className="contact-v2__detail-ring">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d.icon}</svg>
                      </div>
                      <div className="contact-v2__detail-text">
                        <span className="contact-v2__detail-label">{d.label}</span>
                        <span className="contact-v2__detail-value">
                          {d.value}
                          {d.dot && <span className="contact-v2__dot" />}
                        </span>
                      </div>
                    </div>
                  </BorderGlow>
                ))}
              </div>
            </motion.div>

            {/* ── RIGHT ── */}
            <motion.div className="contact-v2__right" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
              <BorderGlow className="contact-v2__form-glow" radius={400}>
                <form className="contact-v2__form" onSubmit={submit}>
                  <div className="contact-pill contact-pill--form"><span className="contact-pill__star">✦</span> SEND A MESSAGE</div>

                  <div className="contact-v2__form-grid">
                    <BorderGlow className="contact-v2__input-glow" radius={180}>
                      <div className="contact-v2__input-wrap">
                        {inputIcon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>)}
                        <input type="text" placeholder="Your Name" value={form.name} onChange={set('name')} required />
                      </div>
                    </BorderGlow>

                    <BorderGlow className="contact-v2__input-glow" radius={180}>
                      <div className="contact-v2__input-wrap">
                        {inputIcon(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>)}
                        <input type="email" placeholder="Your Email" value={form.email} onChange={set('email')} required />
                      </div>
                    </BorderGlow>

                    <BorderGlow className="contact-v2__input-glow" radius={180}>
                      <div className="contact-v2__input-wrap">
                        {inputIcon(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)}
                        <select value={form.budget} onChange={set('budget')} required>
                          <option value="" disabled>Your Budget</option>
                          <option>Under $50</option>
                          <option>$50 – $100</option>
                          <option>$100 – $500</option>
                          <option>$500 – $1000</option>
                          <option>$1000+</option>
                        </select>
                      </div>
                    </BorderGlow>

                    <BorderGlow className="contact-v2__input-glow" radius={180}>
                      <div className="contact-v2__input-wrap">
                        {inputIcon(<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>)}
                        <select value={form.service} onChange={set('service')} required>
                          <option value="" disabled>Project Type</option>
                          <option>Short/Reel Video Editing</option>
                          <option>Long Video Editing</option>
                          <option>Motion Graphics</option>
                          <option>Social Media Post</option>
                          <option>Promotional Poster</option>
                          <option>Logo Design</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </BorderGlow>
                  </div>

                  <BorderGlow className="contact-v2__input-glow contact-v2__textarea-glow" radius={250}>
                    <div className="contact-v2__input-wrap contact-v2__input-wrap--textarea">
                      {inputIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>)}
                      <textarea placeholder="Tell me about your project..." rows={5} value={form.message} onChange={set('message')} required />
                      <span className="contact-v2__charcount">{form.message.length}/500</span>
                    </div>
                  </BorderGlow>

                  <button type="submit" className="contact-v2__submit" data-cursor="Submit">
                    {sent ? 'Opening Mail Client... ✓' : 'SEND MESSAGE ↗'}
                  </button>
                </form>
              </BorderGlow>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ContactPage;
