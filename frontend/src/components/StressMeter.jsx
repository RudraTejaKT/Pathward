import { useState, useEffect, useRef } from "react";
import "./StressMeter.css";

export default function StressMeter() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale"); // Inhale (4s), Hold (4s), Exhale (4s), Hold (4s)
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [stressReduction, setStressReduction] = useState(0);

  // Track session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track user activity (clicks, keys, scrolls)
  useEffect(() => {
    function handleActivity() {
      setInteractionCount((prev) => prev + 1);
      setLastInteractionTime(Date.now());
    }

    window.addEventListener("click", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("scroll", handleActivity, { passive: true });

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, []);

  // Calculate dynamic stress index (0 to 100)
  // Continuous session minutes + interaction intensity minus break reductions
  const sessionMinutes = sessionSeconds / 60;
  const rawStress = Math.min(
    100,
    Math.max(
      5,
      Math.round(
        sessionMinutes * 1.6 +
          Math.min(30, (interactionCount / (sessionMinutes + 1)) * 0.8) -
          stressReduction
      )
    )
  );

  const stressScore = Math.min(100, Math.max(0, rawStress));

  // Determine stress classification
  let levelInfo = {
    label: "Optimal Flow",
    color: "#22c55e",
    glowClass: "stress-glow--emerald",
    desc: "Brain state is calm and receptive. High comprehension rate.",
    recommendation: "Maintain posture and keep a water bottle nearby.",
  };

  if (stressScore > 75) {
    levelInfo = {
      label: "Critical Burnout",
      color: "#ff5252",
      glowClass: "stress-glow--red",
      desc: "Sustained focus threshold exceeded. Cognitive fatigue detected.",
      recommendation: "Take an immediate 5-10 minute break. Rest your eyes!",
    };
  } else if (stressScore > 50) {
    levelInfo = {
      label: "Elevated Load",
      color: "#fde047",
      glowClass: "stress-glow--amber",
      desc: "Mental saturation rising. Information retention may decline.",
      recommendation: "Try a 60-second breathing exercise below or hydrate.",
    };
  } else if (stressScore > 25) {
    levelInfo = {
      label: "Active Focus",
      color: "#47d6ff",
      glowClass: "stress-glow--cyan",
      desc: "Steady engagement and active concept processing.",
      recommendation: "Practice 20-20-20 rule (look 20ft away for 20s).",
    };
  }

  // Guided breathing cycle logic
  useEffect(() => {
    if (!isBreathingMode) return;
    const interval = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev > 1) return prev - 1;
        // Phase transition
        setBreathPhase((currPhase) => {
          if (currPhase === "Inhale") return "Hold";
          if (currPhase === "Hold") return "Exhale";
          if (currPhase === "Exhale") return "Rest";
          // One full box cycle completed -> reduce stress!
          setStressReduction((r) => r + 8);
          return "Inhale";
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingMode]);

  function handleResetBreak() {
    setStressReduction((prev) => prev + 35);
    setIsBreathingMode(false);
  }

  // Format time mm:ss or hh:mm:ss
  const mins = Math.floor(sessionSeconds / 60);
  const secs = sessionSeconds % 60;
  const timeFormatted = `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;

  // Calculate needle rotation (-90deg to +90deg for 180deg arc gauge)
  const needleRotation = -90 + (stressScore / 100) * 180;

  return (
    <>
      {/* Floating Compact Telemetry Badge (Bottom Right) */}
      <aside aria-label="Cognitive load and stress monitor" className="stress-floating-trigger">
        <button
          type="button"
          className={`stress-trigger-btn ${levelInfo.glowClass}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Cognitive Stress & Focus Telemetry Meter"
        >
          <div className="trigger-pulse-ring" />
          <span className="material-symbols-outlined trigger-icon">ecg_heart</span>
          <div className="trigger-text-group">
            <span className="trigger-num mono">{stressScore}%</span>
            <span className="trigger-label mono">{levelInfo.label}</span>
          </div>
        </button>
      </aside>

      {/* Expanded Interactive Stress Analysis Modal / Card */}
      {isOpen && (
        <div className="stress-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="stress-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="stress-card-header">
              <div className="header-left">
                <span className="material-symbols-outlined header-icon">monitor_heart</span>
                <div>
                  <h3 className="header-title">Cognitive Load &amp; Stress Meter</h3>
                  <span className="header-sub mono text-xs">Real-Time Study Biometrics</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)} title="Close Meter">
                ✕
              </button>
            </div>

            {/* Radial Speedometer Gauge */}
            <div className="gauge-viewport">
              <svg className="gauge-svg" viewBox="0 0 200 115">
                {/* Background Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="rgba(71, 69, 82, 0.4)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Colorful Gradient Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (stressScore / 100) * 251.2}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="40%" stopColor="#47d6ff" />
                    <stop offset="70%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#ff5252" />
                  </linearGradient>
                </defs>

                {/* Gauge Needle */}
                <g
                  transform={`translate(100, 100) rotate(${needleRotation})`}
                  style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <polygon points="-3,-5 0,-76 3,-5" fill={levelInfo.color} />
                  <circle cx="0" cy="0" r="7" fill={levelInfo.color} />
                  <circle cx="0" cy="0" r="3" fill="#10131a" />
                </g>
              </svg>

              <div className="gauge-digital-hud">
                <span className="gauge-score mono" style={{ color: levelInfo.color }}>
                  {stressScore}%
                </span>
                <span className="gauge-status-badge mono" style={{ backgroundColor: `${levelInfo.color}25`, color: levelInfo.color, borderColor: levelInfo.color }}>
                  {levelInfo.label.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Diagnostic Details */}
            <div className="stress-diagnostics-box">
              <div className="diag-row">
                <span className="mono text-xs text-muted">TIME ON PLATFORM:</span>
                <strong className="mono text-sm">{timeFormatted}</strong>
              </div>
              <div className="diag-row">
                <span className="mono text-xs text-muted">INTERACTION DENSITY:</span>
                <strong className="mono text-sm">{interactionCount} actions</strong>
              </div>
              <div className="diag-row">
                <span className="mono text-xs text-muted">FATIGUE INDEX:</span>
                <strong className="mono text-sm" style={{ color: levelInfo.color }}>
                  {stressScore > 75 ? "High (Alert)" : stressScore > 50 ? "Moderate" : "Low (Optimal)"}
                </strong>
              </div>
            </div>

            {/* Status Recommendation */}
            <div className="recommendation-box">
              <div className="rec-header">
                <span className="material-symbols-outlined" style={{ color: levelInfo.color }}>
                  info
                </span>
                <strong>Telemetry Analysis</strong>
              </div>
              <p className="rec-desc">{levelInfo.desc}</p>
              <p className="rec-action">💡 <strong>Tip:</strong> {levelInfo.recommendation}</p>
            </div>

            {/* Guided Breathing Tool */}
            {isBreathingMode ? (
              <div className="breathing-tool-box">
                <div className={`breathing-circle ${breathPhase.toLowerCase()}`}>
                  <span className="phase-text mono">{breathPhase}</span>
                  <span className="count-text mono">{breathCountdown}s</span>
                </div>
                <p className="breathing-hint mono text-xs">
                  Box Breathing: Inhale 4s → Hold 4s → Exhale 4s → Rest 4s
                </p>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary w-full"
                  onClick={() => setIsBreathingMode(false)}
                >
                  Done Breathing
                </button>
              </div>
            ) : (
              <div className="stress-actions-row">
                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary stress-action-btn"
                  onClick={() => setIsBreathingMode(true)}
                >
                  🧘 60s Guided Breathing
                </button>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary stress-action-btn"
                  onClick={handleResetBreak}
                >
                  ☕ Took a Break
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
