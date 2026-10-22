import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon, PauseIcon, RotateCcwIcon, DiamondIcon, EyeIcon, EyeOffIcon,
  LockIcon, UnlockIcon, StarIcon, SlidersIcon, TypeIcon, LayersIcon
} from './ServiceIcons';
import { HexColorPicker } from './HexColorPicker';

export interface MotionLayer {
  id: string;
  name: string;
  type: 'character' | 'text' | 'shape' | 'particle';
  visible: boolean;
  locked: boolean;
  color: string;
}

export type CharacterMode = 'hover' | 'strut' | 'jump' | 'glitch' | 'orbit' | 'spin';
export type PlaybackDirection = 'forward' | 'reverse' | 'ping-pong';
export type ShapePreset = 'ring' | 'triangle' | 'hexagon' | 'burst' | 'radar' | 'wave' | 'spectrum' | 'cube' | 'vortex' | 'particles';
export type TextAnimStyle = 'pop' | 'pulse' | 'glitch' | 'drift' | 'wave' | 'neon';
export type DashStyle = 'solid' | 'dashed' | 'dotted';

export const MotionGraphicsStudio: FC = () => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // 0 to 2.0s
  const duration = 2.0;
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [direction, setDirection] = useState<PlaybackDirection>('forward');
  const [isLooping, setIsLooping] = useState(true);

  // Character Animation Properties
  const [characterMode, setCharacterMode] = useState<CharacterMode>('hover');
  const [characterScale, setCharacterScale] = useState(1.1);
  const [characterPosX, setCharacterPosX] = useState(0);
  const [characterPosY, setCharacterPosY] = useState(0);
  const [characterRotation, setCharacterRotation] = useState(0);
  const [characterTint, setCharacterTint] = useState('#B3E32B');

  // Kinetic Text Properties
  const [textVal, setTextVal] = useState('MOTION LAB');
  const [textAnimStyle, setTextAnimStyle] = useState<TextAnimStyle>('pop');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textTracking, setTextTracking] = useState(3);
  const [textScaleMult, setTextScaleMult] = useState(1.0);

  // Shape / FX Properties
  const [activeShape, setActiveShape] = useState<ShapePreset>('ring');
  const [shapeTint, setShapeTint] = useState('#B3E32B');
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2.5);
  const [shapeRotationSpeed, setShapeRotationSpeed] = useState<number>(1);
  const [shapeDashStyle, setShapeDashStyle] = useState<DashStyle>('dashed');
  const [orbitalRadius, setOrbitalRadius] = useState(100);
  const [glowBloom, setGlowBloom] = useState(24);
  const [particleCount, setParticleCount] = useState(10);

  // Inspector tab
  const [inspectorTab, setInspectorTab] = useState<'character' | 'typography' | 'shapes' | 'layers'>('character');

  // Layers stack
  const [layers, setLayers] = useState<MotionLayer[]>([
    { id: 'layer-char', name: 'Vector Rig: Cyber Character', type: 'character', visible: true, locked: false, color: '#B3E32B' },
    { id: 'layer-text', name: 'Typography: Kinetic Title', type: 'text', visible: true, locked: false, color: '#FFFFFF' },
    { id: 'layer-shape', name: 'Shape: Motion Graphic Element', type: 'shape', visible: true, locked: false, color: '#B3E32B' },
    { id: 'layer-particle', name: 'FX: Constellation Network', type: 'particle', visible: true, locked: false, color: '#00D2FF' },
  ]);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const isReversingRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const timelineTrackRef = useRef<HTMLDivElement>(null);

  // Keyframe markers
  const keyframeTimes = [0.0, 0.5, 1.0, 1.5, 2.0];

  // Playback Loop Ticker
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimestampRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = now;
      }
      const delta = ((now - lastTimestampRef.current) / 1000) * speedMultiplier;
      lastTimestampRef.current = now;

      setCurrentTime((prev) => {
        if (direction === 'forward') {
          const next = prev + delta;
          if (next >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            return duration;
          }
          return next;
        } else if (direction === 'reverse') {
          const next = prev - delta;
          if (next <= 0) {
            if (isLooping) return duration;
            setIsPlaying(false);
            return 0;
          }
          return next;
        } else {
          // Ping-Pong
          let next = isReversingRef.current ? prev - delta : prev + delta;
          if (next >= duration) {
            next = duration;
            isReversingRef.current = true;
          } else if (next <= 0) {
            next = 0;
            isReversingRef.current = false;
          }
          return next;
        }
      });

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration, speedMultiplier, direction, isLooping]);

  // Timeline scrub seek helper
  const seekFromClientX = useCallback((clientX: number) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = Math.round(pct * duration * 100) / 100;
    setCurrentTime(target);
  }, [duration]);

  // Scrubbing handlers (mouse & touch)
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isScrubbingRef.current = true;
    seekFromClientX(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isScrubbingRef.current) return;
      seekFromClientX(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      isScrubbingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTimelineTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isScrubbingRef.current = true;
    seekFromClientX(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isScrubbingRef.current) return;
      seekFromClientX(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      isScrubbingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Normalized progress (0 to 1)
  const progress = currentTime / duration;
  const cycleRad = progress * Math.PI * 2;

  // Character Animation Math
  let charAnimY = characterPosY;
  let charAnimRotate = characterRotation;
  let charLegL = 0;
  let charLegR = 0;
  let charArmL = 0;
  let charArmR = 0;
  let charHeadTilt = 0;
  let charGlowPulse = 1;

  if (characterMode === 'hover') {
    charAnimY += Math.sin(cycleRad) * 14;
    charAnimRotate += Math.cos(cycleRad) * 3;
    charHeadTilt = Math.sin(cycleRad * 1.5) * 5;
    charArmL = Math.sin(cycleRad) * 12;
    charArmR = -Math.sin(cycleRad) * 12;
    charGlowPulse = 0.85 + Math.sin(cycleRad) * 0.25;
  } else if (characterMode === 'strut') {
    charAnimY += Math.abs(Math.sin(cycleRad * 2)) * -12;
    charAnimRotate += Math.sin(cycleRad) * 5;
    charLegL = Math.sin(cycleRad) * 28;
    charLegR = -Math.sin(cycleRad) * 28;
    charArmL = -Math.sin(cycleRad) * 24;
    charArmR = Math.sin(cycleRad) * 24;
    charHeadTilt = Math.cos(cycleRad) * 4;
  } else if (characterMode === 'jump') {
    const jumpPhase = Math.sin(progress * Math.PI);
    charAnimY += jumpPhase * -42;
    charAnimRotate += Math.sin(cycleRad) * 8;
    charLegL = jumpPhase * 22;
    charLegR = jumpPhase * 22;
    charArmL = jumpPhase * -40;
    charArmR = jumpPhase * -40;
    charGlowPulse = 1.2 + jumpPhase * 0.6;
  } else if (characterMode === 'glitch') {
    const jitter = Math.sin(progress * 48);
    charAnimY += jitter * 8;
    charAnimRotate += jitter * 6;
    charGlowPulse = jitter > 0.5 ? 1.5 : 0.7;
    charHeadTilt = jitter * 10;
  } else if (characterMode === 'orbit') {
    charAnimRotate += progress * 360;
    charAnimY += Math.sin(cycleRad) * 16;
  } else if (characterMode === 'spin') {
    charAnimRotate += progress * 720;
    charAnimY += Math.cos(cycleRad * 2) * 10;
  }

  // Text Animation Math
  let textScale = textScaleMult;
  let textRotate = 0;
  let textY = 0;
  let textOpacity = 1;

  if (textAnimStyle === 'pop') {
    const bounce = Math.sin(cycleRad);
    textScale = textScaleMult * (1 + bounce * 0.15);
    textY = Math.cos(cycleRad) * -6;
  } else if (textAnimStyle === 'pulse') {
    textScale = textScaleMult * (0.92 + Math.abs(Math.sin(cycleRad * 2)) * 0.18);
  } else if (textAnimStyle === 'glitch') {
    const jitter = Math.sin(progress * 36);
    textRotate = jitter * 4;
    textScale = textScaleMult * (jitter > 0.7 ? 1.12 : 1.0);
  } else if (textAnimStyle === 'drift') {
    textY = Math.sin(cycleRad) * 8;
    textRotate = Math.cos(cycleRad) * 2;
  } else if (textAnimStyle === 'wave') {
    textY = Math.sin(cycleRad) * 10;
  } else if (textAnimStyle === 'neon') {
    const flicker = Math.sin(progress * 24);
    textOpacity = flicker > 0.8 ? 0.4 : 1.0;
  }

  // Shape animation values
  const shapeRotation = currentTime * 60 * shapeRotationSpeed;
  const shapePulse = 0.92 + Math.sin(cycleRad) * 0.08;
  const waveOffset = progress * 360;

  // Dash array string
  const strokeDash = shapeDashStyle === 'solid' ? 'none' : shapeDashStyle === 'dashed' ? '8 6' : '2 6';

  // Toggle layer visibility / lock
  const toggleVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const toggleLock = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  };

  // Reset all
  const handleResetAll = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setSpeedMultiplier(1.0);
    setDirection('forward');
    setIsLooping(true);
    setCharacterMode('hover');
    setCharacterScale(1.1);
    setCharacterPosX(0);
    setCharacterPosY(0);
    setCharacterRotation(0);
    setCharacterTint('#B3E32B');
    setTextVal('MOTION LAB');
    setTextAnimStyle('pop');
    setTextColor('#FFFFFF');
    setTextTracking(3);
    setTextScaleMult(1.0);
    setActiveShape('ring');
    setShapeTint('#B3E32B');
    setShapeStrokeWidth(2.5);
    setShapeRotationSpeed(1);
    setShapeDashStyle('dashed');
    setOrbitalRadius(100);
    setGlowBloom(24);
    setParticleCount(10);
    setLayers([
      { id: 'layer-char', name: 'Vector Rig: Cyber Character', type: 'character', visible: true, locked: false, color: '#B3E32B' },
      { id: 'layer-text', name: 'Typography: Kinetic Title', type: 'text', visible: true, locked: false, color: '#FFFFFF' },
      { id: 'layer-shape', name: 'Shape: Motion Graphic Element', type: 'shape', visible: true, locked: false, color: '#B3E32B' },
      { id: 'layer-particle', name: 'FX: Constellation Network', type: 'particle', visible: true, locked: false, color: '#00D2FF' },
    ]);
  };

  // Particle positions
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + cycleRad * (i % 2 === 0 ? 0.5 : -0.3);
    const r = orbitalRadius * 0.72 + Math.sin(cycleRad * 1.5 + i) * 16;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });

  const charLayer = layers.find((l) => l.id === 'layer-char');
  const textLayer = layers.find((l) => l.id === 'layer-text');
  const shapeLayer = layers.find((l) => l.id === 'layer-shape');
  const particleLayer = layers.find((l) => l.id === 'layer-particle');

  // Check if current active tab's layer is locked
  const isCurrentLayerLocked =
    (inspectorTab === 'character' && charLayer?.locked) ||
    (inspectorTab === 'typography' && textLayer?.locked) ||
    (inspectorTab === 'shapes' && shapeLayer?.locked);

  return (
    <div className="motion-studio">
      {/* Top Window Header */}
      <div className="studio-topbar">
        <div className="studio-topbar__left">
          <div className="studio-window-dots" aria-hidden="true">
            <span className="dot dot--lime" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <span className="studio-doc-title">Comp 1: Cyber_Motion_Rig.aep</span>
          <span className="studio-canvas-scale">1920×1080 60fps</span>
        </div>

        <div className="studio-topbar__center">
          <div className="timecode-display">
            <span className="timecode-current">
              00;00;{String(Math.floor(currentTime)).padStart(2, '0')};{String(Math.floor((currentTime % 1) * 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="studio-topbar__right">
          <button
            type="button"
            className="studio-action-btn"
            onClick={handleResetAll}
            title="Reset All Motion Properties"
          >
            <RotateCcwIcon size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="motion-studio__workspace">
        {/* Composition Preview Monitor */}
        <div className="motion-monitor">
          <div className="motion-stage">
            {/* Background Grid & Safe Reticle */}
            <div className="motion-stage__grid" aria-hidden="true">
              <span className="crosshair crosshair--tl">+</span>
              <span className="crosshair crosshair--tr">+</span>
              <span className="crosshair crosshair--bl">+</span>
              <span className="crosshair crosshair--br">+</span>
              <span className="center-reticle" />
            </div>

            {/* Ambient Particle FX Layer */}
            {particleLayer?.visible && (
              <div className="motion-elem motion-particles-wrap" aria-hidden="true">
                {particles.map((p, i) => (
                  <div
                    key={i}
                    className="motion-particle"
                    style={{
                      transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
                      opacity: 0.5 + Math.sin(cycleRad + i) * 0.35,
                      background: i % 3 === 0 ? shapeTint : i % 3 === 1 ? '#00D2FF' : '#ffffff',
                      width: `${4 + (i % 3) * 2}px`,
                      height: `${4 + (i % 3) * 2}px`,
                      boxShadow: `0 0 ${6 + (i % 3) * 3}px ${shapeTint}88`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Motion Shapes & Graphic Elements Layer */}
            {shapeLayer?.visible && (
              <div
                className="motion-elem motion-shape-wrap"
                style={{ transform: `rotate(${shapeRotation}deg) scale(${shapePulse})` }}
              >
                {/* 1. Concentric Orbital Gyro Rings */}
                {activeShape === 'ring' && (
                  <svg
                    width={orbitalRadius * 2.2}
                    height={orbitalRadius * 2.2}
                    viewBox="-110 -110 220 220"
                    style={{ overflow: 'visible' }}
                  >
                    <circle
                      cx="0" cy="0" r={orbitalRadius}
                      fill="none" stroke={shapeTint}
                      strokeWidth={shapeStrokeWidth}
                      strokeDasharray={strokeDash}
                      style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.5}px ${shapeTint})` }}
                    />
                    <circle
                      cx="0" cy="0" r={orbitalRadius * 0.65}
                      fill="none" stroke={shapeTint}
                      strokeWidth={Math.max(1, shapeStrokeWidth * 0.7)}
                      strokeDasharray="4 8"
                      opacity="0.6"
                      transform={`rotate(${-shapeRotation * 1.5})`}
                    />
                    {/* Orbiting Satellite Dots */}
                    <circle
                      cx={Math.cos(cycleRad * 2) * orbitalRadius}
                      cy={Math.sin(cycleRad * 2) * orbitalRadius}
                      r="4" fill="#ffffff"
                      style={{ filter: `drop-shadow(0 0 6px ${shapeTint})` }}
                    />
                    <circle
                      cx={Math.cos(-cycleRad * 1.5) * (orbitalRadius * 0.65)}
                      cy={Math.sin(-cycleRad * 1.5) * (orbitalRadius * 0.65)}
                      r="3" fill={shapeTint}
                    />
                  </svg>
                )}

                {/* 2. Neon Delta Prism Triangle */}
                {activeShape === 'triangle' && (
                  <svg
                    width={orbitalRadius * 2}
                    height={orbitalRadius * 2}
                    viewBox="-100 -100 200 200"
                    style={{ overflow: 'visible' }}
                  >
                    <polygon
                      points="0,-85 75,55 -75,55"
                      fill="none" stroke={shapeTint}
                      strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round"
                      strokeDasharray={strokeDash}
                      style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.5}px ${shapeTint})` }}
                    />
                    {/* Counter-rotating inner triangle */}
                    <polygon
                      points="0,55 -48,-35 48,-35"
                      fill="none" stroke={shapeTint}
                      strokeWidth={Math.max(1, shapeStrokeWidth * 0.6)}
                      strokeDasharray="4 4"
                      opacity="0.55"
                      transform={`rotate(${-shapeRotation * 2})`}
                    />
                    {/* Vertex nodes */}
                    <circle cx="0" cy="-85" r="3.5" fill="#ffffff" />
                    <circle cx="75" cy="55" r="3.5" fill="#ffffff" />
                    <circle cx="-75" cy="55" r="3.5" fill="#ffffff" />
                    <circle cx="0" cy="0" r="4" fill={shapeTint} opacity={0.8} />
                  </svg>
                )}

                {/* 3. Cyber Tech Shield Hexagon */}
                {activeShape === 'hexagon' && (
                  <svg
                    width={orbitalRadius * 2}
                    height={orbitalRadius * 2}
                    viewBox="-100 -100 200 200"
                    style={{ overflow: 'visible' }}
                  >
                    <polygon
                      points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45"
                      fill="none" stroke={shapeTint}
                      strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round"
                      strokeDasharray={strokeDash}
                      style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.5}px ${shapeTint})` }}
                    />
                    {/* Inner hex with counter rotation */}
                    <polygon
                      points="0,-58 50,-29 50,29 0,58 -50,29 -50,-29"
                      fill="none" stroke={shapeTint}
                      strokeWidth={Math.max(1, shapeStrokeWidth * 0.6)}
                      strokeDasharray="5 5"
                      opacity="0.55"
                      transform={`rotate(${-shapeRotation * 1.5})`}
                    />
                    {/* Cross line axes */}
                    <line x1="-85" y1="0" x2="85" y2="0" stroke={shapeTint} strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
                    <line x1="0" y1="-95" x2="0" y2="95" stroke={shapeTint} strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
                  </svg>
                )}

                {/* 4. Dynamic Starburst Motion Badge */}
                {activeShape === 'burst' && (
                  <svg
                    width={orbitalRadius * 2.2}
                    height={orbitalRadius * 2.2}
                    viewBox="-110 -110 220 220"
                    style={{ overflow: 'visible' }}
                  >
                    {/* 12-point starburst */}
                    <polygon
                      points={Array.from({ length: 24 }, (_, i) => {
                        const r = i % 2 === 0 ? orbitalRadius : orbitalRadius * 0.65;
                        const a = (i / 24) * Math.PI * 2;
                        return `${Math.cos(a) * r},${Math.sin(a) * r}`;
                      }).join(' ')}
                      fill="none" stroke={shapeTint}
                      strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round"
                      strokeDasharray={strokeDash}
                      style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.5}px ${shapeTint})` }}
                    />
                    {/* Inner gear circle */}
                    <circle cx="0" cy="0" r={orbitalRadius * 0.38} fill="none" stroke={shapeTint} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
                    {/* Center 4-point tech diamond */}
                    <polygon
                      points="0,-18 18,0 0,18 -18,0"
                      fill={shapeTint} opacity="0.4"
                      transform={`rotate(${-shapeRotation * 2})`}
                    />
                  </svg>
                )}

                {/* 5. Sci-Fi HUD Radar & Targeting Reticle */}
                {activeShape === 'radar' && (
                  <svg
                    width={orbitalRadius * 2.2}
                    height={orbitalRadius * 2.2}
                    viewBox="-110 -110 220 220"
                    style={{ overflow: 'visible' }}
                  >
                    <circle cx="0" cy="0" r={orbitalRadius} fill="none" stroke={shapeTint} strokeWidth={shapeStrokeWidth} strokeDasharray={strokeDash} />
                    <circle cx="0" cy="0" r={orbitalRadius * 0.66} fill="none" stroke={shapeTint} strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                    <circle cx="0" cy="0" r={orbitalRadius * 0.33} fill="none" stroke={shapeTint} strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
                    {/* Crosshairs */}
                    <line x1={-orbitalRadius * 1.1} y1="0" x2={orbitalRadius * 1.1} y2="0" stroke={shapeTint} strokeWidth="1.2" opacity="0.5" />
                    <line x1="0" y1={-orbitalRadius * 1.1} x2="0" y2={orbitalRadius * 1.1} stroke={shapeTint} strokeWidth="1.2" opacity="0.5" />
                    {/* Rotating Radar Sweep Line */}
                    <g transform={`rotate(${currentTime * 180})`}>
                      <line x1="0" y1="0" x2={orbitalRadius} y2="0" stroke={shapeTint} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 8px ${shapeTint})` }} />
                      <circle cx={orbitalRadius * 0.75} cy="0" r="3" fill="#ffffff" />
                    </g>
                    {/* Telemetry text */}
                    <text x={orbitalRadius * 0.5} y={-orbitalRadius * 0.7} fill={shapeTint} fontSize="7" fontFamily="monospace" opacity="0.7">
                      TRK.0{Math.floor((currentTime * 10) % 9) + 1}
                    </text>
                  </svg>
                )}

                {/* 6. Harmonic Sine Wave Array */}
                {activeShape === 'wave' && (
                  <svg
                    width="260"
                    height="100"
                    viewBox="-130 -50 260 100"
                    style={{ overflow: 'visible', transform: `rotate(${-shapeRotation * 0.3}deg)` }}
                  >
                    {/* Primary harmonic wave */}
                    <path
                      d={`M -120,0 ${Array.from({ length: 12 }, (_, i) => {
                        const x = -120 + i * 20;
                        const y = Math.sin(((waveOffset + i * 36) * Math.PI) / 180) * 28;
                        return `L ${x},${y}`;
                      }).join(' ')}`}
                      fill="none" stroke={shapeTint}
                      strokeWidth={shapeStrokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={strokeDash}
                      style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.5}px ${shapeTint})` }}
                    />
                    {/* Secondary out-of-phase wave */}
                    <path
                      d={`M -120,0 ${Array.from({ length: 12 }, (_, i) => {
                        const x = -120 + i * 20;
                        const y = Math.cos(((waveOffset * 1.5 + i * 40) * Math.PI) / 180) * 18;
                        return `L ${x},${y}`;
                      }).join(' ')}`}
                      fill="none" stroke="#00D2FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                )}

                {/* 7. Circular Audio Spectrum Equalizer */}
                {activeShape === 'spectrum' && (
                  <svg
                    width={orbitalRadius * 2.4}
                    height={orbitalRadius * 2.4}
                    viewBox="-120 -120 240 240"
                    style={{ overflow: 'visible' }}
                  >
                    <circle cx="0" cy="0" r={orbitalRadius * 0.5} fill="none" stroke={shapeTint} strokeWidth="1" opacity="0.4" />
                    {Array.from({ length: 24 }, (_, i) => {
                      const angle = (i / 24) * Math.PI * 2;
                      const baseR = orbitalRadius * 0.55;
                      const barH = (Math.sin(cycleRad * 3 + i * 0.8) * 0.5 + 0.6) * (orbitalRadius * 0.45);
                      const x1 = Math.cos(angle) * baseR;
                      const y1 = Math.sin(angle) * baseR;
                      const x2 = Math.cos(angle) * (baseR + barH);
                      const y2 = Math.sin(angle) * (baseR + barH);
                      return (
                        <g key={i}>
                          <line
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={i % 2 === 0 ? shapeTint : '#00D2FF'}
                            strokeWidth={shapeStrokeWidth}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 4px ${shapeTint})` }}
                          />
                          <circle cx={x2} cy={y2} r="2" fill="#ffffff" />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* 8. 3D Isometric Wireframe Cube Prism */}
                {activeShape === 'cube' && (
                  <svg
                    width={orbitalRadius * 2}
                    height={orbitalRadius * 2}
                    viewBox="-100 -100 200 200"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Top Face */}
                    <polygon
                      points="0,-70 55,-38 0,-6 -55,-38"
                      fill={shapeTint} fillOpacity="0.1"
                      stroke={shapeTint} strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round" strokeDasharray={strokeDash}
                    />
                    {/* Left Face */}
                    <polygon
                      points="-55,-38 0,-6 0,58 -55,26"
                      fill={shapeTint} fillOpacity="0.2"
                      stroke={shapeTint} strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round" strokeDasharray={strokeDash}
                    />
                    {/* Right Face */}
                    <polygon
                      points="0,-6 55,-38 55,26 0,58"
                      fill={shapeTint} fillOpacity="0.05"
                      stroke={shapeTint} strokeWidth={shapeStrokeWidth}
                      strokeLinejoin="round" strokeDasharray={strokeDash}
                    />
                    {/* Inner core node */}
                    <circle cx="0" cy="-6" r="4" fill="#ffffff" style={{ filter: `drop-shadow(0 0 8px ${shapeTint})` }} />
                    <line x1="0" y1="-6" x2="0" y2="58" stroke={shapeTint} strokeWidth={shapeStrokeWidth} />
                  </svg>
                )}

                {/* 9. Hypnotic Golden Vortex Spiral */}
                {activeShape === 'vortex' && (
                  <svg
                    width={orbitalRadius * 2.2}
                    height={orbitalRadius * 2.2}
                    viewBox="-110 -110 220 220"
                    style={{ overflow: 'visible' }}
                  >
                    {[0, 90, 180, 270].map((deg) => (
                      <path
                        key={deg}
                        d={`M 0,0 ${Array.from({ length: 14 }, (_, i) => {
                          const r = (i / 13) * orbitalRadius;
                          const a = (i * 0.35);
                          return `L ${Math.cos(a) * r},${Math.sin(a) * r}`;
                        }).join(' ')}`}
                        fill="none" stroke={shapeTint}
                        strokeWidth={shapeStrokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={strokeDash}
                        transform={`rotate(${deg})`}
                        style={{ filter: `drop-shadow(0 0 ${glowBloom * 0.4}px ${shapeTint})` }}
                      />
                    ))}
                    <circle cx="0" cy="0" r="5" fill="#ffffff" style={{ filter: `drop-shadow(0 0 10px ${shapeTint})` }} />
                  </svg>
                )}

                {/* 10. Constellation Network */}
                {activeShape === 'particles' && (
                  <>
                    {Array.from({ length: 12 }, (_, i) => {
                      const a = (i / 12) * Math.PI * 2;
                      const r = orbitalRadius;
                      return (
                        <div
                          key={i}
                          className="motion-particle"
                          style={{
                            transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px))`,
                            width: '6px',
                            height: '6px',
                            background: i % 2 === 0 ? shapeTint : '#00D2FF',
                            boxShadow: `0 0 10px ${shapeTint}`,
                          }}
                        />
                      );
                    })}
                    <svg
                      width={orbitalRadius * 2.2}
                      height={orbitalRadius * 2.2}
                      viewBox={`${-orbitalRadius * 1.1} ${-orbitalRadius * 1.1} ${orbitalRadius * 2.2} ${orbitalRadius * 2.2}`}
                      style={{ position: 'absolute', inset: 0, margin: 'auto', overflow: 'visible' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const a1 = (i / 12) * Math.PI * 2;
                        const a2 = ((i + 4) / 12) * Math.PI * 2;
                        return (
                          <line
                            key={i}
                            x1={Math.cos(a1) * orbitalRadius}
                            y1={Math.sin(a1) * orbitalRadius}
                            x2={Math.cos(a2) * orbitalRadius}
                            y2={Math.sin(a2) * orbitalRadius}
                            stroke={shapeTint}
                            strokeWidth={Math.max(1, shapeStrokeWidth * 0.5)}
                            strokeDasharray={strokeDash}
                            opacity="0.35"
                          />
                        );
                      })}
                    </svg>
                  </>
                )}
              </div>
            )}

            {/* Vector Character Rig Layer */}
            {charLayer?.visible && (
              <div
                className="motion-char-container"
                style={{
                  transform: `translate(${characterPosX}px, ${charAnimY}px) scale(${characterScale}) rotate(${charAnimRotate}deg)`,
                  filter: `drop-shadow(0 0 ${glowBloom * charGlowPulse}px ${characterTint})`,
                }}
              >
                <svg
                  viewBox="0 0 160 200"
                  width="140"
                  height="175"
                  className="motion-char-svg"
                >
                  <defs>
                    <radialGradient id="mg-plasmaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={characterTint} stopOpacity="1" />
                      <stop offset="60%" stopColor={characterTint} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={characterTint} stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Thruster Plasma Trail */}
                  <ellipse cx="80" cy="165" rx={12 * charGlowPulse} ry={22 * charGlowPulse} fill="url(#mg-plasmaGlow)" />
                  <ellipse cx="80" cy="158" rx={5} ry={10} fill="#FFFFFF" />

                  {/* Left Leg */}
                  <g transform={`translate(65, 130) rotate(${charLegL})`}>
                    <rect x="-6" y="0" width="12" height="30" rx="6" fill="#141a14" stroke={characterTint} strokeWidth="1.5" />
                    <rect x="-8" y="26" width="16" height="8" rx="4" fill={characterTint} />
                  </g>

                  {/* Right Leg */}
                  <g transform={`translate(95, 130) rotate(${charLegR})`}>
                    <rect x="-6" y="0" width="12" height="30" rx="6" fill="#141a14" stroke={characterTint} strokeWidth="1.5" />
                    <rect x="-8" y="26" width="16" height="8" rx="4" fill={characterTint} />
                  </g>

                  {/* Robot Torso */}
                  <rect x="50" y="75" width="60" height="60" rx="14" fill="#151e15" stroke={characterTint} strokeWidth="2" />

                  {/* Center Energy Core */}
                  <circle cx="80" cy="105" r="12" fill="#0a0f0a" stroke={characterTint} strokeWidth="1.5" />
                  <circle cx="80" cy="105" r={6 * charGlowPulse} fill={characterTint} />

                  {/* Left Arm */}
                  <g transform={`translate(45, 85) rotate(${charArmL})`}>
                    <rect x="-6" y="0" width="10" height="32" rx="5" fill="#141a14" stroke={characterTint} strokeWidth="1.5" />
                    <circle cx="-1" cy="34" r="5" fill={characterTint} />
                  </g>

                  {/* Right Arm */}
                  <g transform={`translate(115, 85) rotate(${charArmR})`}>
                    <rect x="-4" y="0" width="10" height="32" rx="5" fill="#141a14" stroke={characterTint} strokeWidth="1.5" />
                    <circle cx="1" cy="34" r="5" fill={characterTint} />
                  </g>

                  {/* Head & HUD Visor */}
                  <g transform={`translate(80, 50) rotate(${charHeadTilt})`}>
                    <rect x="-26" y="-26" width="52" height="46" rx="14" fill="#0e160e" stroke={characterTint} strokeWidth="2" />
                    <rect x="-18" y="-12" width="36" height="16" rx="6" fill="#000000" stroke={characterTint} strokeWidth="1.5" />
                    <circle cx="-6" cy="-4" r="3" fill={characterTint} />
                    <circle cx="6" cy="-4" r="3" fill={characterTint} />
                    <line x1="0" y1="-26" x2="0" y2="-38" stroke={characterTint} strokeWidth="2" />
                    <circle cx="0" cy="-40" r="4" fill={characterTint} />
                  </g>
                </svg>
              </div>
            )}

            {/* Kinetic Typography Layer */}
            {textLayer?.visible && (
              <div
                className="motion-elem motion-elem--text"
                style={{
                  transform: `translateY(${58 + textY}px) scale(${textScale}) rotate(${textRotate}deg)`,
                  filter: `drop-shadow(0 0 ${glowBloom * 0.6}px ${characterTint})`,
                  opacity: textOpacity,
                }}
              >
                {textAnimStyle === 'wave' ? (
                  <span className="motion-text-char" style={{ color: textColor, letterSpacing: `${textTracking}px` }}>
                    {textVal.split('').map((char, ci) => (
                      <span
                        key={ci}
                        style={{
                          display: 'inline-block',
                          transform: `translateY(${Math.sin(cycleRad * 2 + ci * 0.6) * -8}px)`,
                          transition: 'transform 0.05s linear',
                        }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span
                    className="motion-text-char"
                    style={{ color: textColor, letterSpacing: `${textTracking}px` }}
                  >
                    {textVal}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Transport Bar */}
          <div className="motion-transport-bar">
            <button
              type="button"
              className="transport-btn transport-btn--play"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </button>

            <button
              type="button"
              className="transport-btn"
              onClick={() => setCurrentTime(0)}
              title="Rewind to 0s"
            >
              <RotateCcwIcon size={14} />
            </button>

            <div className="transport-speed-group">
              <span className="transport-label">Speed:</span>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`speed-chip ${speedMultiplier === s ? 'is-active' : ''}`}
                  onClick={() => setSpeedMultiplier(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`mini-chip-toggle ${isLooping ? 'is-active' : ''}`}
              onClick={() => setIsLooping(!isLooping)}
            >
              Loop: {isLooping ? 'ON' : 'OFF'}
            </button>

            <div className="motion-timeline-readout">
              <span>{currentTime.toFixed(2)}s / {duration.toFixed(2)}s</span>
            </div>
          </div>

          {/* Interactive Scrubbable Keyframe Timeline Track */}
          <div className="motion-keyframe-bar">
            <div
              ref={timelineTrackRef}
              className="motion-keyframe-track"
              onMouseDown={handleTimelineMouseDown}
              onTouchStart={handleTimelineTouchStart}
              title="Click or drag to scrub playhead"
            >
              {/* Ruler Ticks */}
              <div className="motion-track-ticks" aria-hidden="true">
                {keyframeTimes.map((kf) => (
                  <div
                    key={kf}
                    className="motion-track-tick motion-track-tick--major"
                    style={{ left: `${(kf / duration) * 100}%` }}
                  >
                    <span className="motion-track-tick__label">{kf.toFixed(1)}s</span>
                  </div>
                ))}
              </div>

              {/* Diamond Keyframe Markers */}
              {keyframeTimes.map((kf) => {
                const isNear = Math.abs(currentTime - kf) < 0.05;
                return (
                  <div
                    key={kf}
                    className={`keyframe-diamond ${isNear ? 'is-active' : ''}`}
                    style={{ left: `${(kf / duration) * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTime(kf);
                    }}
                    title={`Snap to Keyframe @ ${kf.toFixed(1)}s`}
                  >
                    <DiamondIcon size={10} />
                  </div>
                );
              })}

              {/* Scrubbing Playhead */}
              <div
                className="motion-keyframe-playhead"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Inspector & Controls */}
        <aside className="design-inspector">
          <div className="inspector-tabs">
            <button
              type="button"
              className={`inspector-tab ${inspectorTab === 'character' ? 'is-active' : ''}`}
              onClick={() => setInspectorTab('character')}
            >
              <StarIcon size={13} />
              <span>Rig</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${inspectorTab === 'typography' ? 'is-active' : ''}`}
              onClick={() => setInspectorTab('typography')}
            >
              <TypeIcon size={13} />
              <span>Text</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${inspectorTab === 'shapes' ? 'is-active' : ''}`}
              onClick={() => setInspectorTab('shapes')}
            >
              <SlidersIcon size={13} />
              <span>Shapes & FX</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${inspectorTab === 'layers' ? 'is-active' : ''}`}
              onClick={() => setInspectorTab('layers')}
            >
              <LayersIcon size={13} />
              <span>Layers</span>
            </button>
          </div>

          <div className="inspector-body">
            {/* Locked Layer Banner Notice */}
            {isCurrentLayerLocked && (
              <div className="locked-layer-banner">
                <LockIcon size={13} />
                <span>This layer is locked. Unlock it in the Layers tab to edit.</span>
              </div>
            )}

            {/* TAB 1: Character Rig Controls */}
            {inspectorTab === 'character' && (
              <div className="inspector-group" style={{ opacity: charLayer?.locked ? 0.45 : 1, pointerEvents: charLayer?.locked ? 'none' : 'auto' }}>
                <div className="control-row">
                  <label className="control-label">Motion Mode</label>
                  <div className="motion-presets-grid">
                    {[
                      { id: 'hover', label: 'Float' },
                      { id: 'strut', label: 'Walk' },
                      { id: 'jump', label: 'Bounce' },
                      { id: 'glitch', label: 'Glitch' },
                      { id: 'orbit', label: 'Orbit' },
                      { id: 'spin', label: 'Spin' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`motion-preset-pill ${characterMode === p.id ? 'is-active' : ''}`}
                        onClick={() => setCharacterMode(p.id as CharacterMode)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Scale ({Math.round(characterScale * 100)}%)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={characterScale}
                      onChange={(e) => setCharacterScale(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Rotation ({characterRotation}°)</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={characterRotation}
                      onChange={(e) => setCharacterRotation(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Pos X ({characterPosX}px)</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={characterPosX}
                      onChange={(e) => setCharacterPosX(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Pos Y ({characterPosY}px)</label>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={characterPosY}
                      onChange={(e) => setCharacterPosY(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-row">
                  <label className="control-label">Playback Direction</label>
                  <div className="control-btn-group">
                    {(['forward', 'reverse', 'ping-pong'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`mini-btn ${direction === d ? 'is-active' : ''}`}
                        onClick={() => setDirection(d)}
                      >
                        {d === 'forward' ? '▶ FWD' : d === 'reverse' ? '◀ REV' : '⇄ PING'}
                      </button>
                    ))}
                  </div>
                </div>

                <HexColorPicker
                  label="Rig Accent & Plasma Core Tint"
                  value={characterTint}
                  onChange={(c) => setCharacterTint(c)}
                  defaultValue="#B3E32B"
                />
              </div>
            )}

            {/* TAB 2: Kinetic Typography */}
            {inspectorTab === 'typography' && (
              <div className="inspector-group" style={{ opacity: textLayer?.locked ? 0.45 : 1, pointerEvents: textLayer?.locked ? 'none' : 'auto' }}>
                <div className="control-row">
                  <label className="control-label">Text Content</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder="Enter motion text..."
                    maxLength={24}
                  />
                </div>

                <div className="control-row">
                  <label className="control-label">Animation Style</label>
                  <div className="motion-presets-grid">
                    {[
                      { id: 'pop', label: 'Pop' },
                      { id: 'pulse', label: 'Pulse' },
                      { id: 'glitch', label: 'Glitch' },
                      { id: 'drift', label: 'Drift' },
                      { id: 'wave', label: 'Wave' },
                      { id: 'neon', label: 'Neon' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`motion-preset-pill ${textAnimStyle === st.id ? 'is-active' : ''}`}
                        onClick={() => setTextAnimStyle(st.id as TextAnimStyle)}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Scale ({Math.round(textScaleMult * 100)}%)</label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.6"
                      step="0.05"
                      value={textScaleMult}
                      onChange={(e) => setTextScaleMult(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Tracking ({textTracking}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={textTracking}
                      onChange={(e) => setTextTracking(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <HexColorPicker
                  label="Typography Fill Color"
                  value={textColor}
                  onChange={(c) => setTextColor(c)}
                  defaultValue="#FFFFFF"
                />
              </div>
            )}

            {/* TAB 3: Shapes & FX */}
            {inspectorTab === 'shapes' && (
              <div className="inspector-group" style={{ opacity: shapeLayer?.locked ? 0.45 : 1, pointerEvents: shapeLayer?.locked ? 'none' : 'auto' }}>
                <div className="control-row">
                  <label className="control-label">Motion Graphic Element</label>
                  <div className="motion-presets-grid">
                    {[
                      { id: 'ring', label: 'Orbital Ring' },
                      { id: 'triangle', label: 'Neon Delta' },
                      { id: 'hexagon', label: 'Tech Shield' },
                      { id: 'burst', label: 'Starburst' },
                      { id: 'radar', label: 'HUD Radar' },
                      { id: 'wave', label: 'Harmonic Wave' },
                      { id: 'spectrum', label: 'Audio Spectrum' },
                      { id: 'cube', label: '3D Cube' },
                      { id: 'vortex', label: 'Vortex' },
                      { id: 'particles', label: 'Constellation' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`motion-preset-pill ${activeShape === s.id ? 'is-active' : ''}`}
                        onClick={() => setActiveShape(s.id as ShapePreset)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-row">
                  <label className="control-label">Dash Style</label>
                  <div className="control-btn-group">
                    {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        className={`mini-btn ${shapeDashStyle === style ? 'is-active' : ''}`}
                        onClick={() => setShapeDashStyle(style)}
                      >
                        {style.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-row">
                  <label className="control-label">Rotation Speed</label>
                  <div className="control-btn-group">
                    {[-2, -1, 0, 1, 2, 3].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        className={`mini-btn ${shapeRotationSpeed === spd ? 'is-active' : ''}`}
                        onClick={() => setShapeRotationSpeed(spd)}
                      >
                        {spd === 0 ? 'STOP' : `${spd}x`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Stroke ({shapeStrokeWidth}px)</label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="0.5"
                      value={shapeStrokeWidth}
                      onChange={(e) => setShapeStrokeWidth(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Radius ({orbitalRadius}px)</label>
                    <input
                      type="range"
                      min="50"
                      max="160"
                      value={orbitalRadius}
                      onChange={(e) => setOrbitalRadius(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Glow Bloom ({glowBloom}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={glowBloom}
                      onChange={(e) => setGlowBloom(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Particles ({particleCount})</label>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      step="2"
                      value={particleCount}
                      onChange={(e) => setParticleCount(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                </div>

                <HexColorPicker
                  label="Shape Stroke & Glow Color"
                  value={shapeTint}
                  onChange={(c) => setShapeTint(c)}
                  defaultValue="#B3E32B"
                />
              </div>
            )}

            {/* TAB 4: Layers Stack */}
            {inspectorTab === 'layers' && (
              <div className="inspector-group">
                <label className="control-label">Composition Layer Stack</label>
                <div className="layers-list" style={{ marginTop: '8px' }}>
                  {layers.map((l) => (
                    <div key={l.id} className={`layer-item ${l.visible ? 'is-active' : ''}`}>
                      <span
                        className="layer-item__color-dot"
                        style={{ background: l.id === 'layer-shape' ? shapeTint : l.id === 'layer-char' ? characterTint : l.color }}
                      />
                      <span className="layer-item__type-icon">
                        {l.type === 'character' ? <StarIcon size={11} /> : l.type === 'text' ? <TypeIcon size={11} /> : <SlidersIcon size={11} />}
                      </span>
                      <span className="layer-item__name">{l.name}</span>
                      <div className="layer-item__tools">
                        <button
                          type="button"
                          className="layer-icon-btn"
                          onClick={() => toggleVisibility(l.id)}
                          title={l.visible ? 'Hide Layer' : 'Show Layer'}
                        >
                          {l.visible ? <EyeIcon size={11} /> : <EyeOffIcon size={11} />}
                        </button>
                        <button
                          type="button"
                          className="layer-icon-btn"
                          onClick={() => toggleLock(l.id)}
                          title={l.locked ? 'Unlock Layer' : 'Lock Layer'}
                        >
                          {l.locked ? <LockIcon size={11} /> : <UnlockIcon size={11} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
