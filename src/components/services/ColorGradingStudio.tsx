import React, { FC, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  RotateCcwIcon, SplitViewIcon, SlidersIcon,
  PaletteIcon, SparklesIcon
} from './ServiceIcons';
import { HexColorPicker } from './HexColorPicker';

interface RawImageShot {
  id: string;
  shotNumber: string;
  title: string;
  genre: string;
  url: string;
  defaultLut: string;
}

const RAW_SHOTS: RawImageShot[] = [
  {
    id: 'shot-1',
    shotNumber: '01',
    title: 'Raw Frame 01',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(1).jpg?updatedAt=1793610238668',
    defaultLut: 'teal-orange',
  },
  {
    id: 'shot-2',
    shotNumber: '02',
    title: 'Raw Frame 02',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(2).jpg?updatedAt=1793610238670',
    defaultLut: 'cyberpunk',
  },
  {
    id: 'shot-3',
    shotNumber: '03',
    title: 'Raw Frame 03',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(3).jpg?updatedAt=1793610238671',
    defaultLut: 'moody-film',
  },
  {
    id: 'shot-4',
    shotNumber: '04',
    title: 'Raw Frame 04',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(4).jpg?updatedAt=1793610238670',
    defaultLut: 'golden-hour',
  },
  {
    id: 'shot-5',
    shotNumber: '05',
    title: 'Raw Frame 05',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(5).jpg?updatedAt=1793610234113',
    defaultLut: 'bleach-bypass',
  },
  {
    id: 'shot-6',
    shotNumber: '06',
    title: 'Raw Frame 06',
    genre: 'Cinema Raw',
    url: 'https://ik.imagekit.io/ocg/IMAGES/Pics/Raw%20(6).jpg?updatedAt=1793610238672',
    defaultLut: 'emerald-matrix',
  },
];


interface LUTPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  colorGrade: {
    exposure: number;
    contrast: number;
    highlights: number;
    shadows: number;
    saturation: number;
    temperature: number;
    tint: number;
    vignette: number;
    liftOffset: { x: number; y: number; level: number };
    gammaOffset: { x: number; y: number; level: number };
    gainOffset: { x: number; y: number; level: number };
    offsetVal: { x: number; y: number; level: number };
    grayscale?: number;
    sepia?: number;
    customHue?: number;
    toneOverlay?: string;
  };
}

