import React, { FC, useState, useRef, useCallback } from 'react';
import {
  PlayIcon, PauseIcon, StepBackIcon, StepForwardIcon, ScissorsIcon,
  CursorPointerIcon, TypeIcon, VolumeHighIcon, VolumeMuteIcon,
  RotateCcwIcon, SlidersIcon, WaveformIcon, VideoCameraIcon, TrashIcon, CopyIcon, SplitViewIcon
} from './ServiceIcons';
import { HexColorPicker } from './HexColorPicker';

const VIDEO_URL = 'https://res.cloudinary.com/dlxlnvwuc/video/upload/v1788428375/Nezo_yt_5.mp4';

// Helper to format seconds into SMPTE timecode (HH:MM:SS:FF @ 30fps)
const formatTimecode = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
};

// Web Audio API synthesizer for instant SFX feedback without external files
const playSFX = (type: 'whoosh' | 'impact' | 'shutter' | 'click' | 'beep') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'impact') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'shutter') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(600, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // browser audio policy safety
  }
};

export interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  sourceStart: number;
  colorLabel?: string;
}

export interface TextOverlayClip {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  position: 'center' | 'lower-third' | 'subtitle' | 'top';
  color: string;
  fontSize: number;
}

export interface SFXClip {
  id: string;
  name: string;
  type: 'whoosh' | 'impact' | 'shutter' | 'click' | 'beep';
  time: number;
}

const DEFAULT_VIDEO_CLIPS: VideoClip[] = [
  {
    id: 'vclip-1',
    name: 'Nezo_Reel_Shot01.mp4',
    startTime: 0,
    duration: 4.8,
    sourceStart: 0,
    colorLabel: '#1e3a8a',
  },
  {
    id: 'vclip-2',
    name: 'Nezo_Reel_Shot02.mp4',
    startTime: 4.8,
    duration: 4.8,
    sourceStart: 4.8,
    colorLabel: '#1e40af',
  },
  {
    id: 'vclip-3',
    name: 'Nezo_Reel_Shot03.mp4',
    startTime: 9.6,
    duration: 5.6,
    sourceStart: 9.6,
    colorLabel: '#2563eb',
  },
];

const DEFAULT_TEXT_CLIPS: TextOverlayClip[] = [
  {
    id: 'text-clip-1',
    text: 'NEO DIRECTORS CUT // 4K',
    startTime: 1.0,
    duration: 8.0,
    position: 'lower-third',
    color: '#B3E32B',
    fontSize: 14,
  },
];

const DEFAULT_SFX_CLIPS: SFXClip[] = [
  { id: 'sfx-1', name: 'Whoosh', type: 'whoosh', time: 2.0 },
  { id: 'sfx-2', name: 'Impact', type: 'impact', time: 7.0 },
  { id: 'sfx-3', name: 'Shutter', type: 'shutter', time: 12.0 },
];

