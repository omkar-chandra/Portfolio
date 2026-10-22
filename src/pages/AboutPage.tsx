import React, { FC, useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion';
import { FloatingShapes, PageTransition } from '../components';
import { skillGroups, SoftwareIcons, education, experience } from '../data';
import { SkillItem } from '../types';

/* ── High-Performance Pixel Reveal Image (with interactive Hover Effect) ── */
const PixelRevealImage: FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const isRevealedRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hoverWaveRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Viewport intersection detection
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main animation & interactive hover engine
  useEffect(() => {
    if (!imgLoaded || !inView) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!canvas || !wrap || !img) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const rect = wrap.getBoundingClientRect();
    const W = rect.width || img.naturalWidth || 400;
    const H = rect.height || img.naturalHeight || 500;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Calculate exact object-fit: cover source rectangle (top center crop)
    const imgAspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    const containerAspect = W / H;
    let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;
    if (imgAspect > containerAspect) {
      srcW = img.naturalHeight * containerAspect;
      srcX = (img.naturalWidth - srcW) / 2;
    } else {
      srcH = img.naturalWidth / containerAspect;
      srcY = 0; // top aligned
    }

    // Grid configuration: ~18px tactile pixel blocks
    const PIXEL_SIZE = 18;
    const cols = Math.max(8, Math.ceil(W / PIXEL_SIZE));
    const rows = Math.max(10, Math.ceil(H / PIXEL_SIZE));
    const total = cols * rows;
    const cellW = W / cols;
    const cellH = H / rows;
    const maxDim = Math.hypot(W, H) || 1;

    // Precalculate wave distance & dither noise per cell
    const cellDelays = new Float32Array(total);
    const noiseValues = new Float32Array(total);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const nx = c / (cols - 1 || 1);
        const ny = r / (rows - 1 || 1);
        const wave = nx * 0.6 + ny * 0.4;
        const noise = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
        const dither = (noise < 0 ? noise + 1 : noise) * 0.38;
        cellDelays[idx] = (wave * 0.62 + dither * 0.38) * 0.6;
        noiseValues[idx] = dither;
      }
    }

    // Interactive mouse hover trail array
    const hoverState = new Float32Array(total);

    const INTRO_DURATION = 1400; // ms
    let startTime: number | null = null;
    let rafId: number;

    const render = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const introProgress = Math.min(1, elapsed / INTRO_DURATION);
      const isIntroActive = introProgress < 1;

      ctx.clearRect(0, 0, W, H);

      let anyHoverActive = false;
      const currentMouse = mousePosRef.current;
      const hoverWave = hoverWaveRef.current;
      const waveElapsed = hoverWave ? time - hoverWave.time : 99999;
      const WAVE_DURATION = 750; // ms

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cx = (c + 0.5) * cellW;
          const cy = (r + 0.5) * cellH;

          let localT = 1;
          let hoverIntensity = 0;

          if (isIntroActive) {
            const delay = cellDelays[idx];
            const cellDuration = 0.4;
            localT = Math.max(0, Math.min(1, (introProgress - delay) / cellDuration));

            if (localT <= 0) {
              // Unrevealed state
              ctx.fillStyle = '#060709';
              ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
              ctx.lineWidth = 1;
              ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
              continue;
            }
          } else {
            // Intro is finished; handle interactive hover dynamics
            if (currentMouse) {
              const dx = cx - currentMouse.x;
              const dy = cy - currentMouse.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 80) {
                const impact = (1 - dist / 80) * 0.9;
                hoverState[idx] = Math.max(hoverState[idx], impact);
              }
            }

            // Interactive hover shockwave from entry point
            if (hoverWave && waveElapsed < WAVE_DURATION) {
              const distFromWave = Math.hypot(cx - hoverWave.x, cy - hoverWave.y) / maxDim;
              const waveDelay = distFromWave * 0.5 + noiseValues[idx] * 0.15;
              const waveProg = waveElapsed / WAVE_DURATION;
              const waveLocal = Math.max(0, Math.min(1, (waveProg - waveDelay) / 0.35));
              if (waveLocal > 0 && waveLocal < 1) {
                const waveImpact = Math.sin(waveLocal * Math.PI) * 0.85;
                hoverState[idx] = Math.max(hoverState[idx], waveImpact);
              }
            }

            // Decay hover intensity
            if (hoverState[idx] > 0) {
              hoverState[idx] *= 0.93;
              if (hoverState[idx] < 0.008) hoverState[idx] = 0;
              else anyHoverActive = true;
            }

            hoverIntensity = hoverState[idx];
          }

          // Compute scale & opacity
          let scale = 1;
          let alpha = 1;

          if (isIntroActive) {
            const baseScale = localT < 0.72 ? (localT / 0.72) * 1.05 : 1.05 - ((localT - 0.72) / 0.28) * 0.05;
            scale = baseScale;
            alpha = Math.min(1, localT * 2.5);
          } else if (hoverIntensity > 0) {
            scale = 1 + hoverIntensity * 0.16;
            alpha = 1;
          }

          // If intro done and this pixel is completely idle, only draw if other pixels are active
          if (!isIntroActive && hoverIntensity <= 0 && !anyHoverActive && !isHoveringRef.current) {
            continue;
          }

          const dw = (cellW + 0.5) * scale;
          const dh = (cellH + 0.5) * scale;

          ctx.save();
          ctx.globalAlpha = alpha;

          // Draw sampled pixel slice
          ctx.drawImage(
            img,
            srcX + (c / cols) * srcW,
            srcY + (r / rows) * srcH,
            srcW / cols,
            srcH / rows,
            cx - dw / 2,
            cy - dh / 2,
            dw,
            dh
          );

          // 3D tactile micro-bevel outline (inspired by Robert Borghesi)
          const bevel = isIntroActive
            ? (1 - localT) * 0.45
            : hoverIntensity * 0.65;

          if (bevel > 0.02) {
            // Light edge (top-left)
            ctx.strokeStyle = `rgba(255, 255, 255, ${bevel * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - dw / 2, cy + dh / 2);
            ctx.lineTo(cx - dw / 2, cy - dh / 2);
            ctx.lineTo(cx + dw / 2, cy - dh / 2);
            ctx.stroke();

            // Dark shadow (bottom-right)
            ctx.strokeStyle = `rgba(0, 0, 0, ${bevel * 0.75})`;
            ctx.beginPath();
            ctx.moveTo(cx + dw / 2, cy - dh / 2);
            ctx.lineTo(cx + dw / 2, cy + dh / 2);
            ctx.lineTo(cx - dw / 2, cy + dh / 2);
            ctx.stroke();
          }

          // Cyber-neon / portfolio lime-cyan luminescence flash
          const luminescence = isIntroActive
            ? (localT < 0.65 ? (1 - localT / 0.65) * 0.35 : 0)
            : hoverIntensity * 0.38;

          if (luminescence > 0.02) {
            const grad = ctx.createLinearGradient(cx - dw / 2, cy - dh / 2, cx + dw / 2, cy + dh / 2);
            grad.addColorStop(0, `rgba(184, 252, 58, ${luminescence})`);
            grad.addColorStop(1, `rgba(0, 255, 204, ${luminescence * 0.65})`);
            ctx.fillStyle = grad;
            ctx.fillRect(cx - dw / 2, cy - dh / 2, dw, dh);
          }

          ctx.restore();
        }
      }

      // Handle opacity transitions
      if (!isIntroActive) {
        if (!isRevealedRef.current) {
          isRevealedRef.current = true;
        }

        if (isHoveringRef.current || anyHoverActive) {
          canvas.style.opacity = '1';
        } else {
          canvas.style.opacity = '0';
        }
      }

      rafId = requestAnimationFrame(render);
    };

    // Start intro sequence
    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(render);
    }, 180);

    // Mouse event handlers for interactive hover pixel effect
    const onMouseEnter = (e: MouseEvent) => {
      isHoveringRef.current = true;
      const b = wrap.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      mousePosRef.current = { x, y };
      // Trigger pixel dissolve wave from the entry point
      hoverWaveRef.current = { x, y, time: performance.now() };
      canvas.style.opacity = '1';
    };

    const onMouseMove = (e: MouseEvent) => {
      const b = wrap.getBoundingClientRect();
      mousePosRef.current = { x: e.clientX - b.left, y: e.clientY - b.top };
    };

    const onMouseLeave = () => {
      isHoveringRef.current = false;
      mousePosRef.current = null;
    };

    wrap.addEventListener('mouseenter', onMouseEnter);
    wrap.addEventListener('mousemove', onMouseMove);
    wrap.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      wrap.removeEventListener('mouseenter', onMouseEnter);
      wrap.removeEventListener('mousemove', onMouseMove);
      wrap.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [imgLoaded, inView]);

  return (
    <div ref={wrapRef} className="pixel-reveal-wrap">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`about-card__img ${className}`}
        onLoad={() => setImgLoaded(true)}
        crossOrigin="anonymous"
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        className="pixel-reveal-canvas"
        aria-hidden="true"
      />
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

/* ── Gallery image data with correct aspect ratios and captions ── */
interface GalleryImage {
  src: string;
  aspect: '4/3' | '4/5' | '16/9';
  caption: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me%20&%20Bullet.webp?updatedAt=1792695072413',
    aspect: '4/3',
    caption: 'Me, my Bullet, and the open hill roads.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Om%20&%20Arun.webp?updatedAt=1792695059053',
    aspect: '4/5',
    caption: 'Brotherhood moments with Arun.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Lamhe.webp?updatedAt=1792695041171',
    aspect: '16/9',
    caption: 'Timeless memories captured in the hills.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Veeru%20in%20Holi%202024.webp?updatedAt=1792695055426',
    aspect: '4/5',
    caption: 'Holi 2024 — painted in colors with Veeru.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Ranikhet%20Mountain.webp?updatedAt=1792695069646',
    aspect: '4/3',
    caption: 'Serene mountain vistas of Ranikhet.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me%20and%20Gang%20at%20Farewall.webp?updatedAt=1792695057870',
    aspect: '4/5',
    caption: 'Farewell memories with the college gang.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me%20Group%20of%20Circle.webp?updatedAt=1792695065741',
    aspect: '16/9',
    caption: 'The inner circle — endless stories and laughs.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me%20as%20Art.webp?updatedAt=1792695051214',
    aspect: '4/5',
    caption: 'Artistic portrait captured in natural light.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Evening.webp?updatedAt=1792695060245',
    aspect: '4/3',
    caption: 'Golden evening hues over the countryside.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me.webp?updatedAt=1792695039652',
    aspect: '4/5',
    caption: 'Quiet moments taking in the mountain breeze.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Me%20&%20Guys%20At%20Naintial.webp?updatedAt=1792695064617',
    aspect: '16/9',
    caption: 'Road trip adventures with the squad in Nainital.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/My%20Boat%20Buds.webp?updatedAt=1792695057868',
    aspect: '4/3',
    caption: 'Lake days & boat rides with the boys.',
  },
  {
    src: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Bhimtal%20Lake.webp?updatedAt=1792695052537',
    aspect: '4/5',
    caption: 'Peaceful waters of Bhimtal Lake.',
  },
];

/* ── Single gallery card with 3D perspective tilt ── */
const GalleryCard: FC<{
  image: GalleryImage;
  index: number;
  onImageClick: (src: string, idx: number) => void;
  isDragging: boolean;
  dragStartX: React.MutableRefObject<number>;
}> = ({ image, index, onImageClick, isDragging, dragStartX }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Smooth 3D perspective tilt — subtle and refined
    const tiltX = (y - 0.5) * -12;
    const tiltY = (x - 0.5) * 12;

    cardRef.current.style.transform =
      `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Border glow and spotlight tracking coordinates
    cardRef.current.style.setProperty('--px', `${px}px`);
    cardRef.current.style.setProperty('--py', `${py}px`);

    // Specular light follow
    if (glowRef.current) {
      glowRef.current.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      glowRef.current.style.opacity = '1';
    }
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    cardRef.current.style.setProperty('--px', '50%');
    cardRef.current.style.setProperty('--py', '50%');
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  const aspectClass = `gallery-card--aspect-${image.aspect.replace('/', '-')}`;

  return (
    <div
      className={`gallery-card ${aspectClass}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (Math.abs(e.clientX - dragStartX.current) < 5) {
          onImageClick(image.src, index);
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onImageClick(image.src, index);
        }
      }}
      aria-label={`View photo ${index + 1}: ${image.caption}`}
    >
      {/* Ribbon Hanging Clip (Reference 2 Style) */}
      <div className="gallery-card__clip" aria-hidden="true">
        <div className="gallery-card__clip-body" />
        <div className="gallery-card__clip-hole" />
      </div>

      <div className="gallery-card__image-wrap" style={{ aspectRatio: image.aspect }}>
        <img
          src={image.src}
          alt={image.caption}
          className="gallery-card__img"
          loading="lazy"
          draggable={false}
        />
        {/* Specular light glow overlay */}
        <div ref={glowRef} className="gallery-card__glow" />
      </div>
      <p className="gallery-card__caption">{image.caption}</p>
    </div>
  );
};

/* ── Draggable auto-scrolling gallery with physical curved hanger & dynamic pendulum weight ── */
const DraggableCarousel: FC<{ onImageClick: (src: string, idx: number) => void }> = ({ onImageClick }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ribbonPathRef = useRef<SVGPathElement>(null);
  const ribbonShadowPathRef = useRef<SVGPathElement>(null);
  const cardOffsetsRef = useRef<number[]>([]);

  const xVal = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartVal = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const AUTO_SPEED = 0.5; // px per frame

  // Ribbon geometry & physics parameters
  const Y_EDGE = 36;       // Left & right anchor height (px)
  const BASE_SAG_CY = 72;  // Resting control point Cy (yields ~18px gentle sag in center)
  const Y_BASE = 50;       // Base unshifted clip eyelet height (px)

  // Dynamic ribbon & pendulum physics simulation state
  const currentCx = useRef(0);
  const currentCy = useRef(BASE_SAG_CY);
  const swayAngle = useRef(0);
  const swayVelocity = useRef(0);

  // Measure card horizontal offsets relative to track (cached for 60fps performance)
  const measureCardOffsets = useCallback(() => {
    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;
    cardOffsetsRef.current = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
  }, []);

  useEffect(() => {
    measureCardOffsets();
    const t = setTimeout(measureCardOffsets, 150);
    const onResize = () => {
      measureCardOffsets();
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [measureCardOffsets]);

  /* Auto-scroll + momentum + dynamic ribbon & weight physics simulation */
  useAnimationFrame((_, delta) => {
    if (!trackRef.current) return;
    const halfW = trackRef.current.scrollWidth / 2;
    if (halfW <= 0) return;

    if (!isDraggingRef.current) {
      // Apply residual velocity (momentum) then decay it
      if (Math.abs(velocity.current) > 0.08) {
        xVal.set(xVal.get() + velocity.current);
        velocity.current *= 0.94;
      } else {
        velocity.current = 0;
        // Constant smooth auto-scroll adjusted for frame delta
        const frameSpeed = (AUTO_SPEED * (delta || 16.67)) / 16.67;
        xVal.set(xVal.get() - frameSpeed);
      }
    }

    // Seamless infinite loop
    let cur = xVal.get();
    if (cur <= -halfW) cur += halfW;
    if (cur > 0) cur -= halfW;
    xVal.set(cur);

    // ── Dynamic Ribbon Curve & Weight Physics ──
    const viewportW = viewportRef.current ? viewportRef.current.clientWidth : window.innerWidth;
    if (currentCx.current === 0) {
      currentCx.current = viewportW / 2;
    }

    // 1. Dynamic ribbon bending in drag direction
    const dragVel = velocity.current;
    // Sag apex pulls in drag direction; increases sag depth slightly under downward pull force
    const targetCx = viewportW / 2 + Math.max(-85, Math.min(85, dragVel * 6.5));
    const targetCy = BASE_SAG_CY + Math.min(Math.abs(dragVel) * 1.5, 12);

    currentCx.current += (targetCx - currentCx.current) * 0.12;
    currentCy.current += (targetCy - currentCy.current) * 0.12;

    // Update SVG curve path
    const pathD = `M 0,${Y_EDGE} Q ${currentCx.current.toFixed(1)},${currentCy.current.toFixed(1)} ${viewportW},${Y_EDGE}`;
    if (ribbonPathRef.current) ribbonPathRef.current.setAttribute('d', pathD);
    if (ribbonShadowPathRef.current) ribbonShadowPathRef.current.setAttribute('d', pathD);

    // 2. Pendulum weight sway physics (inertia lag on drag)
    const targetSway = Math.max(-4.5, Math.min(4.5, -dragVel * 0.20));
    const springForce = (targetSway - swayAngle.current) * 0.14;
    swayVelocity.current = (swayVelocity.current + springForce) * 0.86;
    swayAngle.current += swayVelocity.current;

    // 3. Update hanging position and tilt for each card
    if (cardOffsetsRef.current.length === 0) {
      measureCardOffsets();
    }

    const cards = trackRef.current.children;
    const numCards = cards.length;
    const offsets = cardOffsetsRef.current;

    for (let i = 0; i < numCards; i++) {
      const cardEl = cards[i] as HTMLElement;
      if (!cardEl) continue;

      const cardOffset = offsets[i] !== undefined ? offsets[i] : (cardEl.offsetLeft + cardEl.offsetWidth / 2);
      const screenX = cur + cardOffset;

      // Only calculate cards within or near visible viewport buffer
      if (screenX < -380 || screenX > viewportW + 380) {
        continue;
      }

      const u = Math.max(0, Math.min(1, screenX / Math.max(viewportW, 1)));
      const oneMinusU = 1 - u;

      // Quadratic bezier height at parameter u
      const curveY =
        oneMinusU * oneMinusU * Y_EDGE +
        2 * oneMinusU * u * currentCy.current +
        u * u * Y_EDGE;

      // Wire tangent slope and angle
      const dYdX = (2 * (1 - 2 * u) * (currentCy.current - Y_EDGE)) / Math.max(viewportW, 1);
      const wireAngleDeg = Math.atan(dYdX) * (180 / Math.PI);

      // Total hanging angle = wire slope + pendulum inertia sway
      const totalAngle = wireAngleDeg + swayAngle.current;
      const yOffset = curveY - Y_BASE;

      cardEl.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0) rotate(${totalAngle.toFixed(2)}deg)`;
    }
  });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartVal.current = xVal.get();
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  }, [xVal]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dx = e.clientX - lastX.current;

      const instantVel = (dx / dt) * 16.67;
      velocity.current = velocity.current * 0.3 + instantVel * 0.7;

      lastX.current = e.clientX;
      lastTime.current = now;

      const halfW = trackRef.current ? trackRef.current.scrollWidth / 2 : 1;
      let next = dragStartVal.current + (e.clientX - dragStartX.current);
      while (next <= -halfW) next += halfW;
      while (next > 0) next -= halfW;
      xVal.set(next);
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [xVal]);

  /* Touch support */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartVal.current = xVal.get();
    lastX.current = e.touches[0].clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  }, [xVal]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const now = performance.now();
    const dt = Math.max(now - lastTime.current, 1);
    const cx = e.touches[0].clientX;
    const dx = cx - lastX.current;

    const instantVel = (dx / dt) * 16.67;
    velocity.current = velocity.current * 0.3 + instantVel * 0.7;

    lastX.current = cx;
    lastTime.current = now;

    const halfW = trackRef.current ? trackRef.current.scrollWidth / 2 : 1;
    let next = dragStartVal.current + (cx - dragStartX.current);
    while (next <= -halfW) next += halfW;
    while (next > 0) next -= halfW;
    xVal.set(next);
  }, [xVal]);

  const onTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Double the images for seamless infinite loop
  const doubled = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  return (
    <div className="gallery-outer">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-label"><span className="section-label__line" /> My World</span>
          <h2 className="section-title">Moments <span className="text-thin">& Memories</span></h2>
          <p className="gallery-subtitle">Some of it exists in moments that stay with you.</p>
        </motion.div>
      </div>

      <div
        ref={viewportRef}
        className={`gallery-viewport ${isDragging ? 'gallery-viewport--dragging' : ''}`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Dynamic Curved Ribbon Hanger (SVG) */}
        <svg className="gallery-ribbon-svg" aria-hidden="true">
          <defs>
            <linearGradient id="gallery-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="20%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="80%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
            <filter id="gallery-ribbon-glow" x="-10%" y="-50%" width="120%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>
          {/* Subtle Shadow Path */}
          <path
            ref={ribbonShadowPathRef}
            d=""
            fill="none"
            stroke="rgba(0, 0, 0, 0.85)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Main Metallic Ribbon Path */}
          <path
            ref={ribbonPathRef}
            d=""
            fill="none"
            stroke="url(#gallery-ribbon-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#gallery-ribbon-glow)"
          />
        </svg>

        <motion.div
          ref={trackRef}
          className="gallery-track"
          style={{ x: xVal }}
        >
          {doubled.map((image, idx) => {
            const realIdx = idx % GALLERY_IMAGES.length;
            return (
              <div key={idx} className="gallery-card-wrapper">
                <GalleryCard
                  image={image}
                  index={realIdx}
                  onImageClick={onImageClick}
                  isDragging={isDragging}
                  dragStartX={dragStartX}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Edge fade masks */}
      <div className="gallery-fade gallery-fade--left" aria-hidden="true" />
      <div className="gallery-fade gallery-fade--right" aria-hidden="true" />
    </div>
  );
};

/* ── Premium Picture Modal ── */
const PicModal: FC<{ src: string; idx: number; onClose: () => void }> = ({ src, idx, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="pic-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop blur glow orbs */}
      <div className="pic-modal-glow pic-modal-glow--1" />
      <div className="pic-modal-glow pic-modal-glow--2" />

      <motion.div
        className="pic-modal-card"
        initial={{ opacity: 0, scale: 0.82, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass top bar */}
        <div className="pic-modal-topbar">
          <span className="pic-modal-counter">
            <span className="pic-modal-counter__dot" />
            Photo {idx + 1} of {GALLERY_IMAGES.length}
          </span>
          <motion.button
            className="pic-modal-close"
            onClick={onClose}
            aria-label="Close"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Image */}
        <div className="pic-modal-img-wrap">
          <motion.img
            src={src}
            alt={GALLERY_IMAGES[idx]?.caption ?? `Omkar Chandra – moment ${idx + 1}`}
            className="pic-modal-img"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            draggable={false}
          />
        </div>

        {/* Glass bottom strip */}
        <div className="pic-modal-footer">
          <span className="pic-modal-footer__label">{GALLERY_IMAGES[idx]?.caption ?? 'Omkar Chandra'}</span>
          <span className="pic-modal-footer__hint">Press Esc or click outside to close</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Flatten all skill items into one ordered list ── */
const ALL_SKILLS: SkillItem[] = skillGroups.flatMap(g => g.items);

/* ── Single skill icon item with smooth, premium tactile hover animation ── */
const SkillIcon: FC<{ skill: SkillItem; isDragging: boolean }> = ({ skill, isDragging }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!isDragging) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // When drag starts, immediately cancel hover
  useEffect(() => {
    if (isDragging && hovered) {
      setHovered(false);
    }
  }, [isDragging, hovered]);

  return (
    <div
      className="smq-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={skill.name}
      title={skill.name}
    >
      {/* Dynamic ambient color glow that sits behind the squircle on hover */}
      <div
        className={`smq-glow smq-glow--${skill.icon} ${hovered ? 'smq-glow--active' : ''}`}
        aria-hidden="true"
      />

      {/* Icon squircle tile with smooth tactile lift and depth */}
      <motion.div
        className={`smq-icon-wrap smq-icon-wrap--${skill.icon}`}
        animate={{
          scale: hovered ? 1.12 : 1,
          y: hovered ? -7 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 24,
          mass: 0.6,
        }}
      >
        <div className="smq-icon-inner">
          {SoftwareIcons[skill.icon]}
        </div>
        {/* Subtle glass specular highlight rim */}
        <div className="smq-icon-rim" aria-hidden="true" />
      </motion.div>
    </div>
  );
};

/* ── Full-width horizontal skills marquee with drag + momentum ── */
const SkillsMarquee: FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const xVal = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartVal = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const hasMoved = useRef(false);
  const AUTO_SPEED = 0.6; // px per 16ms frame

  /* Continuous auto-scroll + momentum decay */
  useAnimationFrame((_, delta) => {
    if (!trackRef.current) return;
    const totalW = trackRef.current.scrollWidth;
    const cycleWidth = totalW / 3;
    if (cycleWidth <= 0) return;

    if (isDraggingRef.current) return; // paused while dragging

    // Apply residual momentum if user recently dragged
    if (Math.abs(velocity.current) > 0.04) {
      xVal.set(xVal.get() + velocity.current);
      velocity.current *= 0.94; // smooth friction decay
    } else {
      velocity.current = 0;
      // Constant smooth marquee movement adjusted for frame delta
      const frameSpeed = (AUTO_SPEED * (delta || 16.67)) / 16.67;
      xVal.set(xVal.get() - frameSpeed);
    }

    // Seamless modulo infinite wrap
    let cur = xVal.get();
    while (cur <= -cycleWidth) {
      cur += cycleWidth;
    }
    while (cur > 0) {
      cur -= cycleWidth;
    }
    xVal.set(cur);
  });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only respond to left click
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartVal.current = xVal.get();
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
    hasMoved.current = false;
    e.preventDefault();
  }, [xVal]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dx = e.clientX - lastX.current;

      // Low-pass filtered velocity
      const instantVelocity = (dx / dt) * 16.67;
      velocity.current = velocity.current * 0.35 + instantVelocity * 0.65;

      lastX.current = e.clientX;
      lastTime.current = now;

      const totalDx = e.clientX - dragStartX.current;
      if (Math.abs(totalDx) > 3) {
        hasMoved.current = true;
      }

      const cycleWidth = trackRef.current ? trackRef.current.scrollWidth / 3 : 1000;
      let next = dragStartVal.current + totalDx;
      while (next <= -cycleWidth) next += cycleWidth;
      while (next > 0) next -= cycleWidth;
      xVal.set(next);
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [xVal]);

  /* Touch support for mobile */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartVal.current = xVal.get();
    lastX.current = e.touches[0].clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
    hasMoved.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const now = performance.now();
    const dt = Math.max(now - lastTime.current, 1);
    const cx = e.touches[0].clientX;
    const dx = cx - lastX.current;

    const instantVelocity = (dx / dt) * 16.67;
    velocity.current = velocity.current * 0.35 + instantVelocity * 0.65;

    lastX.current = cx;
    lastTime.current = now;

    const totalDx = cx - dragStartX.current;
    if (Math.abs(totalDx) > 3) {
      hasMoved.current = true;
    }

    const cycleWidth = trackRef.current ? trackRef.current.scrollWidth / 3 : 1000;
    let next = dragStartVal.current + totalDx;
    while (next <= -cycleWidth) next += cycleWidth;
    while (next > 0) next -= cycleWidth;
    xVal.set(next);
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  /* Triple the list (3x) for infinite loop wrapping without gaps */
  const tripledSkills = [...ALL_SKILLS, ...ALL_SKILLS, ...ALL_SKILLS];

  return (
    <div className="smq-outer">
      <div
        className="smq-viewport"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          ref={trackRef}
          className="smq-track"
          style={{ x: xVal }}
        >
          {tripledSkills.map((skill, idx) => (
            <SkillIcon
              key={`${skill.name}-${idx}`}
              skill={skill}
              isDragging={isDragging}
            />
          ))}
        </motion.div>
      </div>

      {/* Edge fade masks */}
      <div className="smq-fade smq-fade--left" aria-hidden="true" />
      <div className="smq-fade smq-fade--right" aria-hidden="true" />
    </div>
  );
};

