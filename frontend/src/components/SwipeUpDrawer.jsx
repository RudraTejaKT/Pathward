import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  COURSE_CATALOG,
  getStoredProgress,
  setActiveCourse as saveActiveCourseId,
  computeCourseProgress,
} from "../lib/coursesData.js";
import "./SwipeUpDrawer.css";

export default function SwipeUpDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [startY, setStartY] = useState(null);
  const [currentY, setCurrentY] = useState(null);
  const [storedProgress, setStoredProgress] = useState(getStoredProgress());

  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const drawerRef = useRef(null);

  // Sync stored progress
  useEffect(() => {
    function handleProgressUpdate(e) {
      if (e.detail) {
        setStoredProgress(e.detail);
      }
    }
    window.addEventListener("pathward:progress-updated", handleProgressUpdate);
    return () => window.removeEventListener("pathward:progress-updated", handleProgressUpdate);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Active course telemetry
  const activeCourseId = storedProgress?.activeCourseId || "feat-1";
  const activeCourse = COURSE_CATALOG[activeCourseId] || COURSE_CATALOG["feat-1"] || Object.values(COURSE_CATALOG)[0];
  const completedLessonsMap = (storedProgress?.completedLessons && activeCourse?.id && storedProgress.completedLessons[activeCourse.id]) || {};
  const progressData = activeCourse ? computeCourseProgress(activeCourse, completedLessonsMap) : { percent: 0, completedLessons: 0, totalLessons: 0 };

  // Touch Gesture Handlers (Swipe Up to Open, Swipe Down to Close)
  function handleTouchStart(e) {
    setStartY(e.touches[0].clientY);
  }

  function handleTouchMove(e) {
    if (startY === null) return;
    setCurrentY(e.touches[0].clientY);
  }

  function handleTouchEnd() {
    if (startY === null || currentY === null) {
      setStartY(null);
      setCurrentY(null);
      return;
    }

    const diff = startY - currentY;
    // Swipe Up (> 40px)
    if (diff > 40 && !isOpen) {
      setIsOpen(true);
    }
    // Swipe Down (< -40px)
    else if (diff < -40 && isOpen) {
      setIsOpen(false);
    }

    setStartY(null);
    setCurrentY(null);
  }

  function handleNavigate(path) {
    setIsOpen(false);
    navigate(path);
  }

  function handleSwitchCourse(cId) {
    saveActiveCourseId(cId);
    setStoredProgress(getStoredProgress());
  }

  return (
    <div
      className={`swipe-drawer-root ${isOpen ? "open" : "collapsed"}`}
      ref={drawerRef}
    >
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          className="swipe-drawer-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Drawer Surface */}
      <div
        className="swipe-drawer-sheet glass-card"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Handle Bar & Peek Trigger */}
        <button
          type="button"
          className="swipe-handle-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Quick Action Sheet"
        >
          <div className="swipe-handle-bar" />
          <div className="swipe-peek-row">
            <span className="material-symbols-outlined peek-arrow-icon">
              {isOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
            <span className="mono text-xs peek-text">
              {isOpen ? "Swipe down to close" : "Swipe up for Quick Actions & Shortcuts"}
            </span>
            <span className="pulsing-dot" />
          </div>
        </button>

        {/* Expanded Drawer Content */}
        {isOpen && (
          <div className="swipe-drawer-body animate-fade-in">
            {/* 1. Active Learning Progress & Course Switcher */}
            <div className="drawer-active-course-card glass-card">
              <div className="dac-top">
                <div>
                  <span className="mono text-xs text-secondary">ACTIVE COURSE ENROLLMENT</span>
                  <h3 className="dac-title">{activeCourse.title}</h3>
                </div>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary mono text-xs dac-btn"
                  onClick={() => handleNavigate(`/courses/${activeCourse.id}`)}
                >
                  Continue →
                </button>
              </div>

              <div className="dac-progress-row">
                <div className="dac-progress-track">
                  <div className="dac-progress-fill" style={{ width: `${progressData.percent}%` }} />
                </div>
                <span className="mono text-xs font-bold text-emerald">{progressData.percent}% Completed</span>
              </div>

              {/* Course Switcher Chips */}
              <div className="drawer-courses-chips">
                <span className="mono text-xs text-muted">Switch Track:</span>
                {Object.values(COURSE_CATALOG).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`course-chip mono ${c.id === activeCourseId ? "active" : ""}`}
                    onClick={() => handleSwitchCourse(c.id)}
                  >
                    {c.title.split(" ")[0]}…
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Quick Action Grid (All instances & platform tools) */}
            <div className="drawer-actions-grid">
              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/dashboard")}
              >
                <div className="tile-icon-wrap bg-indigo">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <div className="tile-text">
                  <strong>Student Portal</strong>
                  <span>Overview &amp; Modules</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/mcq")}
              >
                <div className="tile-icon-wrap bg-cyan">
                  <span className="material-symbols-outlined">sports_esports</span>
                </div>
                <div className="tile-text">
                  <strong>Practice Gym</strong>
                  <span>Aptitude &amp; Coding Simulator</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"));
                }}
              >
                <div className="tile-icon-wrap bg-emerald">
                  <span className="material-symbols-outlined">monitor_heart</span>
                </div>
                <div className="tile-text">
                  <strong>Stress Meter</strong>
                  <span>Telemetry &amp; Box Breathing</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent("pathward:open-ai-chat"));
                }}
              >
                <div className="tile-icon-wrap bg-purple">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div className="tile-text">
                  <strong>Octi AI Assistant</strong>
                  <span>Doubt Solver &amp; Advice</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/quiz")}
              >
                <div className="tile-icon-wrap bg-amber">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="tile-text">
                  <strong>Career Quiz</strong>
                  <span>Stream Assessment</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/engineering")}
              >
                <div className="tile-icon-wrap bg-rose">
                  <span className="material-symbols-outlined">engineering</span>
                </div>
                <div className="tile-text">
                  <strong>Engineering</strong>
                  <span>35+ Core &amp; AI Branches</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/medical")}
              >
                <div className="tile-icon-wrap bg-teal">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <div className="tile-text">
                  <strong>Medical Universe</strong>
                  <span>MBBS &amp; Clinical Roadmaps</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-action-tile glass-card"
                onClick={() => handleNavigate("/discover")}
              >
                <div className="tile-icon-wrap bg-blue">
                  <span className="material-symbols-outlined">explore</span>
                </div>
                <div className="tile-text">
                  <strong>Explore Catalog</strong>
                  <span>All Video Masterclasses</span>
                </div>
              </button>
            </div>

            {/* 3. Bottom Utility Bar */}
            <div className="drawer-bottom-utils">
              <button
                type="button"
                className="theme-switch-drawer-btn mono text-xs"
                onClick={toggleTheme}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
                <span>{isDark ? "Switch to Light Mode" : "Switch to Cosmic Dark"}</span>
              </button>

              {user ? (
                <span className="mono text-xs text-muted">Logged in as {user.name}</span>
              ) : (
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary mono text-xs"
                  onClick={() => handleNavigate("/login")}
                >
                  Sign In / Register →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