export const VideoEditorStudio: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15.2);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'razor' | 'text'>('select');

  // Video Cut Segments on V1
  const [videoClips, setVideoClips] = useState<VideoClip[]>(DEFAULT_VIDEO_CLIPS);
  // Text Clips on V2
  const [textClips, setTextClips] = useState<TextOverlayClip[]>(DEFAULT_TEXT_CLIPS);
  // SFX Clips on A2
  const [sfxClips, setSfxClips] = useState<SFXClip[]>(DEFAULT_SFX_CLIPS);

  // Selected Item: { type: 'video' | 'text' | 'sfx', id: string }
  const [selectedType, setSelectedType] = useState<'video' | 'text' | 'sfx'>('video');
  const [selectedId, setSelectedId] = useState<string>('vclip-1');

  // Video Transform & Display
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '21:9'>('16:9');
  const [zoomScale, setZoomScale] = useState(1);

  // Visual / Color Adjustments
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(112);
  const [saturation, setSaturation] = useState(115);
  const [hueRotate, setHueRotate] = useState(0);
  const [vignette, setVignette] = useState(25);

  // Inspector Tab
  const [editorTab, setEditorTab] = useState<'timeline' | 'fx' | 'audio'>('timeline');

  // Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (t >= duration) {
      videoRef.current.currentTime = 0;
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration || 15.2;
    setDuration(d);
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleStep = (stepSec: number) => {
    handleSeek(currentTime + stepSec);
  };

  // Timeline click scrubbing & razor cut
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickFraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(clickFraction * duration * 10) / 10;

    handleSeek(newTime);

    if (activeTool === 'razor') {
      splitClipAtTime(newTime);
      playSFX('shutter');
    }
  };

  // Razor Cut / Split Video Clip at current playhead or specified time
  const splitClipAtTime = (splitTime = currentTime) => {
    const target = videoClips.find(
      (c) => splitTime > c.startTime + 0.4 && splitTime < c.startTime + c.duration - 0.4
    );
    if (!target) return;

    const firstDuration = Math.round((splitTime - target.startTime) * 10) / 10;
    const secondDuration = Math.round((target.duration - firstDuration) * 10) / 10;

    const firstPart: VideoClip = {
      ...target,
      duration: firstDuration,
    };

    const secondPart: VideoClip = {
      id: `vclip-${Date.now()}`,
      name: `${target.name.replace(/\.mp4$/, '')}_split.mp4`,
      startTime: Math.round(splitTime * 10) / 10,
      duration: secondDuration,
      sourceStart: target.sourceStart + firstDuration,
      colorLabel: target.colorLabel,
    };

    setVideoClips((prev) => {
      const index = prev.findIndex((c) => c.id === target.id);
      const updated = [...prev];
      updated.splice(index, 1, firstPart, secondPart);
      return updated;
    });

    setSelectedType('video');
    setSelectedId(secondPart.id);
  };

  // Add new Text Clip
  const addTextClip = () => {
    const newClip: TextOverlayClip = {
      id: `text-${Date.now()}`,
      text: 'NEW TITLE OVERLAY',
      startTime: Math.max(0, Math.min(duration - 4, currentTime)),
      duration: 4.0,
      position: 'center',
      color: '#B3E32B',
      fontSize: 16,
    };
    setTextClips((prev) => [...prev, newClip]);
    setSelectedType('text');
    setSelectedId(newClip.id);
    setEditorTab('timeline');
    playSFX('beep');
  };

  // Delete video clip
  const deleteVideoClip = (id: string) => {
    if (videoClips.length <= 1) return; // Keep at least one clip
    setVideoClips((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(videoClips[0]?.id || '');
  };

  // Duplicate video clip
  const duplicateVideoClip = (id: string) => {
    const clip = videoClips.find((c) => c.id === id);
    if (!clip) return;
    const copy: VideoClip = {
      ...clip,
      id: `vclip-${Date.now()}`,
      name: `${clip.name} (Copy)`,
      startTime: Math.min(duration - clip.duration, clip.startTime + clip.duration),
    };
    setVideoClips((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // Delete text clip
  const deleteTextClip = (id: string) => {
    setTextClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      setSelectedType('video');
      setSelectedId(videoClips[0]?.id || '');
    }
  };

  // Duplicate text clip
  const duplicateTextClip = (id: string) => {
    const clip = textClips.find((c) => c.id === id);
    if (!clip) return;
    const copy: TextOverlayClip = {
      ...clip,
      id: `text-${Date.now()}`,
      startTime: Math.min(duration - clip.duration, clip.startTime + 2),
    };
    setTextClips((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // Add SFX
  const addSFXClip = (type: SFXClip['type'], name: string) => {
    const newSFX: SFXClip = {
      id: `sfx-${Date.now()}`,
      name,
      type,
      time: Math.round(currentTime * 10) / 10,
    };
    setSfxClips((prev) => [...prev, newSFX]);
    setSelectedType('sfx');
    setSelectedId(newSFX.id);
    playSFX(type);
  };

  // Delete SFX
  const deleteSFXClip = (id: string) => {
    setSfxClips((prev) => prev.filter((s) => s.id !== id));
  };

  // Duplicate SFX
  const duplicateSFXClip = (id: string) => {
    const sfx = sfxClips.find((s) => s.id === id);
    if (!sfx) return;
    const copy: SFXClip = {
      ...sfx,
      id: `sfx-${Date.now()}`,
      time: Math.min(duration, sfx.time + 1.5),
    };
    setSfxClips((prev) => [...prev, copy]);
    setSelectedId(copy.id);
    playSFX(copy.type);
  };

  // Reset All
  const handleResetAll = () => {
    setVideoClips(DEFAULT_VIDEO_CLIPS);
    setTextClips(DEFAULT_TEXT_CLIPS);
    setSfxClips(DEFAULT_SFX_CLIPS);
    setSelectedType('video');
    setSelectedId('vclip-1');
    setAspectRatio('16:9');
    setZoomScale(1);
    setBrightness(105);
    setContrast(112);
    setSaturation(115);
    setHueRotate(0);
    setVignette(25);
    setPlaybackRate(1);
    setActiveTool('select');
    handleSeek(0);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  };

  // Find active visible text clip
  const activeText = textClips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  // Selected items
  const selectedVideo = selectedType === 'video' ? videoClips.find((c) => c.id === selectedId) : null;
  const selectedText = selectedType === 'text' ? textClips.find((c) => c.id === selectedId) : null;

  return (
    <div className="video-studio">
      {/* Studio Topbar */}
      <div className="studio-topbar">
        <div className="studio-topbar__left">
          <div className="studio-window-dots" aria-hidden="true">
            <span className="dot dot--lime" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <span className="studio-doc-title">Project: Nezo_Cinema_Reel.prproj</span>
          <span className="studio-canvas-scale">Program Monitor 4K</span>
        </div>

        <div className="studio-topbar__center">
          <div className="timecode-display">
            <span className="timecode-current">{formatTimecode(currentTime)}</span>
            <span className="timecode-divider">/</span>
            <span className="timecode-duration">{formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="studio-topbar__right">
          <button
            type="button"
            className="studio-action-btn"
            onClick={handleResetAll}
            title="Reset Timeline and Clips to Default"
          >
            <RotateCcwIcon size={13} />
            <span>Reset Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Monitor + Inspector */}
      <div className="video-studio__workspace">
        {/* Left Toolbar */}
        <div className="video-studio__toolbar">
          <button
            type="button"
            className={`tool-btn ${activeTool === 'select' ? 'tool-btn--active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Selection Tool (V)"
          >
            <CursorPointerIcon size={16} />
          </button>

          <button
            type="button"
            className={`tool-btn ${activeTool === 'razor' ? 'tool-btn--active' : ''}`}
            onClick={() => setActiveTool(activeTool === 'razor' ? 'select' : 'razor')}
            title="Razor Tool (C) - Split Video Clip"
          >
            <ScissorsIcon size={16} />
          </button>

          <button
            type="button"
            className="tool-btn"
            onClick={addTextClip}
            title="Add Text Layer (T)"
          >
            <TypeIcon size={16} />
          </button>

          <div className="tool-btn-divider" />

          <button
            type="button"
            className="tool-btn"
            onClick={() => splitClipAtTime(currentTime)}
            title="Split Active Clip at Playhead"
          >
            <SplitViewIcon size={15} />
          </button>
        </div>

        {/* Center Video Monitor Stage */}
        <div className="video-monitor-stage">
          <div className={`video-viewport video-viewport--${aspectRatio.replace(':', '-')}`}>
            <video
              ref={videoRef}
              src={VIDEO_URL}
              className="video-element"
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              style={{
                transform: `scale(${zoomScale})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg)`,
              }}
            />

            {/* Vignette Overlay */}
            {vignette > 0 && (
              <div
                className="video-vignette-overlay"
                style={{ opacity: vignette / 100 }}
                aria-hidden="true"
              />
            )}

            {/* Active Live Text Overlay */}
            {activeText && (
              <div className={`video-text-overlay video-text-overlay--${activeText.position}`}>
                <span
                  className="overlay-content-span"
                  style={{
                    color: activeText.color,
                    fontSize: `${activeText.fontSize}px`,
                    textShadow: `0 2px 10px rgba(0,0,0,0.8), 0 0 20px ${activeText.color}40`,
                  }}
                >
                  {activeText.text}
                </span>
              </div>
            )}

            {/* Big Play Overlay Icon when Paused */}
            {!isPlaying && (
              <button
                type="button"
                className="video-play-center-btn"
                onClick={togglePlay}
                aria-label="Play Video"
              >
                <PlayIcon size={32} />
              </button>
            )}
          </div>

          {/* Transport Bar Controls under Monitor */}
          <div className="video-transport-bar">
            <div className="transport-controls">
              <button
                type="button"
                className="transport-btn"
                onClick={() => handleStep(-1)}
                title="Step Back 1s (J)"
              >
                <StepBackIcon size={15} />
              </button>

              <button
                type="button"
                className="transport-btn transport-btn--play"
                onClick={togglePlay}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              </button>

              <button
                type="button"
                className="transport-btn"
                onClick={() => handleStep(1)}
                title="Step Forward 1s (L)"
              >
                <StepForwardIcon size={15} />
              </button>
            </div>

            {/* Playback Speed Multipliers */}
            <div className="transport-speed-group">
              <span className="transport-label">Speed:</span>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`speed-pill ${playbackRate === s ? 'is-active' : ''}`}
                  onClick={() => {
                    setPlaybackRate(s);
                    if (videoRef.current) videoRef.current.playbackRate = s;
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Audio Volume & Mute */}
            <div className="transport-volume-group">
              <button
                type="button"
                className="transport-icon-btn"
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (videoRef.current) videoRef.current.muted = nextMuted;
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeMuteIcon size={15} /> : <VolumeHighIcon size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = val === 0;
                  }
                }}
                className="transport-vol-slider"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>

        {/* Right Inspector Panel */}
        <aside className="design-inspector">
          <div className="inspector-tabs">
            <button
              type="button"
              className={`inspector-tab ${editorTab === 'timeline' ? 'is-active' : ''}`}
              onClick={() => setEditorTab('timeline')}
            >
              <TypeIcon size={13} />
              <span>Clips & Layers</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${editorTab === 'fx' ? 'is-active' : ''}`}
              onClick={() => setEditorTab('fx')}
            >
              <SlidersIcon size={13} />
              <span>Color & Frame</span>
            </button>
            <button
              type="button"
              className={`inspector-tab ${editorTab === 'audio' ? 'is-active' : ''}`}
              onClick={() => setEditorTab('audio')}
            >
              <WaveformIcon size={13} />
              <span>Audio SFX</span>
            </button>
          </div>

          <div className="inspector-body">
            {/* TAB 1: Timeline Layers (Selected Video or Text clip) */}
            {editorTab === 'timeline' && (
              <div className="inspector-group">
                {selectedType === 'video' && selectedVideo && (
                  <>
                    <div className="inspector-section-header">
                      <div className="inspector-header-left">
                        <span className="inspector-selected-tag">V1 VIDEO</span>
                        <span className="inspector-selected-name">{selectedVideo.name}</span>
                      </div>
                      <div className="inspector-header-actions">
                        <button
                          type="button"
                          className="inspector-action-icon-btn"
                          onClick={() => duplicateVideoClip(selectedVideo.id)}
                          title="Duplicate Clip"
                        >
                          <CopyIcon size={13} />
                        </button>
                        <button
                          type="button"
                          className="inspector-action-icon-btn inspector-action-icon-btn--danger"
                          onClick={() => deleteVideoClip(selectedVideo.id)}
                          disabled={videoClips.length <= 1}
                          title="Delete Clip"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="control-row">
                      <label className="control-label">Clip Label</label>
                      <input
                        type="text"
                        className="studio-input"
                        value={selectedVideo.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVideoClips((prev) =>
                            prev.map((c) => (c.id === selectedVideo.id ? { ...c, name: val } : c))
                          );
                        }}
                      />
                    </div>

                    <div className="control-grid-2">
                      <div className="control-col">
                        <label className="control-label">Start Time ({selectedVideo.startTime.toFixed(1)}s)</label>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(0, duration - 1)}
                          step="0.1"
                          value={selectedVideo.startTime}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVideoClips((prev) =>
                              prev.map((c) => (c.id === selectedVideo.id ? { ...c, startTime: val } : c))
                            );
                          }}
                          className="studio-slider"
                        />
                      </div>

                      <div className="control-col">
                        <label className="control-label">Duration ({selectedVideo.duration.toFixed(1)}s)</label>
                        <input
                          type="range"
                          min="0.5"
                          max="15.2"
                          step="0.1"
                          value={selectedVideo.duration}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVideoClips((prev) =>
                              prev.map((c) => (c.id === selectedVideo.id ? { ...c, duration: val } : c))
                            );
                          }}
                          className="studio-slider"
                        />
                      </div>
                    </div>

                    <div className="control-row" style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="studio-action-btn studio-action-btn--highlight"
                        onClick={() => splitClipAtTime(currentTime)}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <ScissorsIcon size={13} />
                        <span>Split Clip at Playhead ({currentTime.toFixed(1)}s)</span>
                      </button>
                    </div>
                  </>
                )}

                {selectedType === 'text' && selectedText && (
                  <>
                    <div className="inspector-section-header">
                      <div className="inspector-header-left">
                        <span className="inspector-selected-tag">V2 TEXT</span>
                        <span className="inspector-selected-name">{selectedText.text}</span>
                      </div>
                      <div className="inspector-header-actions">
                        <button
                          type="button"
                          className="inspector-action-icon-btn"
                          onClick={() => duplicateTextClip(selectedText.id)}
                          title="Duplicate Text Clip"
                        >
                          <CopyIcon size={13} />
                        </button>
                        <button
                          type="button"
                          className="inspector-action-icon-btn inspector-action-icon-btn--danger"
                          onClick={() => deleteTextClip(selectedText.id)}
                          title="Delete Text Clip"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="control-row">
                      <label className="control-label">Overlay Content</label>
                      <input
                        type="text"
                        className="studio-input"
                        value={selectedText.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTextClips((prev) =>
                            prev.map((c) => (c.id === selectedText.id ? { ...c, text: val } : c))
                          );
                        }}
                      />
                    </div>

                    <div className="control-row">
                      <label className="control-label">Screen Position</label>
                      <div className="control-btn-group">
                        {(['lower-third', 'subtitle', 'center', 'top'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            className={`mini-btn ${selectedText.position === pos ? 'is-active' : ''}`}
                            onClick={() => {
                              setTextClips((prev) =>
                                prev.map((c) => (c.id === selectedText.id ? { ...c, position: pos } : c))
                              );
                            }}
                          >
                            {pos.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="control-grid-2">
                      <div className="control-col">
                        <label className="control-label">Start Time ({selectedText.startTime.toFixed(1)}s)</label>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(0, duration - 1)}
                          step="0.5"
                          value={selectedText.startTime}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTextClips((prev) =>
                              prev.map((c) => (c.id === selectedText.id ? { ...c, startTime: val } : c))
                            );
                          }}
                          className="studio-slider"
                        />
                      </div>

                      <div className="control-col">
                        <label className="control-label">Duration ({selectedText.duration.toFixed(1)}s)</label>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          step="0.5"
                          value={selectedText.duration}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTextClips((prev) =>
                              prev.map((c) => (c.id === selectedText.id ? { ...c, duration: val } : c))
                            );
                          }}
                          className="studio-slider"
                        />
                      </div>
                    </div>

                    <HexColorPicker
                      label="Overlay Color"
                      value={selectedText.color}
                      onChange={(col) => {
                        setTextClips((prev) =>
                          prev.map((c) => (c.id === selectedText.id ? { ...c, color: col } : c))
                        );
                      }}
                      defaultValue="#B3E32B"
                    />
                  </>
                )}

                {/* Layer Stacks List */}
                <div className="layers-list" style={{ marginTop: '14px' }}>
                  <div className="control-header-row">
                    <label className="control-label">Video Clips ({videoClips.length})</label>
                  </div>
                  {videoClips.map((c) => (
                    <div
                      key={c.id}
                      className={`layer-item ${selectedType === 'video' && selectedId === c.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedType('video');
                        setSelectedId(c.id);
                      }}
                    >
                      <VideoCameraIcon size={12} />
                      <span className="layer-item__name">{c.name}</span>
                      <span className="track-time-tag">
                        {c.startTime.toFixed(1)}s - {(c.startTime + c.duration).toFixed(1)}s
                      </span>
                    </div>
                  ))}

                  <div className="control-header-row" style={{ marginTop: '8px' }}>
                    <label className="control-label">Text Overlay Clips ({textClips.length})</label>
                    <button
                      type="button"
                      className="mini-text-btn"
                      onClick={addTextClip}
                    >
                      + Add Text
                    </button>
                  </div>
                  {textClips.map((c) => (
                    <div
                      key={c.id}
                      className={`layer-item ${selectedType === 'text' && selectedId === c.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedType('text');
                        setSelectedId(c.id);
                      }}
                    >
                      <TypeIcon size={12} />
                      <span className="layer-item__name">{c.text}</span>
                      <span className="track-time-tag">
                        {c.startTime.toFixed(1)}s - {(c.startTime + c.duration).toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Color & Crop */}
            {editorTab === 'fx' && (
              <div className="inspector-group">
                <div className="control-row">
                  <label className="control-label">Aspect Ratio Frame</label>
                  <div className="control-btn-group">
                    {(['9:16', '16:9', '1:1', '21:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        className={`mini-btn ${aspectRatio === ratio ? 'is-active' : ''}`}
                        onClick={() => setAspectRatio(ratio)}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-row">
                  <label className="control-label">Zoom / Scale ({Math.round(zoomScale * 100)}%)</label>
                  <input
                    type="range"
                    min="1"
                    max="1.5"
                    step="0.05"
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                    className="studio-slider"
                  />
                </div>

                <div className="control-grid-2">
                  <div className="control-col">
                    <label className="control-label">Brightness ({brightness}%)</label>
                    <input
                      type="range"
                      min="60"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="studio-slider"
                    />
                  </div>
                  <div className="control-col">
                    <label className="control-label">Contrast ({contrast}%)</label>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
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

                <div className="control-row">
                  <label className="control-label">Hue Shift ({hueRotate}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hueRotate}
                    onChange={(e) => setHueRotate(Number(e.target.value))}
                    className="studio-slider"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Audio SFX Library & Layers */}
            {editorTab === 'audio' && (
              <div className="inspector-group">
                <div className="control-row">
                  <label className="control-label">Add Sound Effect @ Playhead ({currentTime.toFixed(1)}s)</label>
                  <div className="sfx-grid">
                    {[
                      { name: 'Fast Whoosh', type: 'whoosh' as const },
                      { name: 'Sub Bass Impact', type: 'impact' as const },
                      { name: 'Shutter Cut', type: 'shutter' as const },
                      { name: 'Film Beep', type: 'beep' as const },
                    ].map((sfx) => (
                      <button
                        key={sfx.name}
                        type="button"
                        className="sfx-pad-btn"
                        onClick={() => addSFXClip(sfx.type, sfx.name)}
                      >
                        <span className="sfx-pad-name">+ {sfx.name}</span>
                        <span className="sfx-pad-tag">Trigger</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="layers-list" style={{ marginTop: '10px' }}>
                  <label className="control-label">Timeline SFX Clips ({sfxClips.length})</label>
                  {sfxClips.map((s) => (
                    <div
                      key={s.id}
                      className={`layer-item ${selectedType === 'sfx' && selectedId === s.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedType('sfx');
                        setSelectedId(s.id);
                        handleSeek(s.time);
                        playSFX(s.type);
                      }}
                    >
                      <WaveformIcon size={12} />
                      <span className="layer-item__name">{s.name}</span>
                      <span className="track-time-tag">@{s.time.toFixed(1)}s</span>
                      <div className="layer-item__tools">
                        <button
                          type="button"
                          className="layer-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSFXClip(s.id);
                          }}
                          title="Duplicate SFX"
                        >
                          <CopyIcon size={11} />
                        </button>
                        <button
                          type="button"
                          className="layer-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSFXClip(s.id);
                          }}
                          title="Delete SFX"
                        >
                          <TrashIcon size={11} />
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

      {/* Bottom Timeline (Premiere Multitrack) */}
      <div className="video-timeline-area">
        <div className="timeline-header-bar">
          <div className="timeline-track-label">Sequence 01 // Master Multitrack Timeline</div>
          <div className="timeline-hint">
            {activeTool === 'razor'
              ? '✂ Razor active: Click any clip to split at cursor'
              : 'Click & drag timeline to scrub position'}
          </div>
        </div>

        <div
          ref={timelineRef}
          className="timeline-track-container"
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <div className="timeline-ruler">
            {[0, 3, 6, 9, 12, 15].filter(sec => sec <= duration).map((sec) => (
              <span
                key={sec}
                className="timeline-tick"
                style={{ left: `${(sec / duration) * 100}%` }}
              >
                {sec === 0 ? '0s' : `${sec}s`}
              </span>
            ))}
          </div>

          {/* Multitrack Stack */}
          <div className="timeline-tracks">
            {/* V2: Text Overlay Track */}
            <div className="timeline-row timeline-row--v2">
              <span className="track-id">V2 [TEXT]</span>
              <div className="track-clip-container">
                {textClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`track-clip track-clip--text ${selectedType === 'text' && selectedId === clip.id ? 'is-active' : ''}`}
                    style={{
                      left: `${(clip.startTime / duration) * 100}%`,
                      width: `${(clip.duration / duration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType('text');
                      setSelectedId(clip.id);
                      setEditorTab('timeline');
                    }}
                  >
                    <TypeIcon size={12} />
                    <span className="track-clip-title">{clip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* V1: Master Video Track with Real Split Clips (Fix for Screenshot 2) */}
            <div className="timeline-row timeline-row--v1">
              <span className="track-id">V1 [VIDEO]</span>
              <div className="track-clip-container">
                {videoClips.map((vClip) => (
                  <div
                    key={vClip.id}
                    className={`track-clip track-clip--video track-clip--segment ${selectedType === 'video' && selectedId === vClip.id ? 'is-active' : ''}`}
                    style={{
                      left: `${(vClip.startTime / duration) * 100}%`,
                      width: `${(vClip.duration / duration) * 100}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeTool === 'razor') {
                        // Calculate local click position to split
                        const rect = e.currentTarget.getBoundingClientRect();
                        const localX = e.clientX - rect.left;
                        const localFraction = localX / rect.width;
                        const splitSec = vClip.startTime + localFraction * vClip.duration;
                        splitClipAtTime(splitSec);
                        playSFX('shutter');
                      } else {
                        setSelectedType('video');
                        setSelectedId(vClip.id);
                        setEditorTab('timeline');
                      }
                    }}
                    title={`${vClip.name} (${vClip.startTime.toFixed(1)}s - ${(vClip.startTime + vClip.duration).toFixed(1)}s)`}
                  >
                    <span className="track-clip-edge-handle track-clip-edge-handle--left" />
                    <VideoCameraIcon size={12} />
                    <span className="track-clip-title">{vClip.name}</span>
                    <span className="track-clip-edge-handle track-clip-edge-handle--right" />
                  </div>
                ))}
              </div>
            </div>

            {/* A1: Audio Waveform Track */}
            <div className="timeline-row timeline-row--a1">
              <span className="track-id">A1 [AUDIO]</span>
              <div className="track-clip-container">
                <div className="track-clip track-clip--audio" style={{ left: '0%', width: '100%' }}>
                  <WaveformIcon size={14} className="timeline-waveform-svg" />
                  <span className="track-clip-title">Master 48kHz 24-Bit Stereo Mix</span>
                </div>
              </div>
            </div>

            {/* A2: SFX Trigger Track */}
            <div className="timeline-row timeline-row--a2">
              <span className="track-id">A2 [SFX]</span>
              <div className="track-clip-container">
                {sfxClips.map((s) => (
                  <div
                    key={s.id}
                    className={`track-sfx-pill ${selectedType === 'sfx' && selectedId === s.id ? 'is-active' : ''}`}
                    style={{ left: `${(s.time / duration) * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType('sfx');
                      setSelectedId(s.id);
                      playSFX(s.type);
                    }}
                    title={`${s.name} at ${s.time.toFixed(1)}s`}
                  >
                    <span className="sfx-dot" />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Playhead Indicator */}
          <div
            className="timeline-playhead"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="playhead-handle" />
            <div className="playhead-line" />
          </div>
        </div>
      </div>
    </div>
  );
};
