# O_C Creative — Portfolio

> Omkar Chandra | Creative Designer & Video Editor

A modern, dark-mode portfolio built with **React + TypeScript**, featuring smooth scroll (Lenis), Framer Motion page transitions, a custom cursor system, and a glassmorphism design language.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router v7 |
| Animation | Framer Motion |
| Smooth Scroll | Lenis |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Syne · Space Grotesk · Inter · Bebas Neue |

## Project Structure

```
Portfolio-main/
├── public/
│   ├── favicon.ico          # Brand favicon
│   ├── LOGO.webp            # OC logo (nav + OG image)
│   ├── omkar.webp           # About page portrait
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt
│   ├── index.html           # HTML entry + font preloads
│   ├── Icon/                # Tool/social SVG icons
│   ├── Logo/                # Client logo assets
│   └── Poster/              # Portfolio poster images
└── src/
    ├── App.tsx              # All pages + components (monorepo)
    ├── App.css              # Full design system
    └── index.tsx            # React entry point
```

## Pages

- **Home** — Hero with spotlight reveal, project grid preview, services teaser, CTA
- **About** — Bio, skills grid with animated bars, education & experience timelines
- **Services** — Full-detail service list with feature breakdowns
- **Portfolio** — Filterable grid (Poster / Logo / Video) with modal viewer
- **Contact** — Form with mailto fallback, social links

## Development

```bash
npm install
npm start       # Dev server → http://localhost:3000
npm run build   # Production build
```

## Contact

**Instagram:** [@omkar_chandra](https://instagram.com/omkar_chandra)  
**LinkedIn:** [Omkar Chandra Gour](https://www.linkedin.com/in/omkar-chandra-gour-09a556319/)