const AboutPage: FC = () => {
  const [selectedModal, setSelectedModal] = useState<{ src: string; idx: number } | null>(null);

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
                <PixelRevealImage
                  src="https://ik.imagekit.io/ocg/IMAGES/Pics/PFP.webp?updatedAt=1792695074304"
                  alt="Omkar Chandra"
                />
                <a
                  href="https://www.instagram.com/omkar_chandra"
                  target="_blank"
                  rel="noreferrer"
                  className="about-card__insta-link"
                  aria-label="Instagram Profile"
                />
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
                  Creative professional with 2+ years of hands-on experience in video editing — including
                  1.5+ years of full-time work at Zanthium Technosoft. I craft high-impact visual content
                  spanning UGC ads, tutorial and explainer videos, fintech & crypto campaigns, and motion
                  graphics for SaaS brands.
                </p>
                <p className="about-card__bio">
                  My toolkit runs deep: Premiere Pro, After Effects, sound design, scripting, content
                  strategy, and AI-assisted creative ideation. I bring together visual storytelling, UI
                  animation, and a sharp editorial eye to deliver content that converts.
                </p>
                <div className="about-card__tags">
                  <span className="about-card__tag">Video Editor</span>
                  <span className="about-card__tag">Motion Graphics</span>
                  <span className="about-card__tag">Sound Design</span>
                  <span className="about-card__tag">AI-Assisted Ideation</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── My World — Photo Gallery (drag to browse) ── */}
      <DraggableCarousel onImageClick={(src, idx) => setSelectedModal({ src, idx })} />

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

      {/* ── Skills Marquee ── */}
      <section className="section section--dark skills-marquee-section">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-label"><span className="section-label__line" /> My Arsenal</span>
            <h2 className="section-title">Skills & <span className="text-thin">Tools</span></h2>
          </motion.div>
        </div>
        <SkillsMarquee />
      </section>
      {/* ── Premium Picture Modal ── */}
      <AnimatePresence>
        {selectedModal && (
          <PicModal
            src={selectedModal.src}
            idx={selectedModal.idx}
            onClose={() => setSelectedModal(null)}
          />
        )}
      </AnimatePresence>

    </PageTransition>
  );
};

export default AboutPage;
