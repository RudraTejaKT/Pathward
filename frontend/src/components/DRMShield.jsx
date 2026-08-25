import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "./DRMShield.css";

export default function DRMShield({ children, enabled = true, showWatermark = true }) {
  const { user } = useAuth();
  const [warningMessage, setWarningMessage] = useState(null);
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });

  // Floating Watermark Animation to deter physical & software recording
  useEffect(() => {
    if (!showWatermark) return;
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70) + 15;
      const randomLeft = Math.floor(Math.random() * 70) + 15;
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 12000);
    return () => clearInterval(interval);
  }, [showWatermark]);

  // Prohibit screen-grab, devtools, inspect, print, and save commands
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e) {
      // 1. PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        triggerAlert("🔒 Screen capture is prohibited under Patent & Copyright Protection.");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(""); // clear clipboard
        }
        return false;
      }

      // 2. Ctrl+P (Print) or Command+P
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        triggerAlert("🔒 Printing of licensed courseware is disabled.");
        return false;
      }

      // 3. Ctrl+S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        triggerAlert("🔒 Saving offline copies of protected media is prohibited.");
        return false;
      }

      // 4. Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        triggerAlert("🔒 Source code inspection is disabled on secure learning assets.");
        return false;
      }

      // 5. Ctrl+Shift+I / F12 (DevTools)
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "I", "c", "C", "j", "J"].includes(e.key))
      ) {
        e.preventDefault();
        triggerAlert("🔒 Developer inspection tools are restricted during DRM playback.");
        return false;
      }
    }

    function handleContextMenu(e) {
      e.preventDefault();
      triggerAlert("🔒 Context menu & media downloads are protected by DRM.");
      return false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled]);

  function triggerAlert(msg) {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(null);
    }, 4500);
  }

  const watermarkText = user?.email
    ? `PATHWARD DRM · ${user.email} · USER #${user.id || "104"}`
    : "PATHWARD SECURE LMS · PATENT & IP PROTECTED";

  return (
    <div className="drm-shield-wrapper">
      {/* DRM Watermark Floating Overlay */}
      {showWatermark && (
        <div
          className="drm-floating-watermark mono"
          style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
        >
          <span>{watermarkText}</span>
        </div>
      )}

      {/* Security Toast Notification */}
      {warningMessage && (
        <div className="drm-warning-toast glass-card animate-slide-up">
          <span className="material-symbols-outlined drm-toast-icon">security</span>
          <div className="drm-toast-text">
            <strong>DRM Intellectual Property Alert</strong>
            <p>{warningMessage}</p>
          </div>
          <button className="drm-toast-close" onClick={() => setWarningMessage(null)}>
            ✕
          </button>
        </div>
      )}

      {children}
    </div>
  );
}
