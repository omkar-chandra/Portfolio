import React, { FC, useState } from 'react';
import { getYouTubeId } from '../data';

/* ─── Poster play-button icons (only used before iframe loads) ──────────────── */
const IconPlay = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const IconRewind = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <path d="M2.5 8A9 9 0 1 1 3 16"/>
    <polyline points="2 3 2.5 8 7.5 7.5"/>
  </svg>
);

const IconFastForward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <path d="M21.5 8A9 9 0 1 0 21 16"/>
    <polyline points="22 3 21.5 8 16.5 7.5"/>
  </svg>
);

/* ─── YouTube helpers ──────────────────────────────────────────────────────── */
function buildYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeId(url);
  if (!id) return '';

  const params = new URLSearchParams({
    autoplay:       '1',
    controls:       '1',
    modestbranding: '1',
    rel:            '0',
    showinfo:       '0',
    iv_load_policy: '3',
    playsinline:    '1',
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function getYouTubePoster(url: string): string {
  const id = getYouTubeId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/* ─── Props ────────────────────────────────────────────────────────────────── */
interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  // Accepted for call-site compatibility; handled by YouTube's own player:
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  controlsList?: string;
  disablePictureInPicture?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ─── VideoPlayer ──────────────────────────────────────────────────────────── */
const VideoPlayer: FC<VideoPlayerProps> = ({ src, autoPlay, className, style }) => {
  const [started, setStarted] = useState(!!autoPlay);

  const poster   = getYouTubePoster(src);
  const embedUrl = buildYouTubeEmbedUrl(src);

  return (
    <div
      className={`vp-shell vp-shell--youtube ${className ?? ''}`}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {!started ? (
        /* Custom poster: portfolio play button, zero YouTube branding */
        <div
          className="vp-yt-poster"
          onClick={() => setStarted(true)}
          role="button"
          aria-label="Play video"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStarted(true); }
          }}
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

          {/* Three-button centre overlay matching existing portfolio design */}
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
        /* YouTube iframe */
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

export default VideoPlayer;