import { SkillGroup } from '../types';
import SoftwareIcons from './icons';

export const skillGroups: SkillGroup[] = [
  {
    title: 'Video Production',
    items: [
      { name: 'After Effects',  level: 80, icon: 'afterEffects' },
      { name: 'Premiere Pro',   level: 85, icon: 'premierePro' },
      { name: 'DaVinci Resolve',level: 50, icon: 'davinci' },
    ],
  },
  {
    title: 'Design & Photo',
    items: [
      { name: 'Adobe Photoshop',  level: 90, icon: 'photoshop' },
      { name: 'Adobe Lightroom',  level: 95, icon: 'lightroom' },
      { name: 'Adobe Illustrator',level: 75, icon: 'illustrator' },
    ],
  },
  {
    title: 'Creative Tools',
    items: [
      { name: 'Figma',         level: 70, icon: 'figma' },
      { name: 'Canva',         level: 95, icon: 'canva' },
      { name: 'Google Gemini', level: 90, icon: 'gemini' },
    ],
  },
  {
    title: 'AI & Specialized Tools',
    isLarge: true,
    items: [
      { name: 'Claude AI',    level: 86, icon: 'claude', description: 'Advanced prompt engineering & creative assistance' },
      { name: 'Other Tools',  level: 80, icon: 'other',  description: 'Nano Banana, VEO 3, Midjourney, and Element 3D' },
    ],
  },
];

export { SoftwareIcons };
