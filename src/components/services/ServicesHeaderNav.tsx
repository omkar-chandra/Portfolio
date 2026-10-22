import React, { FC } from 'react';

interface TabItem {
  id: string;
  number: string;
  label: string;
  badge: string;
}

const TABS: TabItem[] = [
  { id: 'graphic-design-studio', number: '01', label: 'Graphic Design', badge: 'Vector & Layout' },
  { id: 'video-editing-studio', number: '02', label: 'Video Editing', badge: 'Premiere Pro' },
  { id: 'motion-graphics-studio', number: '03', label: 'Motion Graphics', badge: 'After Effects' },
  { id: 'color-grading-studio', number: '04', label: 'Color Grading', badge: 'DaVinci Resolve' },
];

export const ServicesHeaderNav: FC<{ activeTab?: string }> = ({ activeTab = 'graphic-design-studio' }) => {
  const scrollToStudio = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="services-tab-nav" aria-label="Services Navigation">
      <div className="services-tab-nav__track">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`services-tab-nav__btn ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => scrollToStudio(tab.id)}
          >
            <span className="services-tab-nav__num">{tab.number}</span>
            <span className="services-tab-nav__label">{tab.label}</span>
            <span className="services-tab-nav__badge">{tab.badge}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
