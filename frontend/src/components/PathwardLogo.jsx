export default function PathwardLogo({ size = "default", showText = true, className = "" }) {
  // size options: 'small' (24px icon), 'default' (32px icon), 'large' (44px icon)
  const iconSizes = {
    small: { width: 26, height: 26 },
    default: { width: 34, height: 34 },
    large: { width: 44, height: 44 },
  };

  const currentSize = iconSizes[size] || iconSizes.default;

  return (
    <div className={`pathward-brand-mark ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pathward-logo-svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="pw-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="pw-grad-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>
          <filter id="pw-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rounded Container with subtle border glow */}
        <rect
          x="1.5"
          y="1.5"
          width="37"
          height="37"
          rx="10"
          fill="rgba(19, 23, 34, 0.9)"
          stroke="url(#pw-grad-primary)"
          strokeWidth="1.5"
        />

        {/* Ambient Inner Grid / Glow Aura */}
        <circle cx="20" cy="20" r="12" fill="url(#pw-grad-glow)" opacity="0.15" />

        {/* Dynamic Forward Career Trajectory / Stellar Beacon Mark */}
        <path
          d="M12 28L19 13L26 21L30 11"
          stroke="url(#pw-grad-primary)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pw-glow-filter)"
        />

        {/* Orbital Focus Nodes */}
        <circle cx="12" cy="28" r="2.2" fill="#8b5cf6" />
        <circle cx="19" cy="13" r="2.2" fill="#6366f1" />
        <circle cx="26" cy="21" r="2.2" fill="#38bdf8" />
        <circle cx="30" cy="11" r="2.75" fill="#38bdf8" />

        {/* Compass Forward Arrow Head */}
        <path
          d="M24.5 11H30V16.5"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span className="brand-title" style={{ letterSpacing: "-0.03em", fontWeight: 800 }}>
          PATHWARD
        </span>
      )}
    </div>
  );
}
