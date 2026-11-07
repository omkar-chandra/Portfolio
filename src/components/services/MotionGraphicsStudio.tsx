import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon, PauseIcon, RotateCcwIcon, DiamondIcon, StarIcon
} from './ServiceIcons';
import { HexColorPicker } from './HexColorPicker';

export type CharacterMode = 'hover' | 'strut' | 'jump' | 'glitch' | 'orbit' | 'spin';
export type PlaybackDirection = 'forward' | 'reverse' | 'ping-pong';

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
  const [characterScale, setCharacterScale] = useState(1.0);
  const [characterPosX, setCharacterPosX] = useState(0);
  const [characterPosY, setCharacterPosY] = useState(0);
  const [characterRotation, setCharacterRotation] = useState(0);
  const [characterTint, setCharacterTint] = useState('#B3E32B');

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
      const rawDelta = (now - lastTimestampRef.current) / 1000;
      const delta = Math.min(rawDelta, 0.08) * speedMultiplier;
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

  let charArmL = 0;
  let charHandL = 0;
  let charArmR = 0;
  let charHandR = 0;
  let charHeadTilt = 0;
  let charHeadBob = 0;
  let charHairBun = 0;

  if (characterMode === 'hover') {
    charAnimY += Math.sin(cycleRad) * 12;
    charAnimRotate += Math.cos(cycleRad) * 2.5;
    charHeadBob = Math.sin(cycleRad * 2) * 2.8;
    charHeadTilt = Math.sin(cycleRad) * 5.5;
    charHairBun = Math.sin(cycleRad - 0.4) * 7.5;
    charArmL = Math.sin(cycleRad) * 10;
    charHandL = Math.sin(cycleRad * 2) * 8;
    charArmR = -Math.sin(cycleRad) * 12;
    charHandR = Math.sin(cycleRad * 2.5) * 14;
  } else if (characterMode === 'strut') {
    charAnimY += Math.abs(Math.sin(cycleRad * 2)) * -10;
    charAnimRotate += Math.sin(cycleRad) * 4;
    charHeadBob = Math.sin(cycleRad * 2) * 3.5;
    charHeadTilt = Math.cos(cycleRad) * 4.5;
    charHairBun = Math.cos(cycleRad - 0.3) * 8;
    charArmL = -Math.sin(cycleRad) * 20;
    charHandL = -Math.sin(cycleRad) * 14;
    charArmR = Math.sin(cycleRad) * 20;
    charHandR = Math.sin(cycleRad) * 14;
  } else if (characterMode === 'jump') {
    const jumpCycle = (1 - Math.cos(cycleRad)) * 0.5;
    charAnimY += jumpCycle * -38;
    charAnimRotate += Math.sin(cycleRad) * 5;
    charHeadBob = jumpCycle * -4;
    charHeadTilt = Math.sin(cycleRad) * -7;
    charHairBun = Math.sin(cycleRad - 0.5) * -12;
    charArmL = jumpCycle * -28;
    charHandL = jumpCycle * -18;
    charArmR = jumpCycle * -28;
    charHandR = jumpCycle * 18;
  } else if (characterMode === 'glitch') {
    const jitter = Math.sin(progress * Math.PI * 16);
    charAnimY += jitter * 6;
    charAnimRotate += jitter * 3;
    charHeadBob = jitter * 2.5;
    charHeadTilt = jitter * 6;
    charHairBun = jitter * 8;
    charArmL = jitter * 10;
    charHandL = jitter * 12;
    charArmR = -jitter * 10;
    charHandR = -jitter * 12;
  } else if (characterMode === 'orbit') {
    charAnimRotate += progress * 360;
    charAnimY += Math.sin(cycleRad) * 14;
    charHeadBob = Math.cos(cycleRad * 2) * 2.5;
    charHeadTilt = Math.sin(cycleRad) * 7;
    charHairBun = Math.sin(cycleRad - 0.4) * 9;
    charArmL = Math.sin(cycleRad) * 12;
    charHandL = Math.cos(cycleRad) * 10;
    charArmR = -Math.sin(cycleRad) * 12;
    charHandR = -Math.cos(cycleRad) * 10;
  } else if (characterMode === 'spin') {
    charAnimRotate += progress * 720;
    charAnimY += Math.cos(cycleRad * 2) * 8;
    charHeadBob = Math.sin(cycleRad * 4) * 2;
    charHeadTilt = Math.sin(cycleRad * 4) * 4;
    charHairBun = Math.sin(cycleRad * 4) * 6;
    charArmL = Math.sin(cycleRad * 4) * 10;
    charHandL = Math.cos(cycleRad * 4) * 8;
    charArmR = -Math.sin(cycleRad * 4) * 10;
    charHandR = -Math.cos(cycleRad * 4) * 8;
  }

  // Reset all
  const handleResetAll = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setSpeedMultiplier(1.0);
    setDirection('forward');
    setIsLooping(true);
    setCharacterMode('hover');
    setCharacterScale(1.0);
    setCharacterPosX(0);
    setCharacterPosY(0);
    setCharacterRotation(0);
    setCharacterTint('#B3E32B');
  };

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
            {/* LottieFiles Inspired Stage Canvas Toolbar */}
            <div className="motion-stage-toolbar">
              <div className="stage-tool-group">
                <button type="button" className="stage-tool-btn is-active" title="Selection Tool (V)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                </button>
                <button type="button" className="stage-tool-btn" title="Path / Pen Tool (P)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </button>
                <button type="button" className="stage-tool-btn" title="Shape Tool (R)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                  </svg>
                </button>
                <button type="button" className="stage-tool-btn" title="Type Tool (T)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                </button>
                <button type="button" className="stage-tool-btn" title="Hand / Pan Tool (H)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v7M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                </button>
                <div className="stage-tool-divider" />
                <span className="stage-zoom-indicator">100%</span>
              </div>

              <div className="stage-breadcrumb">
                <span className="stage-breadcrumb__proj">PerkyMotion</span>
                <span className="stage-breadcrumb__sep">/</span>
                <span className="stage-breadcrumb__scene">Brewing-Jenny-3D</span>
              </div>
            </div>

            {/* Background Grid & Safe Reticle */}
            <div className="motion-stage__grid" aria-hidden="true">
              <span className="crosshair crosshair--tl">+</span>
              <span className="crosshair crosshair--tr">+</span>
              <span className="crosshair crosshair--bl">+</span>
              <span className="crosshair crosshair--br">+</span>
              <span className="center-reticle" />
            </div>

            {/* Vector Character Rig Layer - Sole Visual Focus */}
            <div
              className="motion-char-container"
              style={{
                transform: `translate(calc(-50% + ${characterPosX}px), calc(-50% + ${charAnimY}px)) scale(${characterScale}) rotate(${charAnimRotate}deg)`,
              }}
            >
              <svg
                viewBox="0 0 500 280"
                width="450"
                height="252"
                className="motion-char-svg"
              >
                <defs>
                  <linearGradient id="mg-hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2c2230" />
                    <stop offset="60%" stopColor="#17121b" />
                    <stop offset="100%" stopColor="#0d0910" />
                  </linearGradient>

                  <radialGradient id="mg-skinGrad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffe6d5" />
                    <stop offset="70%" stopColor="#fcd0b6" />
                    <stop offset="100%" stopColor="#f0b292" />
                  </radialGradient>

                  <radialGradient id="mg-cheekBlush" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff6584" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#ff758f" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff758f" stopOpacity="0" />
                  </radialGradient>

                  <linearGradient id="mg-sleeveGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  <linearGradient id="mg-apronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a47" />
                    <stop offset="100%" stopColor="#0f212a" />
                  </linearGradient>

                  <linearGradient id="mg-woodTop" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="40%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#c2410c" />
                  </linearGradient>

                  <linearGradient id="mg-woodEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9a3412" />
                    <stop offset="100%" stopColor="#7c2d12" />
                  </linearGradient>

                  <linearGradient id="mg-counterBase" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#134e4a" />
                    <stop offset="100%" stopColor="#042f2e" />
                  </linearGradient>

                  <linearGradient id="mg-slatHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#115e59" />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#042f2e" />
                  </linearGradient>

                  <linearGradient id="mg-machineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="25%" stopColor="#facc15" />
                    <stop offset="80%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>

                  <linearGradient id="mg-metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>

                  <radialGradient id="mg-potGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#e9d5ff" />
                    <stop offset="60%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </radialGradient>

                  <linearGradient id="mg-leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                </defs>

                {/* Rising Animated Steam from Cups */}
                <g opacity="0.8">
                  <path
                    d={`M 268,174 C 265,${160 + Math.sin(cycleRad * 2) * 5} 271,${148 + Math.sin(cycleRad * 2) * 5} 267,136`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.55)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 292,174 C 295,${158 - Math.sin(cycleRad * 2) * 5} 289,${146 - Math.sin(cycleRad * 2) * 5} 293,134`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.55)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* 3D CHARACTER: Jenny (Centered, Leaning at Counter) */}
                <g id="character-rig">
                  {/* Back Hair Bun / Ponytail */}
                  <g transform={`translate(162, ${104 + charHeadBob * 0.7}) rotate(${charHairBun})`}>
                    <circle cx="-16" cy="-14" r="18" fill="url(#mg-hairGrad)" />
                    {/* Hair Tie with user's selected accent tint */}
                    <ellipse cx="-16" cy="-2" rx="7" ry="4" fill={characterTint} />
                  </g>

                  {/* Torso & Shoulders */}
                  <g id="character-torso">
                    {/* Left Shoulder (Warm Honey Sleeve) */}
                    <ellipse cx="152" cy="184" rx="22" ry="17" fill="url(#mg-sleeveGrad)" />
                    {/* Right Shoulder (Warm Honey Sleeve) */}
                    <ellipse cx="232" cy="184" rx="20" ry="16" fill="url(#mg-sleeveGrad)" />

                    {/* Apron Body */}
                    <path
                      d="M 152,180 C 158,162 225,162 232,180 L 236,204 L 148,204 Z"
                      fill="url(#mg-apronGrad)"
                      stroke={characterTint}
                      strokeWidth="1.2"
                      strokeOpacity="0.4"
                    />

                    {/* Apron Straps */}
                    <line x1="168" y1="172" x2="178" y2="204" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
                    <line x1="216" y1="172" x2="206" y2="204" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />

                    {/* Apron Badge with Accent Glow */}
                    <rect x="186" y="184" width="16" height="10" rx="3" fill="#0f172a" stroke={characterTint} strokeWidth="1" />
                    <circle cx="194" cy="189" r="2.5" fill={characterTint} />
                  </g>

                  {/* Left Arm (Resting on counter with dynamic flex) */}
                  <g transform={`translate(142, 178) rotate(${charArmL})`}>
                    <path d="M 0,0 C -12,14 -16,28 -4,32 C 6,35 14,24 10,10 Z" fill="url(#mg-sleeveGrad)" />
                    {/* Left Hand Articulation */}
                    <g transform={`translate(-3, 33) rotate(${charHandL})`}>
                      <ellipse cx="0" cy="0" rx="9" ry="7" fill="url(#mg-skinGrad)" />
                      <path d="M -5,1 Q 0,3 5,1" stroke="#d97706" strokeWidth="0.8" fill="none" opacity="0.35" />
                    </g>
                  </g>

                  {/* Right Arm (Waving / working on espresso machine) */}
                  <g transform={`translate(230, 180) rotate(${charArmR})`}>
                    <path d="M 0,0 C 14,8 20,20 18,30 C 12,34 4,26 2,12 Z" fill="url(#mg-sleeveGrad)" />
                    {/* Right Hand Articulation */}
                    <g transform={`translate(18, 31) rotate(${charHandR})`}>
                      <ellipse cx="0" cy="0" rx="8" ry="6" fill="url(#mg-skinGrad)" />
                      <path d="M -4,0 Q 0,2 4,0" stroke="#d97706" strokeWidth="0.8" fill="none" opacity="0.35" />
                    </g>
                  </g>

                  {/* Head & Expressive Face (Chibi proportions, tilted with charHeadTilt) */}
                  <g transform={`translate(192, ${126 + charHeadBob}) rotate(${charHeadTilt})`}>
                    {/* Neck */}
                    <rect x="-9" y="16" width="18" height="22" rx="6" fill="url(#mg-skinGrad)" />

                    {/* Head Base */}
                    <ellipse cx="0" cy="0" rx="34" ry="32" fill="url(#mg-skinGrad)" />

                    {/* Ears & Mini Earrings */}
                    <ellipse cx="-34" cy="4" rx="6" ry="8" fill="url(#mg-skinGrad)" />
                    <circle cx="-34" cy="6" r="1.5" fill={characterTint} />
                    <ellipse cx="34" cy="4" rx="6" ry="8" fill="url(#mg-skinGrad)" />
                    <circle cx="34" cy="6" r="1.5" fill={characterTint} />

                    {/* Back Hair Cap */}
                    <path
                      d="M -34,-2 C -34,-24 -24,-36 0,-36 C 24,-36 34,-24 34,-2 C 34,10 32,24 28,30 C 26,20 28,-14 0,-16 C -28,-14 -26,20 -28,30 C -32,24 -34,10 -34,-2 Z"
                      fill="url(#mg-hairGrad)"
                    />

                    {/* Front Volumetric Bangs */}
                    <path
                      d="M -34,0 C -26,-28 26,-28 34,0 C 26,-8 14,-22 -4,-18 C -18,-15 -26,-6 -34,0 Z"
                      fill="url(#mg-hairGrad)"
                    />
                    <path
                      d="M -16,-20 C 4,-20 16,-12 24,-2 C 16,-6 6,-10 -6,-10 C -12,-10 -15,-14 -16,-20 Z"
                      fill="#3b2d42"
                    />

                    {/* Rosy Pink Blush Cheeks */}
                    <ellipse cx="-16" cy="11" rx="7.5" ry="5.5" fill="url(#mg-cheekBlush)" />
                    <ellipse cx="16" cy="11" rx="7.5" ry="5.5" fill="url(#mg-cheekBlush)" />

                    {/* Happy Curved Eyes with Eyelashes & Specular Shine */}
                    <path
                      d="M -23,4 C -18,-3 -10,-3 -5,4"
                      fill="none"
                      stroke="#1a141e"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <circle cx="-14" cy="0" r="1.5" fill="#ffffff" />
                    <line x1="-22" y1="2" x2="-25" y2="-1" stroke="#1a141e" strokeWidth="2" strokeLinecap="round" />

                    <path
                      d="M 5,4 C 10,-3 18,-3 23,4"
                      fill="none"
                      stroke="#1a141e"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <circle cx="14" cy="0" r="1.5" fill="#ffffff" />
                    <line x1="22" y1="2" x2="25" y2="-1" stroke="#1a141e" strokeWidth="2" strokeLinecap="round" />

                    {/* Dainty Nose */}
                    <circle cx="0" cy="8" r="1.5" fill="#e09f80" />

                    {/* Sweet Cheerful Open Smile */}
                    <path
                      d="M -7,16 Q 0,25 7,16 Z"
                      fill="#ff4d6d"
                      stroke="#1a141e"
                      strokeWidth="1.5"
                    />
                    <path d="M -5,16 Q 0,20 5,16 Z" fill="#ffffff" />
                  </g>
                </g>

                {/* STUDIO COUNTER & PROPS (LottieFiles inspired) */}
                <g id="studio-workstation">
                  {/* Deep Emerald Ribbed Base */}
                  <rect x="50" y="214" width="400" height="52" rx="4" fill="url(#mg-counterBase)" />

                  {/* Vertical Ribbed Slats */}
                  {[75, 105, 135, 165, 195, 225, 255, 285, 315, 345, 375, 405, 430].map((slatX) => (
                    <rect
                      key={slatX}
                      x={slatX}
                      y="214"
                      width="4"
                      height="52"
                      fill="url(#mg-slatHighlight)"
                      opacity="0.8"
                    />
                  ))}

                  {/* Tabletop Edge Bevel */}
                  <rect x="25" y="206" width="450" height="8" rx="2" fill="url(#mg-woodEdge)" />

                  {/* Warm Amber Tabletop Surface */}
                  <rect x="25" y="192" width="450" height="15" rx="4" fill="url(#mg-woodTop)" />
                  <line x1="35" y1="195" x2="465" y2="195" stroke="#fed7aa" strokeWidth="1.2" strokeOpacity="0.4" />

                  {/* Prop 1: Milk Carafe / Glass Beaker */}
                  <g id="prop-milk" transform="translate(48, 150)">
                    <path
                      d="M 6,0 L 14,0 L 14,8 L 19,36 C 20,41 17,45 11,45 C 5,45 1,41 2,36 L 7,8 Z"
                      fill="rgba(186, 230, 253, 0.45)"
                      stroke="#7dd3fc"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 3,24 L 18,24 L 19,36 C 20,41 17,45 11,45 C 5,45 1,41 2,36 Z"
                      fill="#f8fafc"
                    />
                    <rect x="7" y="-5" width="7" height="6" rx="1.5" fill="#b45309" />
                  </g>

                  {/* Prop 2: Kraft Coffee Bean Bag */}
                  <g id="prop-coffee-beans" transform="translate(82, 160)">
                    <path
                      d="M 2,6 L 24,6 L 26,38 C 26,42 22,44 14,44 C 6,44 1,42 1,38 Z"
                      fill="#78350f"
                      stroke="#451a03"
                      strokeWidth="1.5"
                    />
                    <polygon points="2,6 13,0 24,6" fill="#92400e" />
                    <rect x="7" y="14" width="13" height="18" rx="2.5" fill="#fef3c7" />
                    <ellipse cx="13.5" cy="23" rx="3.5" ry="5" fill="#78350f" transform="rotate(20 13.5 23)" />
                    <line x1="12" y1="19" x2="15" y2="27" stroke="#fef3c7" strokeWidth="0.8" />
                  </g>

                  {/* Prop 3: Retro-Modern Canary Yellow Espresso Machine */}
                  <g id="prop-espresso-machine" transform="translate(238, 122)">
                    <rect x="0" y="8" width="98" height="66" rx="8" fill="url(#mg-machineGrad)" stroke="#b45309" strokeWidth="1.5" />
                    <rect x="4" y="2" width="90" height="7" rx="3.5" fill="url(#mg-metalGrad)" />
                    {[14, 26, 38, 50, 62, 74].map((slotX) => (
                      <line key={slotX} x1={slotX} y1="4" x2={slotX + 8} y2="4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                    ))}

                    {/* Pressure Gauge Dial */}
                    <circle cx="49" cy="25" r="9" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
                    <circle cx="49" cy="25" r="1.5" fill="#ef4444" />
                    <line x1="49" y1="25" x2="54" y2="20" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="20" cy="24" r="3" fill="#10b981" />
                    <circle cx="78" cy="24" r="3" fill={characterTint} />

                    {/* Group heads */}
                    <rect x="26" y="44" width="14" height="6" rx="2" fill="url(#mg-metalGrad)" />
                    <rect x="58" y="44" width="14" height="6" rx="2" fill="url(#mg-metalGrad)" />

                    {/* Steam Wand */}
                    <path d="M 0,28 C -14,35 -18,48 -14,64" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                    <ellipse cx="-14" cy="65" rx="3" ry="2" fill="url(#mg-metalGrad)" />

                    {/* White Espresso Cups */}
                    <g transform="translate(25, 52)">
                      <path d="M 2,0 L 14,0 L 13,16 C 13,20 10,21 8,21 C 5,21 3,20 3,16 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <path d="M 14,3 Q 18,7 13,11" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                    </g>
                    <g transform="translate(57, 52)">
                      <path d="M 2,0 L 14,0 L 13,16 C 13,20 10,21 8,21 C 5,21 3,20 3,16 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <path d="M 14,3 Q 18,7 13,11" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                    </g>
                  </g>

                  {/* Prop 4: Potted Plant with Gentle Leaf Sway */}
                  <g id="prop-plant" transform="translate(382, 130)">
                    <g transform={`rotate(${Math.sin(cycleRad) * 4} 18 55)`}>
                      <path
                        d="M 14,48 C 6,34 -4,26 2,10 C 14,6 20,20 18,46 Z"
                        fill="url(#mg-leafGrad)"
                        stroke="#14532d"
                        strokeWidth="1"
                      />
                      <path
                        d="M 18,48 C 12,28 16,8 24,0 C 32,8 34,30 22,48 Z"
                        fill="url(#mg-leafGrad)"
                        stroke="#14532d"
                        strokeWidth="1"
                      />
                      <path
                        d="M 22,48 C 26,30 38,22 42,12 C 45,26 36,40 24,50 Z"
                        fill="url(#mg-leafGrad)"
                        stroke="#14532d"
                        strokeWidth="1"
                      />
                    </g>

                    {/* Lavender Ceramic Pot */}
                    <ellipse cx="20" cy="54" rx="15" ry="6" fill="#7e22ce" opacity="0.4" />
                    <path
                      d="M 8,50 L 32,50 L 30,68 C 30,73 25,75 20,75 C 15,75 10,73 10,68 Z"
                      fill="url(#mg-potGrad)"
                      stroke="#7e22ce"
                      strokeWidth="1.2"
                    />
                    <ellipse cx="20" cy="50" rx="12" ry="4" fill="#a855f7" />
                  </g>
                </g>
              </svg>
            </div>
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
              className="inspector-tab is-active"
            >
              <StarIcon size={13} />
              <span>Rig</span>
            </button>
          </div>

          <div className="inspector-body">
            {/* Character Rig Controls */}
            <div className="inspector-group">
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
                label="Rig Accent & Studio Glow Tint"
                value={characterTint}
                onChange={(c) => setCharacterTint(c)}
                defaultValue="#B3E32B"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
