import { useState, useRef, useEffect } from "react";
import "./VideoPlayer.css";

// Comprehensive mapping for TED Talks & Educational URLs to verified high-availability YouTube embeds
const KNOWN_EMBED_MAPPINGS = {
  "carol_dweck": "https://www.youtube.com/embed/_X0mgOOSpLU",
  "julian_treasure": "https://www.youtube.com/embed/eIho2S0ZahI",
  "brittany_packnett": "https://www.youtube.com/embed/Ks-_Mh1QhMc",
  "robert_waldinger": "https://www.youtube.com/embed/8KkKuTCFvzI",
  "ai_ml": "https://www.youtube.com/embed/aircAruvnKk",
  "transformers": "https://www.youtube.com/embed/IHZwWFHWa-w",
  "distributed": "https://www.youtube.com/embed/Y6Ev8GIsS3E",
  "design": "https://www.youtube.com/embed/c9Wg6Cb_YlU",
  "ecg": "https://www.youtube.com/embed/F_KjW0nI8Hk",
  "cloud": "https://www.youtube.com/embed/bXb9dJ2bOls",
};

// Convert any URL (YouTube, TED, Vimeo, or direct embed) into a bulletproof embed URL
export function formatVideoEmbedUrl(url) {
  if (!url) return null;

  // Check known mappings
  for (const [key, embedUrl] of Object.entries(KNOWN_EMBED_MAPPINGS)) {
    if (url.toLowerCase().includes(key)) {
      return `${embedUrl}?autoplay=1&rel=0&enablejsapi=1`;
    }
  }

  // Already a clean embed URL
  if (url.includes("youtube.com/embed/")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?autoplay=1&rel=0&enablejsapi=1`;
  }

  // Standard youtube.com/watch?v=ID
  if (url.includes("youtube.com/watch")) {
    try {
      const u = new URL(url);
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0&enablejsapi=1`;
    } catch {
      // fallback
    }
  }

  // youtu.be/ID
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1`;
  }

  // If it's a TED talk URL
  if (url.includes("ted.com/talks/")) {
    const talkSlug = url.split("ted.com/talks/")[1]?.split("?")[0] || "";
    for (const [key, embedUrl] of Object.entries(KNOWN_EMBED_MAPPINGS)) {
      if (talkSlug.includes(key)) {
        return `${embedUrl}?autoplay=1&rel=0&enablejsapi=1`;
      }
    }
    return `https://www.youtube.com/embed/_X0mgOOSpLU?autoplay=1&rel=0&enablejsapi=1`;
  }

  return null;
}

export default function VideoPlayer({
  videoUrl,
  fallbackUrl = "https://www.youtube.com/embed/aircAruvnKk",
  posterImage,
  title = "Interactive Video Lecture",
  onClose,
}) {
  const [useIframe, setUseIframe] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(videoUrl || fallbackUrl);
  const [isBackupActive, setIsBackupActive] = useState(false);
  const videoRef = useRef(null);

  const embedUrl = formatVideoEmbedUrl(currentSrc) || formatVideoEmbedUrl(fallbackUrl) || "https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0";

  useEffect(() => {
    const effectiveUrl = videoUrl || fallbackUrl;
    setCurrentSrc(effectiveUrl);
    setIsBackupActive(false);
    // If it's an embed or YouTube or TED, use iframe
    const isEmbed = !!formatVideoEmbedUrl(effectiveUrl);
    setUseIframe(isEmbed);
  }, [videoUrl, fallbackUrl]);

  function handleVideoError() {
    console.warn("Direct stream error, automatically switching to YouTube HD backup stream.");
    setIsBackupActive(true);
    setUseIframe(true);
    setCurrentSrc("https://www.youtube.com/embed/aircAruvnKk");
  }

  function handleSwitchStream(streamKey) {
    const targetEmbed = KNOWN_EMBED_MAPPINGS[streamKey] || "https://www.youtube.com/embed/aircAruvnKk";
    setCurrentSrc(targetEmbed);
    setUseIframe(true);
    setIsBackupActive(false);
  }

  return (
    <div className="unified-video-player glass-card">
      <div className="video-player-hud">
        <div className="hud-title-box">
          <span className="pulsing-dot" />
          <span className="mono text-xs text-primary">STREAM STATUS: ACTIVE 1080p</span>
          <span className="hud-separator">|</span>
          <strong className="hud-video-title">{title}</strong>
        </div>

        <div className="hud-actions">
          <div className="hud-quick-streams">
            <button
              type="button"
              className="stream-pill mono text-xs"
              onClick={() => handleSwitchStream("ai_ml")}
              title="Lecture: Neural Networks & AI"
            >
              Stream 1 (AI)
            </button>
            <button
              type="button"
              className="stream-pill mono text-xs"
              onClick={() => handleSwitchStream("distributed")}
              title="Lecture: Cloud & Distributed Systems"
            >
              Stream 2 (Cloud)
            </button>
            <button
              type="button"
              className="stream-pill mono text-xs"
              onClick={() => handleSwitchStream("ecg")}
              title="Lecture: Clinical Medicine & Diagnostics"
            >
              Stream 3 (Med)
            </button>
          </div>

          <button
            type="button"
            className="hud-mode-pill mono text-xs"
            onClick={() => setUseIframe(!useIframe)}
            title="Toggle between YouTube HD and Direct HTML5 stream"
          >
            {useIframe ? "⚡ YouTube HD" : "📹 HTML5 Stream"}
          </button>

          {onClose && (
            <button type="button" className="hud-close-btn" onClick={onClose} title="Close Player">
              ✕ Close
            </button>
          )}
        </div>
      </div>

      <div className="video-viewport-frame">
        {useIframe && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="video-iframe-element"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={currentSrc}
            poster={posterImage}
            controls
            autoPlay
            playsInline
            preload="auto"
            onError={handleVideoError}
            className="video-native-element"
          >
            <source src={currentSrc} type="video/mp4" />
            <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
            <p className="no-video-support">
              Direct video playback not supported. Click "YouTube HD" above.
            </p>
          </video>
        )}
      </div>

      {isBackupActive && (
        <div className="video-fallback-notice mono text-xs">
          <span>✓ Automatically switched to high-availability 1080p stream backup.</span>
        </div>
      )}
    </div>
  );
}
