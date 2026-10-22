import React, { FC, useRef, useState, useEffect, useCallback } from 'react';
import { getYouTubeId } from '../data';

/* ──────────────────────────────────────────────────────────────────────────────
   VideoPlayer — premium custom controls + quality selector
   • Supports Cloudinary (native <video>) and YouTube (<iframe>) sources
   • YouTube: custom poster + play overlay, iframe loads with minimal UI
   • Imperative src swap on quality switch — NO unmount/remount (Cloudinary)
   • Accurate progress — tracks currentTime via RAF, never buffering
   • Center overlay: skip-back | play/pause | skip-forward (like Reference 2)
   • Volume: icon only in bar, slider slides out on hover
   • Auto-hide controls after 5 s of no mouse movement
────────────────────────────────────────────────────────────────────────────── */

type Quality = 'auto' | '1080p' | '720p' | '480p' | '360p';

interface QualityOption {
  label: string;
  value: Quality;
  transform: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  { label: 'Auto',  value: 'auto',  transform: ''                              },
  { label: '1080p', value: '1080p', transform: 'f_auto,q_auto:best,w_1920'    },
  { label: '720p',  value: '720p',  transform: 'f_auto,q_auto:good,w_1280'    },
  { label: '480p',  value: '480p',  transform: 'f_auto,q_auto:eco,w_854'      },
  { label: '360p',  value: '360p',  transform: 'f_auto,q_auto:low,w_640'      },
];

function detectDefaultQuality(): Quality {
  try {
    const conn = (navigator as any).connection ||
                 (navigator as any).mozConnection ||
                 (navigator as any).webkitConnection;
    if (!conn) return 'auto';
    const { effectiveType, downlink } = conn as { effectiveType?: string; downlink?: number };
    if (effectiveType === '4g' && (downlink ?? 10) >= 5) return 'auto';
    if (effectiveType === '4g')                          return '720p';
    if (effectiveType === '3g')                          return '480p';
    return '360p';
  } catch { return 'auto'; }
}

function buildQualityUrl(originalUrl: string, transform: string): string {
  if (!transform) return originalUrl;  // 'auto' = clean direct URL, keeps accept-ranges: bytes
  return originalUrl.replace(/\/upload\/.*?\//, `/upload/${transform}/`);
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const IconPlay = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);
const IconPause = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
    <rect x="4" y="3" width="5" height="18" rx="1.5"/>
    <rect x="15" y="3" width="5" height="18" rx="1.5"/>
  </svg>
);

/* Circular rewind arrow — matches Reference 2 style */
const IconRewind = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <path d="M2.5 8A9 9 0 1 1 3 16"/>
    <polyline points="2 3 2.5 8 7.5 7.5"/>
  </svg>
);

/* Circular fast-forward arrow — matches Reference 2 style */
const IconFastForward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <path d="M21.5 8A9 9 0 1 0 21 16"/>
    <polyline points="22 3 21.5 8 16.5 7.5"/>
  </svg>
);

/* Volume icons */
const IconVolumeFull = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);
const IconVolumeLow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconVolumeMute = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);
const IconFullscreen = ({ active }: { active: boolean }) => active ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/>
    <polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconQuality = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const VolumeIcon: FC<{ muted: boolean; level: number }> = ({ muted, level }) => {
  if (muted || level === 0) return <IconVolumeMute />;
  if (level < 0.5)          return <IconVolumeLow />;
  return <IconVolumeFull />;
};

/* ─── YouTube helpers ────────────────────────────────────────────────────── */
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

function buildYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeId(url);
  if (!id) return '';
  const params = new URLSearchParams({
    autoplay: '1',
    controls: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    fs: '1',
    playsinline: '1',
    color: 'white',
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function getYouTubePoster(url: string): string {
  const id = getYouTubeId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/* ─── YouTube Player Component ───────────────────────────────────────────── */
interface YouTubePlayerProps {
  src: string;
  autoPlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const YouTubePlayer: FC<YouTubePlayerProps> = ({ src, autoPlay, className, style }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(!!autoPlay);
  const [fullscreen, setFullscreen] = useState(false);
  const poster = getYouTubePoster(src);
  const embedUrl = buildYouTubeEmbedUrl(src);

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`vp-shell vp-shell--youtube ${fullscreen ? 'vp-shell--fullscreen' : ''} ${className ?? ''}`}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {!started ? (
        /* Custom poster + play button — portfolio style, no YouTube branding */
        <div
          className="vp-yt-poster"
          onClick={() => setStarted(true)}
          role="button"
          aria-label="Play video"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStarted(true); } }}
        >
          {poster && (
            <img
              src={poster}
              alt="Video thumbnail"
              className="vp-yt-poster__img"
              draggable={false}
            />
          )}
          <div className="vp-yt-poster__overlay" />
          {/* Custom play button matching portfolio style */}
          <div className="vp-center-overlay vp-center-overlay--visible">
            <button
              className="vp-center-btn vp-center-btn--side"
              style={{ visibility: 'hidden' }}
              aria-hidden="true"
              tabIndex={-1}
            >
              <IconRewind />
            </button>
            <button
              className="vp-center-btn vp-center-btn--main"
              onClick={(e) => { e.stopPropagation(); setStarted(true); }}
              aria-label="Play"
              tabIndex={-1}
            >
              <IconPlay size={28} />
            </button>
            <button
              className="vp-center-btn vp-center-btn--side"
              style={{ visibility: 'hidden' }}
              aria-hidden="true"
              tabIndex={-1}
            >
              <IconFastForward />
            </button>
          </div>
        </div>
      ) : (
        /* YouTube iframe — modestbranding minimises logo, controls=1 for user control */
        <div className="vp-yt-frame-wrap">
          <iframe
            src={embedUrl}
            title="Video player"
            className="vp-yt-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      )}
    </div>
  );
};

/* ─── Component Props ───────────────────────────────────────────────────────── */
interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  controlsList?: string;
  disablePictureInPicture?: boolean;
  onContextMenu?: (e: React.MouseEvent<HTMLVideoElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ─── Main VideoPlayer — routes YouTube vs Cloudinary ───────────────────── */
const VideoPlayer: FC<VideoPlayerProps> = ({
  src, autoPlay, loop, playsInline, onContextMenu, className, style,
}) => {
  if (isYouTubeUrl(src)) {
    return (
      <YouTubePlayer
        src={src}
        autoPlay={autoPlay}
        className={className}
        style={style}
      />
    );
  }
  return (
    <NativeVideoPlayer
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      onContextMenu={onContextMenu}
      className={className}
      style={style}
    />
  );
};

/* ─── Native (Cloudinary) Video Player ──────────────────────────────────── */
const NativeVideoPlayer: FC<VideoPlayerProps> = ({
  src, autoPlay, loop, playsInline, onContextMenu, className, style,
}) => {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const wrapRef        = useRef<HTMLDivElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const fillRef        = useRef<HTMLDivElement>(null);
  const thumbRef       = useRef<HTMLDivElement>(null);
  const rAF            = useRef<number | null>(null);
  const hideTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const savedTimeRef         = useRef<number>(0);
  const wasPlayingRef        = useRef<boolean>(false);
  const isSwitchingRef       = useRef<boolean>(false);
  const currentQualityUrlRef = useRef<string>('');
  const lastStateSec         = useRef<number>(-1);  // tracks last whole-second state update

  const [playing,     setPlaying]    = useState(!!autoPlay);
  const [currentT,    setCurrentT]   = useState(0);
  const [duration,    setDuration]   = useState(0);
  const [volume,      setVolume]     = useState(1);
  const [muted,       setMuted]      = useState(false);
  const [showVol,     setShowVol]    = useState(false);
  const [fullscreen,  setFullscreen] = useState(false);
  const [visible,     setVisible]    = useState(true);
  const [quality,     setQuality]    = useState<Quality>('auto');
  const [qualityOpen, setQualityOpen] = useState(false);

  const currentOption = QUALITY_OPTIONS.find(o => o.value === quality) ?? QUALITY_OPTIONS[0];
  const initialUrl    = buildQualityUrl(src, currentOption.transform);

  /* ── Imperative quality switch — no DOM remount ── */
  const switchQuality = useCallback((q: Quality) => {
    const v = videoRef.current;
    if (!v) { setQuality(q); setQualityOpen(false); return; }

    const opt    = QUALITY_OPTIONS.find(o => o.value === q) ?? QUALITY_OPTIONS[0];
    const newUrl = buildQualityUrl(src, opt.transform);

    if (newUrl === currentQualityUrlRef.current) {
      setQuality(q); setQualityOpen(false); return;
    }

    savedTimeRef.current   = v.currentTime;
    wasPlayingRef.current  = !v.paused;
    isSwitchingRef.current = true;
    lastStateSec.current   = -1;  // reset so new video's first second triggers state update

    setQuality(q);
    setQualityOpen(false);

    currentQualityUrlRef.current = newUrl;
    v.src = newUrl;
    v.load();

    const restoreTime = () => {
      if (savedTimeRef.current > 0) {
        v.currentTime = savedTimeRef.current;
      }
      if (v.duration && isFinite(v.duration)) {
        setDuration(v.duration);
      }
      if (wasPlayingRef.current) {
        v.play().catch(() => {});
      }
      isSwitchingRef.current = false;
      v.removeEventListener('loadedmetadata', restoreTime);
      v.removeEventListener('canplay', restoreTime);
    };
    v.addEventListener('loadedmetadata', restoreTime);
    v.addEventListener('canplay', restoreTime);
  }, [src]);

  /* ── RAF progress loop — DOM updates at 60fps, React state only on whole-second changes ── */
  const updateProgressVisuals = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    // While switching quality, freeze progress bar at savedTimeRef to eliminate glitching/jumping to 0
    if (isSwitchingRef.current) {
      if (duration > 0) {
        const pct = Math.min(100, (savedTimeRef.current / duration) * 100);
        if (fillRef.current)  fillRef.current.style.width = `${pct}%`;
        if (thumbRef.current) thumbRef.current.style.left  = `${pct}%`;
      }
      return;
    }

    const dur = v.duration;
    if (dur && isFinite(dur) && dur > 0) {
      const ct  = v.currentTime;
      const pct = Math.min(100, Math.max(0, (ct / dur) * 100));
      // 60fps: update DOM directly for smooth progress bar
      if (fillRef.current)  fillRef.current.style.width = `${pct}%`;
      if (thumbRef.current) thumbRef.current.style.left  = `${pct}%`;
      // React state: only update on integer second boundary (avoids 60fps re-renders)
      const sec = Math.floor(ct);
      if (sec !== lastStateSec.current) {
        lastStateSec.current = sec;
        setCurrentT(ct);
        setDuration(dur);
      }
    } else {
      const ct = v.currentTime;
      const sec = Math.floor(ct);
      if (sec !== lastStateSec.current) {
        lastStateSec.current = sec;
        setCurrentT(ct);
      }
    }
  }, [duration]);

  useEffect(() => {
    const loop = () => {
      updateProgressVisuals();
      rAF.current = requestAnimationFrame(loop);
    };
    rAF.current = requestAnimationFrame(loop);
    return () => { if (rAF.current) cancelAnimationFrame(rAF.current); };
  }, [updateProgressVisuals]);

  /* ── Video events — sync on mount and when src changes ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    currentQualityUrlRef.current = initialUrl;
    v.src = initialUrl;
    if (autoPlay) v.play().catch(() => {});

    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onLoaded = () => {
      if (v.duration && isFinite(v.duration)) {
        setDuration(v.duration);
      }
      if (savedTimeRef.current > 0) {
        v.currentTime = savedTimeRef.current;
      }
    };
    const onDurationChange = () => {
      if (v.duration && isFinite(v.duration)) setDuration(v.duration);
    };
    const onSeeked = () => updateProgressVisuals();

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('seeked', onSeeked);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('seeked', onSeeked);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  /* ── Fullscreen ── */
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  /* ── Close quality menu on outside click ── */
  useEffect(() => {
    if (!qualityOpen) return;
    const h = (e: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target as Node))
        setQualityOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [qualityOpen]);

  /* ── Auto-hide controls after 2.5 s ── */
  const showControls = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  /* ── Playback ── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
    showControls();
  }, [showControls]);

  const skipBackward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime - 5);
    showControls();
  }, [showControls]);

  const skipForward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    showControls();
  }, [showControls]);

  /* ── Seek bar ── */
  const scrubTo = useCallback((clientX: number) => {
    const bar = progressRef.current;
    const v   = videoRef.current;
    if (!bar || !v) return;
    const dur = v.duration;
    if (!dur || !isFinite(dur)) return;
    const rect = bar.getBoundingClientRect();
    const pct  = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = pct * dur;
    if (fillRef.current)  fillRef.current.style.width = `${pct * 100}%`;
    if (thumbRef.current) thumbRef.current.style.left = `${pct * 100}%`;
    showControls();
  }, [showControls]);

  const handleSeekMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    scrubTo(e.clientX);
    const onMove = (me: MouseEvent) => scrubTo(me.clientX);
    const onUp   = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [scrubTo]);

  /* ── Volume ── */
  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v   = videoRef.current;
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (v) { v.volume = val; v.muted = val === 0; }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
  }, [muted]);

  /* ── Fullscreen toggle ── */
  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(t.tagName) || t.isContentEditable) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case ' ': case 'k': case 'K': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': case 'l': case 'L':
          e.preventDefault(); v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); showControls(); break;
        case 'ArrowLeft': case 'j': case 'J':
          e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); showControls(); break;
        case 'ArrowUp': {
          e.preventDefault();
          const u = Math.min(1, volume + 0.1); setVolume(u); setMuted(u === 0); v.volume = u; showControls(); break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const d = Math.max(0, volume - 0.1); setVolume(d); setMuted(d === 0); v.volume = d; showControls(); break;
        }
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, showControls, toggleFullscreen, volume]);

  const controlsVisible = visible || !playing;

  return (
    <div
      ref={wrapRef}
      className={`vp-shell ${fullscreen ? 'vp-shell--fullscreen' : ''} ${!visible && playing ? 'vp-shell--idle' : ''} ${className ?? ''}`}
      style={style}
      onMouseMove={showControls}
      onMouseLeave={() => { if (playing) setVisible(false); }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Video — no key prop, imperative src swap */}
      <video
        ref={videoRef}
        loop={loop}
        playsInline={playsInline}
        muted={muted}
        onContextMenu={onContextMenu}
        className="vp-video"
        preload="metadata"
        onClick={togglePlay}
      />

      {/* ══ CENTER OVERLAY — skip / play / skip ══
          Three liquid-glass circles centred on the video, Reference 2 style */}
      <div className={`vp-center-overlay ${controlsVisible ? 'vp-center-overlay--visible' : ''}`}>
        <button
          className="vp-center-btn vp-center-btn--side"
          onClick={skipBackward}
          aria-label="Rewind 5 seconds"
        >
          <IconRewind />
        </button>

        <button
          className="vp-center-btn vp-center-btn--main"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPause size={28} /> : <IconPlay size={28} />}
        </button>

        <button
          className="vp-center-btn vp-center-btn--side"
          onClick={skipForward}
          aria-label="Forward 5 seconds"
        >
          <IconFastForward />
        </button>
      </div>

      {/* ══ BOTTOM CONTROL BAR ══ */}
      <div className={`vp-controls ${controlsVisible ? 'vp-controls--visible' : ''}`}>
        <div className="vp-glass-shelf">

          {/* Progress / seek */}
          <div
            ref={progressRef}
            className="vp-progress"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={duration ? Math.round((currentT / duration) * 100) : 0}
            onMouseDown={handleSeekMouseDown}
          >
            <div className="vp-progress__track">
              <div ref={fillRef}  className="vp-progress__fill"  style={{ width: '0%' }} />
              <div ref={thumbRef} className="vp-progress__thumb" style={{ left: '0%' }} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="vp-bar">
            {/* Left cluster */}
            <div className="vp-bar__left">

              {/* Volume — icon only, slider appears on hover */}
              <div
                className={`vp-volume ${showVol ? 'vp-volume--open' : ''}`}
                onMouseEnter={() => setShowVol(true)}
                onMouseLeave={() => setShowVol(false)}
              >
                <button
                  className="vp-btn vp-btn--icon"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon muted={muted} level={volume} />
                </button>
                <div className="vp-volume__slider">
                  <input
                    type="range"
                    min={0} max={1} step={0.02}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    className="vp-range"
                    aria-label="Volume"
                    style={{ '--vol-pct': `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="vp-time">
                {formatTime(currentT)}
                <span className="vp-time__sep">/</span>
                {formatTime(duration)}
              </span>
            </div>

            {/* Right cluster */}
            <div className="vp-bar__right">
              {/* Quality picker */}
              <div ref={qualityMenuRef} className="vp-qpick">
                <button
                  className="vp-btn vp-btn--icon"
                  onClick={() => setQualityOpen(o => !o)}
                  aria-label="Video quality"
                >
                  <IconQuality />
                  <span className="vp-qpick__label">{currentOption.label}</span>
                </button>
                {qualityOpen && (
                  <ul className="vp-qpick__menu" role="listbox" aria-label="Select quality">
                    {QUALITY_OPTIONS.map(opt => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={opt.value === quality}
                        className={`vp-qpick__item ${opt.value === quality ? 'vp-qpick__item--active' : ''}`}
                        onClick={() => switchQuality(opt.value)}
                      >
                        <span className="vp-qpick__check">{opt.value === quality ? '●' : ''}</span>
                        {opt.label}
                        {opt.value === 'auto' && <span className="vp-qpick__badge">Auto</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Fullscreen */}
              <button
                className="vp-btn vp-btn--icon"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <IconFullscreen active={fullscreen} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
