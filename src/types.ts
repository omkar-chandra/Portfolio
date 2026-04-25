export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  life: number;
}

export interface Project {
  id: number;
  name: string;
  title: string;
  category: string;
  tags: string[];
  year: string;
  tools: string[];
  description: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  color1: string;
  color2: string;
}

export interface SkillItem {
  name: string;
  level: number;
  icon: string;
  description?: string;
}

export interface SkillGroup {
  title: string;
  isLarge?: boolean;
  items: SkillItem[];
}

export interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
}
