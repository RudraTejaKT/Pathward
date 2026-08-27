export default function BackloxLogo({ size = "default", showText = true, className = "" }) {
  // size options: 'small', 'default', 'large', 'hero'
  const sizeMap = {
    small: { iconWidth: 26, iconHeight: 26, fontSize: 17, capWidth: 20 },
    default: { iconWidth: 34, iconHeight: 34, fontSize: 22, capWidth: 26 },
    large: { iconWidth: 44, iconHeight: 44, fontSize: 28, capWidth: 34 },
    hero: { iconWidth: 56, iconHeight: 56, fontSize: 36, capWidth: 44 },
  };

  const current = sizeMap[size] || sizeMap.default;

  return (
    <div
      className={`backlox-brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: showText ? "8px" : "0px",
        textDecoration: "none",
        userSelect: "none",
        lineHeight: 1,
      }}
    >
      {/* 1. Graduate Cap + Letter B Stylized Lockup SVG */}
      <svg
        width={showText ? current.capWidth : current.iconWidth}
        height={showText ? current.capWidth : current.iconHeight}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="backlox-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="backlox-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Graduation Cap (Mortarboard Top Diamond) */}
        <path
          d="M6 18L24 8L42 18L24 28L6 18Z"
          fill="currentColor"
          className="backlox-cap-mortarboard"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
        />

        {/* Cap Skull Under-Cap */}
        <path
          d="M14 22.5V30C14 34.5 24 37 24 37C24 37 34 34.5 34 30V22.5"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cap Button / Rivet */}
        <circle cx="24" cy="18" r="2.5" fill="url(#backlox-grad)" />

        {/* Tassel Ribbon & Hanging Brush */}
        <path
          d="M9 19.5V31.5"
          stroke="url(#backlox-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M6.5 31.5H11.5L10 39H8L6.5 31.5Z"
          fill="url(#backlox-grad)"
        />
      </svg>

      {/* 2. Bold Geometric BACKLOX Wordmark */}
      {showText && (
        <span
          className="backlox-wordmark"
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 900,
            fontSize: `${current.fontSize}px`,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            display: "inline-block",
            color: "var(--on-surface, #ffffff)",
          }}
        >
          BACKLOX
        </span>
      )}
    </div>
  );
}