const LUT_PACKS: LUTPreset[] = [
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    badge: 'Hollywood 35mm',
    description: 'Deep cyan shadows with luminous amber highlights and punchy contrast.',
    colorGrade: {
      exposure: 0.10,
      contrast: 118,
      highlights: 16,
      shadows: -10,
      saturation: 115,
      temperature: 16,
      tint: -8,
      vignette: 20,
      liftOffset: { x: -0.25, y: 0.20, level: -6 },
      gammaOffset: { x: 0.05, y: -0.05, level: 2 },
      gainOffset: { x: 0.25, y: -0.15, level: 8 },
      offsetVal: { x: 0, y: 0, level: 0 },
      customHue: 0,
      toneOverlay: 'linear-gradient(135deg, rgba(255, 170, 50, 0.10) 0%, rgba(0, 165, 195, 0.12) 100%)',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon 2077',
    badge: 'Sci-Fi Night',
    description: 'Electric lime and saturated magenta highlights with deep crushed blacks.',
    colorGrade: {
      exposure: 0.06,
      contrast: 128,
      highlights: 24,
      shadows: -20,
      saturation: 130,
      temperature: -10,
      tint: 16,
      vignette: 30,
      liftOffset: { x: -0.20, y: 0.22, level: -10 },
      gammaOffset: { x: 0.10, y: -0.08, level: 2 },
      gainOffset: { x: 0.18, y: -0.18, level: 12 },
      offsetVal: { x: 0, y: 0, level: 0 },
      customHue: -2,
      toneOverlay: 'linear-gradient(135deg, rgba(255, 0, 128, 0.08) 0%, rgba(0, 230, 255, 0.10) 100%)',
    },
  },
  {
    id: 'moody-film',
    name: 'Kodak 35mm Portra',
    badge: 'Analog Film',
    description: 'Creamy lifted blacks, organic olive mids, and timeless warm skin tones.',
    colorGrade: {
      exposure: 0.04,
      contrast: 106,
      highlights: -8,
      shadows: 12,
      saturation: 104,
      temperature: 14,
      tint: 6,
      vignette: 16,
      liftOffset: { x: 0.05, y: 0.02, level: 8 },
      gammaOffset: { x: 0.08, y: -0.04, level: 0 },
      gainOffset: { x: 0.12, y: -0.06, level: -2 },
      offsetVal: { x: 0, y: 0, level: 0 },
      sepia: 8,
      customHue: 0,
      toneOverlay: 'radial-gradient(ellipse at 50% 50%, rgba(255, 240, 220, 0.08) 0%, rgba(70, 60, 40, 0.06) 100%)',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    badge: 'Warm Sunlight',
    description: 'Radiant amber glow, warm sun-kissed skin, and soft highlight roll-off.',
    colorGrade: {
      exposure: 0.16,
      contrast: 114,
      highlights: 20,
      shadows: 6,
      saturation: 122,
      temperature: 32,
      tint: 8,
      vignette: 18,
      liftOffset: { x: 0.12, y: -0.08, level: 2 },
      gammaOffset: { x: 0.20, y: -0.14, level: 6 },
      gainOffset: { x: 0.30, y: -0.22, level: 12 },
      offsetVal: { x: 0, y: 0, level: 0 },
      sepia: 14,
      customHue: -1,
      toneOverlay: 'linear-gradient(180deg, rgba(255, 140, 30, 0.14) 0%, rgba(255, 210, 80, 0.08) 100%)',
    },
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass',
    badge: 'Gritty Action',
    description: 'Desaturated tones with hard silvery contrast inspired by action thrillers.',
    colorGrade: {
      exposure: 0.08,
      contrast: 130,
      highlights: 24,
      shadows: -16,
      saturation: 72,
      temperature: -6,
      tint: -4,
      vignette: 30,
      liftOffset: { x: -0.10, y: 0.08, level: -8 },
      gammaOffset: { x: 0, y: 0, level: 0 },
      gainOffset: { x: 0.08, y: -0.06, level: 10 },
      offsetVal: { x: 0, y: 0, level: 0 },
      customHue: 0,
      toneOverlay: 'linear-gradient(180deg, rgba(200, 220, 230, 0.10) 0%, rgba(0, 0, 0, 0.12) 100%)',
    },
  },
  {
    id: 'monochrome-noir',
    name: 'Monochrome Film Noir',
    badge: 'Silver Halide B&W',
    description: 'High-contrast silver black & white grade with velvety shadow tones.',
    colorGrade: {
      exposure: 0.06,
      contrast: 136,
      highlights: 20,
      shadows: -18,
      saturation: 0,
      temperature: 0,
      tint: 0,
      vignette: 35,
      liftOffset: { x: 0, y: 0, level: -10 },
      gammaOffset: { x: 0, y: 0, level: 0 },
      gainOffset: { x: 0, y: 0, level: 14 },
      offsetVal: { x: 0, y: 0, level: 0 },
      grayscale: 100,
      customHue: 0,
    },
  },
  {
    id: 'emerald-matrix',
    name: 'Matrix Emerald',
    badge: 'Cyber Green',
    description: 'Stylized deep green midtones, cool lifted shadows, and acid neon accents.',
    colorGrade: {
      exposure: 0.05,
      contrast: 122,
      highlights: 12,
      shadows: -12,
      saturation: 110,
      temperature: -10,
      tint: -18,
      vignette: 26,
      liftOffset: { x: -0.16, y: 0.24, level: -6 },
      gammaOffset: { x: -0.08, y: 0.14, level: 2 },
      gainOffset: { x: -0.06, y: 0.18, level: 8 },
      offsetVal: { x: 0, y: 0, level: 0 },
      customHue: 4,
      toneOverlay: 'linear-gradient(180deg, rgba(16, 60, 36, 0.14) 0%, rgba(6, 30, 18, 0.18) 100%)',
    },
  },
  {
    id: 'flat-log',
    name: 'Camera Raw (Flat Log)',
    badge: 'Unprocessed Base',
    description: 'Neutral camera sensor profile with maximum dynamic range.',
    colorGrade: {
      exposure: 0,
      contrast: 100,
      highlights: 0,
      shadows: 0,
      saturation: 100,
      temperature: 0,
      tint: 0,
      vignette: 0,
      liftOffset: { x: 0, y: 0, level: 0 },
      gammaOffset: { x: 0, y: 0, level: 0 },
      gainOffset: { x: 0, y: 0, level: 0 },
      offsetVal: { x: 0, y: 0, level: 0 },
      grayscale: 0,
      sepia: 0,
      customHue: 0,
    },
  },
];

type WheelState = { x: number; y: number; level: number };

/** ColorWheel — isolated, self-contained draggable wheel component */
const ColorWheel: FC<{
  label: string;
  value: WheelState;
  onChange: (v: WheelState) => void;
  accentClass?: string;
  reticleClass?: string;
}> = ({ label, value, onChange, accentClass = '', reticleClass = '' }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const computeFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!discRef.current) return;
    const rect = discRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const dx = (clientX - centerX) / radius;
    const dy = (clientY - centerY) / radius;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampDist = Math.min(1, dist);
    const angle = Math.atan2(dy, dx);
    onChange({
      ...value,
      x: Math.round(Math.cos(angle) * clampDist * 100) / 100,
      y: Math.round(Math.sin(angle) * clampDist * 100) / 100,
    });
  }, [value, onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      computeFromEvent(e.clientX, e.clientY);
    };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      computeFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => { isDragging.current = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [computeFromEvent]);

  const reticleLeft = `${50 + value.x * 44}%`;
  const reticleTop = `${50 + value.y * 44}%`;
  const hasOffset = Math.abs(value.x) > 0.05 || Math.abs(value.y) > 0.05;

  return (
    <div className="color-wheel-item">
      <div className="wheel-top-row">
        <span className="wheel-name">{label}</span>
        <button
          type="button"
          className="wheel-reset-dot"
          onClick={() => onChange({ x: 0, y: 0, level: value.level })}
          title={`Reset ${label} hue`}
        >
          ⊙
        </button>
      </div>

      <div
        ref={discRef}
        className={`wheel-disc ${accentClass}`}
        onMouseDown={(e) => {
          e.preventDefault();
          isDragging.current = true;
          computeFromEvent(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          isDragging.current = true;
          computeFromEvent(e.touches[0].clientX, e.touches[0].clientY);
        }}
        title="Drag to shift hue"
        role="slider"
        aria-valuenow={Math.round(Math.hypot(value.x, value.y) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} color wheel`}
      >
        {/* Dark center mask so colors don't compete with reticle */}
        <div className="wheel-disc__center" />
        <div
          className={`wheel-reticle ${reticleClass} ${hasOffset ? 'wheel-reticle--offset' : ''}`}
          style={{ left: reticleLeft, top: reticleTop }}
        />
      </div>

      <div className="wheel-slider-under">
        <div className="wheel-level-row">
          <span className="wheel-level-label">Level</span>
          <span className="wheel-level-value">{value.level > 0 ? `+${value.level}` : value.level}</span>
        </div>
        <input
          type="range"
          min="-40"
          max="40"
          value={value.level}
          onChange={(e) => onChange({ ...value, level: Number(e.target.value) })}
          className="studio-slider studio-slider--mini"
        />
      </div>
    </div>
  );
};

export const ColorGradingStudio: FC = () => {
  // Current active shot
  const [selectedShotId, setSelectedShotId] = useState<string>(RAW_SHOTS[0].id);
  const currentShot = RAW_SHOTS.find((s) => s.id === selectedShotId) || RAW_SHOTS[0];

  const [activeInspectorTab, setActiveInspectorTab] = useState<'wheels' | 'luts' | 'primary'>('wheels');
  const [activeLutId, setActiveLutId] = useState<string>('teal-orange');
  const [activeToneOverlay, setActiveToneOverlay] = useState<string | null>(
    'linear-gradient(135deg, rgba(255, 170, 50, 0.10) 0%, rgba(0, 165, 195, 0.12) 100%)'
  );

  // Primary parameters (calibrated to default Teal & Orange LUT)
  const [exposure, setExposure] = useState<number>(0.10);
  const [contrast, setContrast] = useState<number>(118);
  const [highlights, setHighlights] = useState<number>(16);
  const [shadows, setShadows] = useState<number>(-10);
  const [saturation, setSaturation] = useState<number>(115);
  const [temperature, setTemperature] = useState<number>(16);
  const [tint, setTint] = useState<number>(-8);
  const [vignette, setVignette] = useState<number>(20);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [customHue, setCustomHue] = useState<number>(0);
  const [customTintHex, setCustomTintHex] = useState<string | null>(null);

  // 4-Way Color Wheels
  const [lift, setLift] = useState<WheelState>({ x: -0.25, y: 0.20, level: -6 });
  const [gamma, setGamma] = useState<WheelState>({ x: 0.05, y: -0.05, level: 2 });
  const [gain, setGain] = useState<WheelState>({ x: 0.25, y: -0.15, level: 8 });
  const [offset, setOffset] = useState<WheelState>({ x: 0, y: 0, level: 0 });

  // Compare mode
  const [compareMode, setCompareMode] = useState<'split' | 'graded-only' | 'raw-only'>('split');
  const [splitPosition, setSplitPosition] = useState<number>(50);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplitRef = useRef(false);

  // Apply a LUT preset
  const applyLut = (lut: LUTPreset) => {
    setActiveLutId(lut.id);
    setExposure(lut.colorGrade.exposure);
    setContrast(lut.colorGrade.contrast);
    setHighlights(lut.colorGrade.highlights);
    setShadows(lut.colorGrade.shadows);
    setSaturation(lut.colorGrade.saturation);
    setTemperature(lut.colorGrade.temperature);
    setTint(lut.colorGrade.tint);
    setVignette(lut.colorGrade.vignette);
    setLift(lut.colorGrade.liftOffset);
    setGamma(lut.colorGrade.gammaOffset);
    setGain(lut.colorGrade.gainOffset);
    setOffset(lut.colorGrade.offsetVal);
    setGrayscale(lut.colorGrade.grayscale || 0);
    setSepia(lut.colorGrade.sepia || 0);
    setCustomHue(lut.colorGrade.customHue || 0);
    setActiveToneOverlay(lut.colorGrade.toneOverlay || null);
    setCustomTintHex(null);
  };

  // Reset to Raw
  const handleResetToRaw = () => {
    applyLut(LUT_PACKS[LUT_PACKS.length - 1]);
    setActiveLutId('flat-log');
    setCustomTintHex(null);
    setActiveToneOverlay(null);
    setSplitPosition(50);
  };

  // Compute CSS filter string for Graded View
  const gradedFilter = useMemo(() => {
    const computedBrightness = Math.round(100 + exposure * 35 + (highlights + shadows) * 0.15 + offset.level * 0.4);
    const computedContrast = Math.round(contrast + (gain.level - lift.level) * 0.2);
    const computedSaturation = grayscale > 0 ? 0 : saturation;
    // Keep hue shift subtle and bounded to protect natural skin tones
    const rawShift = customHue + temperature * 0.18 + tint * 0.15 + (gain.x * 14) + (lift.x * -10);
    const tempHueShift = Math.max(-14, Math.min(14, Math.round(rawShift)));
    const computedSepia = sepia;
    const computedGray = grayscale;

    return `brightness(${computedBrightness}%) contrast(${computedContrast}%) saturate(${computedSaturation}%) hue-rotate(${tempHueShift}deg) sepia(${computedSepia}%) grayscale(${computedGray}%)`;
  }, [exposure, contrast, highlights, shadows, saturation, temperature, tint, lift, gain, offset, grayscale, sepia, customHue]);

  // Handle Split Wipe dragging (mouse & touch)
  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplitRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingSplitRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, Math.round(newPos))));
    };

    const handleMouseUp = () => {
      isDraggingSplitRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSplitTouchStart = (e: React.TouchEvent) => {
    isDraggingSplitRef.current = true;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingSplitRef.current || !containerRef.current) return;
      const touch = moveEvent.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = ((touch.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, Math.round(newPos))));
    };

    const handleTouchEnd = () => {
      isDraggingSplitRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // RGB scope values
  const scopeR = Math.min(100, Math.max(5, 45 + exposure * 20 + gain.level * 0.4));
  const scopeG = Math.min(100, Math.max(5, 50 + exposure * 15 + gamma.level * 0.3));
  const scopeB = Math.min(100, Math.max(5, 48 + exposure * 18 + lift.level * 0.3));

  return (
    <div className="color-studio">
      {/* Studio Topbar */}
      <div className="studio-topbar">
        <div className="studio-topbar__left">
          <div className="studio-window-dots" aria-hidden="true">
            <span className="dot dot--lime" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <span className="studio-doc-title">Resolve Studio // {currentShot.title}</span>
          <span className="studio-canvas-scale">YRGB Color Managed</span>
        </div>

        {/* View Mode Controls */}
        <div className="studio-compare-bar">
          <button
            type="button"
            className={`compare-btn ${compareMode === 'split' ? 'is-active' : ''}`}
            onClick={() => setCompareMode('split')}
          >
            <SplitViewIcon size={14} />
            <span>Split A/B</span>
          </button>
          <button
            type="button"
            className={`compare-btn ${compareMode === 'graded-only' ? 'is-active' : ''}`}
            onClick={() => setCompareMode('graded-only')}
          >
            <span>Graded</span>
          </button>
          <button
            type="button"
            className={`compare-btn ${compareMode === 'raw-only' ? 'is-active' : ''}`}
            onClick={() => setCompareMode('raw-only')}
          >
            <span>Raw</span>
          </button>
        </div>

        <div className="studio-topbar__right">
          <button
            type="button"
            className="studio-action-btn"
            onClick={handleResetToRaw}
            title="Reset Grade to Camera Raw"
          >
            <RotateCcwIcon size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grading Split View */}
      <div className="color-studio__workspace">
        {/* Grading Monitor Stage */}
        <div className="color-monitor-stage">
          <div ref={containerRef} className="color-viewport">
            {/* Layer 1: Base RAW Image */}
            <img
              src={currentShot.url}
              alt="Raw Footage"
              className="color-img color-img--raw"
            />

            {/* Layer 2: Graded Image with Split Wipe (Left = RAW base, Right = Graded LUT) */}
            <div
              className="color-graded-layer"
              style={{
                clipPath:
                  compareMode === 'raw-only'
                    ? 'inset(0 0 0 100%)'
                    : compareMode === 'graded-only'
                    ? 'inset(0 0 0 0)'
                    : `inset(0 0 0 ${splitPosition}%)`,
              }}
            >
              <img
                src={currentShot.url}
                alt="Graded Footage"
                className="color-img color-img--graded"
                style={{ filter: gradedFilter }}
              />

              {/* Dynamic Film LUT Tone Overlay (Split-Toning) */}
              {activeToneOverlay && (
                <div
                  className="color-lut-tone-overlay"
                  style={{
                    background: activeToneOverlay,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Live Vignette */}
              {vignette > 0 && (
                <div
                  className="color-vignette-overlay"
                  style={{ opacity: vignette / 100 }}
                  aria-hidden="true"
                />
              )}

              {/* Live Custom Color Cast Tint Overlay */}
              {customTintHex && (
                <div
                  className="color-tint-overlay"
                  style={{
                    backgroundColor: customTintHex,
                    opacity: 0.16,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* A/B Labels when in split mode */}
            {compareMode === 'split' && (
              <>
                <div className="color-wipe-label color-wipe-label--raw">
                  RAW
                </div>
                <div className="color-wipe-label color-wipe-label--graded">
                  {activeLutId === 'flat-log' ? 'LOG' : 'LUT'}
                </div>
              </>
            )}

            {/* Split Wipe Drag Handle */}
            {compareMode === 'split' && (
              <div
                className="color-split-handle"
                style={{ left: `${splitPosition}%` }}
                onMouseDown={handleSplitMouseDown}
                onTouchStart={handleSplitTouchStart}
              >
                <div className="handle-line" />
                <div className="handle-pill">
                  <span>⇋</span>
                </div>
              </div>
            )}
          </div>

          {/* Scopes Bar */}
          <div className="color-scopes-bar">
            <div className="scope-histogram">
              <span className="scope-label">RGB PARADE</span>
              <div className="scope-waveforms">
                <div className="scope-channel-wrap">
                  <div
                    className="scope-bar scope-bar--red"
                    style={{
                      height: `${scopeR}%`,
                      transform: `scaleY(${contrast / 100})`,
                    }}
                  />
                  <span className="scope-channel-label">R</span>
                </div>
                <div className="scope-channel-wrap">
                  <div
                    className="scope-bar scope-bar--green"
                    style={{
                      height: `${scopeG}%`,
                      transform: `scaleY(${contrast / 100})`,
                    }}
                  />
                  <span className="scope-channel-label">G</span>
                </div>
                <div className="scope-channel-wrap">
                  <div
                    className="scope-bar scope-bar--blue"
                    style={{
                      height: `${scopeB}%`,
                      transform: `scaleY(${contrast / 100})`,
                    }}
                  />
                  <span className="scope-channel-label">B</span>
                </div>
              </div>
            </div>

            <div className="scope-grade-info">
              <div className="scope-grade-row">
                <span className="scope-grade-key">EXP</span>
                <span className="scope-grade-val">{exposure >= 0 ? `+${exposure.toFixed(2)}` : exposure.toFixed(2)} EV</span>
              </div>
              <div className="scope-grade-row">
                <span className="scope-grade-key">SAT</span>
                <span className="scope-grade-val">{saturation}%</span>
              </div>
              <div className="scope-grade-row">
                <span className="scope-grade-key">VIG</span>
                <span className="scope-grade-val">{vignette}%</span>
              </div>
            </div>

            <div className="scope-shot-meta">
              <span className="shot-num-indicator">SHOT {currentShot.shotNumber} {'//'}  05</span>
              <span className="shot-genre-indicator">{currentShot.genre}</span>
            </div>
          </div>
        </div>

        {/* Right Inspector: 1. LUTs, 2. Color Wheels, 3. Primary */}
        <aside className="design-inspector">
          <div className="inspector-tabs">
            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'wheels' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('wheels')}
            >
              <PaletteIcon size={13} />
              <span>Color Wheels</span>
            </button>

            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'luts' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('luts')}
            >
              <SparklesIcon size={13} />
              <span>LUT Packs</span>
            </button>

            <button
              type="button"
              className={`inspector-tab ${activeInspectorTab === 'primary' ? 'is-active' : ''}`}
              onClick={() => setActiveInspectorTab('primary')}
            >
              <SlidersIcon size={13} />
              <span>Primary</span>
            </button>
          </div>

          <div className="inspector-body">
            {/* TAB 2: 4-WAY COLOR WHEELS */}
            {activeInspectorTab === 'wheels' && (
              <div className="inspector-group">
                <div className="control-header-row" style={{ marginBottom: '12px' }}>
                  <label className="control-label">4-Way Primary Color Wheels</label>
                  <button
                    type="button"
                    className="mini-text-btn"
                    onClick={() => {
                      setLift({ x: 0, y: 0, level: 0 });
                      setGamma({ x: 0, y: 0, level: 0 });
                      setGain({ x: 0, y: 0, level: 0 });
                      setOffset({ x: 0, y: 0, level: 0 });
                    }}
                  >
                    Reset All
                  </button>
                </div>

                <div className="color-wheels-grid-4">
                  <ColorWheel
                    label="LIFT (SHADOWS)"
                    value={lift}
                    onChange={setLift}
                    accentClass="wheel-disc--lift"
                  />
                  <ColorWheel
                    label="GAMMA (MIDS)"
                    value={gamma}
                    onChange={setGamma}
                    accentClass="wheel-disc--gamma"
                    reticleClass="wheel-reticle--lime"
                  />
                  <ColorWheel
                    label="GAIN (HIGHS)"
                    value={gain}
                    onChange={setGain}
                    accentClass="wheel-disc--gain"
                    reticleClass="wheel-reticle--cyan"
                  />
                  <ColorWheel
                    label="OFFSET (GLOBAL)"
                    value={offset}
                    onChange={setOffset}
                    accentClass="wheel-disc--offset"
                  />
                </div>

                {/* Wheel value readout */}
                <div className="wheel-readout-grid">
                  {[
                    { label: 'Lift', val: lift },
                    { label: 'Gamma', val: gamma },
                    { label: 'Gain', val: gain },
                    { label: 'Offset', val: offset },
                  ].map((w) => (
                    <div key={w.label} className="wheel-readout-item">
                      <span className="wheel-readout-name">{w.label}</span>
                      <span className="wheel-readout-coords">
                        X:{w.val.x > 0 ? `+${w.val.x}` : w.val.x} Y:{w.val.y > 0 ? `+${w.val.y}` : w.val.y}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 1: LUT PACKS */}
            {activeInspectorTab === 'luts' && (
              <div className="inspector-group">
                <div className="lut-header-row">
                  <span className="control-label">Cinema 3D LUT Packs</span>
                  <button
                    type="button"
                    className="mini-text-btn"
                    onClick={handleResetToRaw}
                    title="Reset LUT to Flat Log"
                  >
                    Reset LUT
                  </button>
                </div>

                <div className="lut-list">
                  {LUT_PACKS.map((lut) => (
                    <button
                      key={lut.id}
                      type="button"
                      className={`lut-card ${activeLutId === lut.id ? 'is-active' : ''}`}
                      onClick={() => applyLut(lut)}
                    >
                      <div className="lut-card__info">
                        <div className="lut-card__name-row">
                          <span className="lut-card__name">{lut.name}</span>
                          <span className="lut-card__badge">{lut.badge}</span>
                        </div>
                        <span className="lut-card__desc">{lut.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PRIMARY GRADING SLIDERS */}
            {activeInspectorTab === 'primary' && (
              <div className="inspector-group">
                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Exposure ({exposure > 0 ? `+${exposure}` : exposure} EV)</label>
                    <input
                      type="range"
                      min="-1.5"
                      max="1.5"
                      step="0.05"
                      value={exposure}
                      onChange={(e) => setExposure(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Contrast ({contrast}%)</label>
                    <input
                      type="range"
                      min="70"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Temperature ({temperature > 0 ? `+${temperature}K` : `${temperature}K`})</label>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Tint ({tint > 0 ? `+${tint}` : tint})</label>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={tint}
                      onChange={(e) => setTint(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Highlights ({highlights > 0 ? `+${highlights}` : highlights})</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={highlights}
                      onChange={(e) => setHighlights(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Shadows ({shadows > 0 ? `+${shadows}` : shadows})</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={shadows}
                      onChange={(e) => setShadows(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Saturation ({saturation}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Vignette ({vignette}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={vignette}
                      onChange={(e) => setVignette(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <HexColorPicker
                  label="Color Cast / Custom Tint"
                  value={customTintHex || '#B3E32B'}
                  onChange={(col) => setCustomTintHex(col)}
                  defaultValue="#B3E32B"
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Filmstrip Shot Selector */}
      <div className="color-filmstrip-area">
        <div className="filmstrip-header">
          <span className="filmstrip-title">Timeline Gallery // {RAW_SHOTS.length} Raw Shots</span>
          <span className="filmstrip-subtitle">Select a frame to grade</span>
        </div>

        <div className="filmstrip-track">
          {RAW_SHOTS.map((shot) => {
            const isSel = shot.id === selectedShotId;
            return (
              <button
                key={shot.id}
                type="button"
                className={`filmstrip-thumb ${isSel ? 'is-selected' : ''}`}
                onClick={() => setSelectedShotId(shot.id)}
              >
                <div className="filmstrip-thumb__img-wrap">
                  <img src={shot.url} alt={shot.title} className="filmstrip-thumb__img" />
                  <span className="filmstrip-thumb__num">SHOT {shot.shotNumber}</span>
                  {isSel && <span className="filmstrip-thumb__active-tag">ACTIVE</span>}
                </div>
                <div className="filmstrip-thumb__label">{shot.title}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
