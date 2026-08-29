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

  const { user, logout } = useAuth();
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
    window.addEventListener("backlox:progress-updated", handleProgressUpdate);
    return () => window.removeEventListener("backlox:progress-updated", handleProgressUpdate);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Active course telemetry
  const isInstructorMode = user?.role === "instructor" || location.pathname.startsWith("/instructor");
  const instructorBalance = parseInt(localStorage.getItem("backlox_instructor_balance") || "38200", 10);
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

  function handleSwitchInstructorTab(tab) {
    setIsOpen(false);
    navigate("/instructor");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("backlox:switch-instructor-tab", { detail: tab }));
    }, 50);
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
              {isOpen
                ? "Tap or swipe to close"
                : isInstructorMode
                ? "Instructor Studio"
                : "Quick Shortcuts"}
            </span>
            <span className="pulsing-dot" />
          </div>
        </button>

        {/* Expanded Drawer Content */}
        {isOpen && (
          <div className="swipe-drawer-body animate-fade-in">
            {/* ========================================================= */}
            {/* INSTRUCTOR DRAWER VIEW (When on /instructor or Instructor Role) */}
            {/* ========================================================= */}
            {isInstructorMode ? (
              <>
                {/* 1. Instructor Creator Suite Card */}
                <div className="drawer-active-course-card glass-card">
                  <div className="dac-top">
                    <div>
                      <span className="mono text-xs text-primary">INSTRUCTOR CREATOR SUITE</span>
                      <h3 className="dac-title">Creator Studio &amp; Payout Command</h3>
                    </div>
                    <button
                      type="button"
                      className="cyber-btn cyber-btn--primary mono text-xs dac-btn"
                      onClick={() => handleNavigate("/instructor")}
                    >
                      Open Studio →
                    </button>
                  </div>

                  <div className="dac-progress-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="material-symbols-outlined text-emerald" style={{ fontSize: "17px" }}>account_balance</span>
                      <span className="mono text-xs text-muted">Available Wallet:</span>
                      <strong className="mono text-emerald" style={{ fontSize: "14px" }}>₹{instructorBalance.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  {/* Studio Tab Switcher */}
                  <div className="drawer-courses-chips">
                    <span className="mono text-xs text-muted">Studio Tabs:</span>
                    <button
                      type="button"
                      className="course-chip mono"
                      onClick={() => handleSwitchInstructorTab("monetization")}
                    >
                      💰 Revenue &amp; Payouts
                    </button>
                    <button
                      type="button"
                      className="course-chip mono"
                      onClick={() => handleSwitchInstructorTab("courses")}
                    >
                      📹 Upload Courses
                    </button>
                    <button
                      type="button"
                      className="course-chip mono"
                      onClick={() => handleSwitchInstructorTab("assignments")}
                    >
                      📝 Grading Hub
                    </button>
                    <button
                      type="button"
                      className="course-chip mono"
                      onClick={() => handleSwitchInstructorTab("qa")}
                    >
                      💬 Scholar Q&amp;A
                    </button>
                  </div>
                </div>

                {/* 2. Instructor Dedicated Quick Action Grid */}
                <div className="drawer-actions-grid">
                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleSwitchInstructorTab("monetization")}
                  >
                    <div className="tile-icon-wrap bg-emerald">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div className="tile-text">
                      <strong>Revenue &amp; Payouts</strong>
                      <span>Transfers &amp; Earnings</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleSwitchInstructorTab("courses")}
                  >
                    <div className="tile-icon-wrap bg-indigo">
                      <span className="material-symbols-outlined">video_library</span>
                    </div>
                    <div className="tile-text">
                      <strong>Upload Courses</strong>
                      <span>Catalog &amp; Modules</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleSwitchInstructorTab("assignments")}
                  >
                    <div className="tile-icon-wrap bg-cyan">
                      <span className="material-symbols-outlined">assignment_turned_in</span>
                    </div>
                    <div className="tile-text">
                      <strong>Grading Hub</strong>
                      <span>Review Submissions</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleSwitchInstructorTab("qa")}
                  >
                    <div className="tile-icon-wrap bg-purple">
                      <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="tile-text">
                      <strong>Scholar Q&amp;A</strong>
                      <span>Direct Discussions</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleNavigate("/dashboard")}
                  >
                    <div className="tile-icon-wrap bg-amber">
                      <span className="material-symbols-outlined">dashboard</span>
                    </div>
                    <div className="tile-text">
                      <strong>Student View</strong>
                      <span>Portal &amp; Progress</span>
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
                      <span>Video Masterclasses</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent("backlox:open-ai-chat"));
                    }}
                  >
                    <div className="tile-icon-wrap bg-rose">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div className="tile-text">
                      <strong>AI Course Assistant</strong>
                      <span>Curriculum Generator</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent("backlox:open-stress-meter"));
                    }}
                  >
                    <div className="tile-icon-wrap bg-teal">
                      <span className="material-symbols-outlined">monitor_heart</span>
                    </div>
                    <div className="tile-text">
                      <strong>Stress Meter</strong>
                      <span>Box Breathing</span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              /* ========================================================= */
              /* STUDENT DRAWER VIEW (Default for Learners & Scholars) */
              /* ========================================================= */
              <>
                {/* 1. Student Active Learning Progress Card */}
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

                {/* 2. Student Dedicated Quick Action Grid */}
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
                      <span>Aptitude &amp; Exam Matrix</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => handleNavigate("/learn")}
                  >
                    <div className="tile-icon-wrap bg-emerald">
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <div className="tile-text">
                      <strong>Learning Hub</strong>
                      <span>Academic Syllabi</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="drawer-action-tile glass-card"
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent("backlox:open-ai-chat"));
                    }}
                  >
                    <div className="tile-icon-wrap bg-purple">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div className="tile-text">
                      <strong>Backlox AI</strong>
                      <span>Academic &amp; Doubt Solver</span>
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
              </>
            )}

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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="mono text-xs text-muted">@{user.name ? user.name.split(" ")[0] : "Scholar"}</span>
                  <button
                    type="button"
                    className="navbar__logout-btn"
                    style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                    title="Log out"
                    aria-label="Log out"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                      navigate("/login");
                    }}
                  >
                    <span className="material-symbols-outlined logout-icon" style={{ fontSize: "16px" }}>logout</span>
                  </button>
                </div>
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
