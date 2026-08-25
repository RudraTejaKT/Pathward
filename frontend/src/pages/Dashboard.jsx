import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import VideoPlayer from "../components/VideoPlayer.jsx";
import PathwardLogo from "../components/PathwardLogo.jsx";
import {
  COURSE_CATALOG,
  getStoredProgress,
  saveStoredProgress,
  setActiveCourse as saveActiveCourseId,
  computeCourseProgress,
  toggleLessonCompletion,
} from "../lib/coursesData.js";
import { MASTER_APTITUDE_BANK } from "../lib/aptitudeDatabase.js";
import "./Dashboard.css";

// 3 Leaderboard Cohorts for Hall of Fame carousel
const LEADERBOARDS = [
  {
    id: 1,
    label: "#1 Weekly Sprint",
    podium: [
      { rank: 1, name: "Nabisha Khan", handle: "nabisha", points: "3,899", avatar: "NA", color: "#47d6ff", badge: "Weekly Champion", certs: 8, streak: "14 Days" },
      { rank: 2, name: "Chandrakesh Sharma", handle: "Chandrakesh S...", points: "2,430", avatar: "CS", color: "#f59e0b", badge: "Weekly Vanguard", certs: 5, streak: "9 Days" },
      { rank: 3, name: "Mohammad Umar", handle: "Mohammad Um...", points: "2,306", avatar: "MO", color: "#10b981", badge: "Weekly Sentinel", certs: 6, streak: "11 Days" },
    ],
  },
  {
    id: 2,
    label: "#2 Monthly Cohort",
    podium: [
      { rank: 1, name: "Aarav Patel", handle: "aarav.ai", points: "14,250", avatar: "AP", color: "#47d6ff", badge: "Monthly Grandmaster", certs: 14, streak: "28 Days" },
      { rank: 2, name: "Priya Nair", handle: "priya_nair", points: "12,180", avatar: "PN", color: "#f59e0b", badge: "Monthly Vanguard", certs: 11, streak: "24 Days" },
      { rank: 3, name: "Rohan Verma", handle: "rohan_v", points: "11,840", avatar: "RV", color: "#10b981", badge: "Monthly Sentinel", certs: 9, streak: "19 Days" },
    ],
  },
  {
    id: 3,
    label: "#3 All-Time Legends",
    podium: [
      { rank: 1, name: "Ananya Sen", handle: "ananya_lead", points: "48,900", avatar: "AS", color: "#47d6ff", badge: "Hall of Fame Titan", certs: 32, streak: "84 Days" },
      { rank: 2, name: "Vikram Rao", handle: "vikram_arch", points: "44,120", avatar: "VR", color: "#f59e0b", badge: "Hall of Fame Legend", certs: 28, streak: "62 Days" },
      { rank: 3, name: "Sneha Gupta", handle: "sneha_g", points: "41,500", avatar: "SG", color: "#10b981", badge: "Hall of Fame Elite", certs: 25, streak: "51 Days" },
    ],
  },
];

// 3 Cohort Hot Stats Slides
const HOT_STATS_SLIDES = [
  {
    month: "July 2026 Cohort",
    page: "1/3",
    items: [
      { num: "150", desc: "Companies interviewed Scholars", highlight: false },
      { num: "102", desc: "Sharpened scholars placed", highlight: false },
      { num: "18 LPA", desc: "Highest package of month", highlight: true, color: "text-primary" },
      { num: "349", desc: "Interviews & mock audits", highlight: true, color: "text-secondary" },
    ],
  },
  {
    month: "Hiring Domains",
    page: "2/3",
    items: [
      { num: "42%", desc: "AI & Transformer Systems", highlight: true, color: "text-primary" },
      { num: "34%", desc: "Cloud & DevOps Architecture", highlight: false },
      { num: "14%", desc: "Robotics & VLSI Embedded", highlight: false },
      { num: "10%", desc: "Clinical Tech & Analytics", highlight: true, color: "text-secondary" },
    ],
  },
  {
    month: "CTC Distribution",
    page: "3/3",
    items: [
      { num: "28%", desc: "Super-Dream (>16 LPA)", highlight: true, color: "text-primary" },
      { num: "45%", desc: "Dream Tier (10-16 LPA)", highlight: true, color: "text-secondary" },
      { num: "27%", desc: "Core Engineering (6-10 LPA)", highlight: false },
      { num: "98.4%", desc: "Offer Acceptance Rate", highlight: false },
    ],
  },
];

// Upcoming interactive live workshops
const UPCOMING_SESSIONS = [
  {
    id: 1,
    title: "Live + Doubt Clarification",
    faculty: "Prof. Arvind Raman",
    time: "Today - 1:00 PM",
    status: "cancelled",
    cancelReason: "Faculty attending AICTE accreditation council. Rescheduled to Friday 4:00 PM.",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
  },
  {
    id: 2,
    title: "Live + Doubt (Deep Learning Systems)",
    faculty: "Dr. Eleanor Vance (Ex-DeepMind)",
    time: "Today - 10:00 PM",
    status: "join",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
  },
  {
    id: 3,
    title: "Live + Doubt (Distributed Cloud & Kafka)",
    faculty: "Marcus Thorne (Lead Architect)",
    time: "Wednesday - 1:00 PM",
    status: "join",
    videoUrl: "https://www.youtube.com/embed/bXb9dJ2bOls",
  },
  {
    id: 4,
    title: "Live + Doubt (Clinical Cardiology Triage)",
    faculty: "Dr. Rajesh K. Varma (MD Cardiology)",
    time: "Wednesday - 10:00 PM",
    status: "join",
    videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w",
  },
];

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  // Navigation Rail state: 'home' | 'assignments' | 'gym' | 'lectures' | 'analytics' | 'leaderboard'
  const [activeNav, setActiveNav] = useState("home");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Dynamic Chosen Course Progress State
  const [storedProgress, setStoredProgress] = useState(getStoredProgress());
  const [activeCourseId, setActiveCourseId] = useState(storedProgress.activeCourseId || "feat-1");

  // Live stress monitor data
  const [stressData, setStressData] = useState({ score: 12, label: "Optimal Flow", color: "#22c55e" });

  // Selected assignment for drawer/modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Assignment filter tab
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  // Live session modal
  const [activeLiveSession, setActiveLiveSession] = useState(null);
  const [workshopTab, setWorkshopTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState([
    { sender: "Prof. Arvind Raman", text: "Welcome everyone! Make sure your PyTorch 2.0 kernel is initialized.", time: "10:00 PM" },
    { sender: "Nabisha Khan", text: "Ready! The causal mask tensor formula is loaded.", time: "10:01 PM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Scholar profile modal from leaderboard
  const [selectedScholar, setSelectedScholar] = useState(null);

  // Cancelled session alert popup
  const [cancelledSessionNotice, setCancelledSessionNotice] = useState(null);

  // Hot stats & Leaderboard carousels
  const [leaderboardIndex, setLeaderboardIndex] = useState(0);
  const [hotStatsIndex, setHotStatsIndex] = useState(0);

  // Payments and API states
  const [payments, setPayments] = useState([]);
  const [payingPlan, setPayingPlan] = useState(null);
  const [payError, setPayError] = useState(null);
  const [paySuccessMessage, setPaySuccessMessage] = useState(null);

  // In-Dashboard Practice Gym States
  const [gymCategory, setGymCategory] = useState("all");
  const [gymAnswers, setGymAnswers] = useState({});
  const [gymHints, setGymHints] = useState({});

  // In-Dashboard Video Lecture State
  const [activeLectureUrl, setActiveLectureUrl] = useState(null);
  const [activeLectureTitle, setActiveLectureTitle] = useState(null);
  const [lectureNotes, setLectureNotes] = useState("Key Architecture Principles:\n1. Attention is all you need: Scaled Dot-Product Attention.\n2. LayerNorm and residual connections stabilize gradient backpropagation.\n3. Feed-forward MLP expansion layer.");

  // Listen for progress updates
  useEffect(() => {
    function handleProgressUpdate(e) {
      if (e.detail) {
        setStoredProgress(e.detail);
        if (e.detail.activeCourseId) setActiveCourseId(e.detail.activeCourseId);
      }
    }
    window.addEventListener("pathward:progress-updated", handleProgressUpdate);
    return () => window.removeEventListener("pathward:progress-updated", handleProgressUpdate);
  }, []);

  // Listen for stress telemetry updates
  useEffect(() => {
    function handleStressUpdate(e) {
      if (e.detail) {
        setStressData({
          score: e.detail.stressScore,
          label: e.detail.label,
          color: e.detail.color,
        });
      }
    }
    window.addEventListener("pathward:stress-update", handleStressUpdate);
    return () => window.removeEventListener("pathward:stress-update", handleStressUpdate);
  }, []);

  // Load payment history
  useEffect(() => {
    api.getPaymentHistory()
      .then((res) => {
        if (Array.isArray(res)) setPayments(res);
      })
      .catch(() => {});
  }, []);

  // Compute active course & its dynamic module progress
  const activeCourse = COURSE_CATALOG[activeCourseId] || COURSE_CATALOG["feat-1"] || Object.values(COURSE_CATALOG)[0];
  const completedLessonsMap = (storedProgress?.completedLessons && activeCourse?.id && storedProgress.completedLessons[activeCourse.id]) || {};
  const progressData = activeCourse ? computeCourseProgress(activeCourse, completedLessonsMap) : { percent: 0, completedLessons: 0, totalLessons: 0, modules: [] };

  // Dynamic points calculation (completed lessons * 50 + base 300)
  const dynamicTotalPoints = progressData.completedLessons * 50 + 300;
  const performanceGPA = (6.0 + (progressData.percent / 100) * 3.8).toFixed(2);

  // Handler to switch chosen course
  function handleSelectCourse(courseId) {
    setActiveCourseId(courseId);
    saveActiveCourseId(courseId);
  }

  async function handleSubmitAssignment(e) {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      await api.submitAssignment(selectedAssignment.id, {
        submissionContent: submissionText.trim() || "Completed solution submitted via Pathward Student Hub.",
        submissionUrl: submissionUrl.trim(),
      });
      setSubmitSuccess("✓ Assignment submitted successfully for instructor review & grading!");
    } catch {
      setSubmitSuccess("✓ Assignment solution recorded locally in your progress.");
    } finally {
      // Update local storage submitted assignments
      const updated = { ...storedProgress };
      if (!updated.submittedAssignments) updated.submittedAssignments = {};
      updated.submittedAssignments[selectedAssignment.id] = {
        status: "graded",
        score: 95,
        feedback: "Approved with distinction. Well structured implementation.",
        submitted_content: submissionText,
        submitted_url: submissionUrl,
      };
      saveStoredProgress(updated);
      setSubmitting(false);
      setSubmissionUrl("");
      setSubmissionText("");
    }
  }

  function handleSendChatMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user?.name || "You",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  }

  async function handleUpgrade(planId = "pathward_pro", planName = "Pathward Pro") {
    setPayError(null);
    setPaySuccessMessage(null);
    setPayingPlan(planId);

    try {
      const order = await api.createOrder(planId);
      const result = await openRazorpayCheckout(order, user, {
        name: "Pathward Universe",
        description: `${planName} Upgrade`,
        notes: { plan: planId, userId: user.id },
      });

      await api.verifyPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      setPaySuccessMessage(`Payment confirmed! You now have ${planName} unlocked.`);
      if (refreshUser) await refreshUser();
    } catch (err) {
      if (err.message !== "Payment was cancelled by user.") {
        setPayError(err.message || "Payment process could not be completed.");
      }
    } finally {
      setPayingPlan(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const currentLeaderboard = LEADERBOARDS[leaderboardIndex];
  const currentHotStats = HOT_STATS_SLIDES[hotStatsIndex];

  return (
    <div className="student-dashboard-root">
      {/* Background Ambient Cosmic Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* ========================================================= */}
      {/* INTEGRATED DASHBOARD WORKSPACE HEADER */}
      {/* ========================================================= */}
      <header className="dash-workspace-header">
        <div className="dash-workspace-header__inner">
          <div className="dash-workspace-brand">
            <Link to="/" className="dash-brand-link" title="Return to Platform Home">
              <PathwardLogo size="default" />
            </Link>

            {/* Chosen Course Selector Dropdown */}
            <div className="dash-course-selector-wrap">
              <span className="mono text-xs text-muted">ACTIVE COURSE:</span>
              <select
                className="dash-course-select mono text-xs font-bold"
                value={activeCourseId}
                onChange={(e) => handleSelectCourse(e.target.value)}
                title="Switch between your chosen / enrolled courses"
              >
                {Object.values(COURSE_CATALOG).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dash-workspace-actions">
            {/* Explore Catalog quick link */}
            <Link to="/discover" className="dash-action-btn" title="Explore All Courses">
              <span className="material-symbols-outlined">explore</span>
              <span>Catalog</span>
            </Link>

            {/* Cognitive Stress Telemetry Pill */}
            <button
              type="button"
              className="navbar-stress-pill"
              onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"))}
              title="Click to open Cognitive Stress Meter & Box Breathing tool"
            >
              <span className="pulsing-dot" style={{ backgroundColor: stressData.color }} />
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: stressData.color }}>
                monitor_heart
              </span>
              <span className="mono text-xs font-bold" style={{ color: stressData.color }}>
                {stressData.score}% Stress
              </span>
            </button>

            {/* Half Moon Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Clean Light Theme" : "Switch to Dark Cosmic Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <svg className="half-moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg className="half-moon-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* User Profile & Logout */}
            <div className="dash-user-group">
              <div className="navbar__avatar">{user?.name ? user.name.charAt(0).toUpperCase() : "S"}</div>
              <span className="dash-username mono">{user?.name ? user.name.split(" ")[0] : "Scholar"}</span>
              <button type="button" onClick={handleLogout} className="navbar__logout-btn mono" title="Log out">
                <span className="material-symbols-outlined logout-icon">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-shell-container">
        {/* ========================================================= */}
        {/* 1. LEFT CYBER VERTICAL NAVIGATION RAIL */}
        {/* ========================================================= */}
        <aside className="dashboard-left-rail glass-card">
          <div className="rail-top">
            <nav className="rail-nav-list">
              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "home" ? "active" : ""}`}
                onClick={() => setActiveNav("home")}
                title="Overview & Course Command Center"
              >
                <span className="material-symbols-outlined">home</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "assignments" ? "active" : ""}`}
                onClick={() => setActiveNav("assignments")}
                title="Assignments & Case Studies Hub"
              >
                <span className="material-symbols-outlined">assignment</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "gym" ? "active" : ""}`}
                onClick={() => setActiveNav("gym")}
                title="Practice Gym & Aptitude Drill"
              >
                <span className="material-symbols-outlined">sports_esports</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "lectures" ? "active" : ""}`}
                onClick={() => setActiveNav("lectures")}
                title="Video Masterclasses & Lectures"
              >
                <span className="material-symbols-outlined">video_library</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "analytics" ? "active" : ""}`}
                onClick={() => setActiveNav("analytics")}
                title="Performance & Diagnostics Center"
              >
                <span className="material-symbols-outlined">insights</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "leaderboard" ? "active" : ""}`}
                onClick={() => setActiveNav("leaderboard")}
                title="Hall of Fame & Leaderboards"
              >
                <span className="material-symbols-outlined">star</span>
              </button>

              <button
                type="button"
                className="rail-nav-btn"
                onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"))}
                title="Cognitive Stress Meter & Box Breathing"
              >
                <span className="material-symbols-outlined">monitor_heart</span>
              </button>

              <button
                type="button"
                className="rail-nav-btn"
                onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-ai-chat"))}
                title="Backlox AI Advisor & Doubt Solver"
              >
                <span className="material-symbols-outlined">school</span>
              </button>
            </nav>
          </div>

          <div className="rail-bottom">
            <div
              className="coin-reward-pill mono"
              title="Scholar Energy Points"
              onClick={() => setActiveNav("analytics")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px", color: "#f59e0b" }}>stars</span>
              <span>1000 PTS</span>
            </div>

            <button
              type="button"
              className="rail-user-avatar"
              title={user?.name || "Scholar Profile"}
              onClick={() => setActiveNav("analytics")}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN DASHBOARD CONTENT AREA */}
        {/* ========================================================= */}
        <main className="dashboard-main-view">
          {/* VIEW 1: HOME (6-CARD COMMAND CENTER) */}
          {activeNav === "home" && (
            <>
              {/* Top Row Grid: Course Hero + Progress Report + Upcoming Sessions */}
              <section className="dash-top-grid">
                {/* Card 1: Dynamic Active Course Hero Header */}
                <div className="dash-card hero-course-card glass-card">
                  <div className="hero-card-header">
                    <div>
                      <h2
                        className="hero-course-title clickable-title"
                        onClick={() => navigate(`/courses/${activeCourse.id}`)}
                        title="Click to launch course overview"
                      >
                        {activeCourse.title}
                      </h2>
                      <div className="hero-meta-row">
                        <span className="rating-pill mono">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#f59e0b" }}>star</span>
                          {activeCourse.rating}
                        </span>
                        <span className="active-scholars-pill mono">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#6366f1" }}>group</span>
                          {activeCourse.studentsCount} active scholars
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hero-stat-boxes-row">
                    <div
                      className="hero-stat-box glass-card clickable-stat-box"
                      onClick={() => setActiveNav("assignments")}
                      title="View assignments & earn points"
                    >
                      <div className="stat-icon-wrap">
                        <span className="material-symbols-outlined">track_changes</span>
                      </div>
                      <div>
                        <span className="stat-box-label mono text-xs text-muted">Total Points</span>
                        <strong className="stat-box-val mono">{dynamicTotalPoints}</strong>
                      </div>
                    </div>

                    <div
                      className="hero-stat-box glass-card clickable-stat-box"
                      onClick={() => setActiveNav("analytics")}
                      title="View study time analytics"
                    >
                      <div className="stat-icon-wrap">
                        <span className="material-symbols-outlined">schedule</span>
                      </div>
                      <div>
                        <span className="stat-box-label mono text-xs text-muted">Completion</span>
                        <strong className="stat-box-val mono">{progressData.percent}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="hero-action-row">
                    <Link to={`/courses/${activeCourse.id}`} className="cyber-btn cyber-btn--primary start-learning-btn">
                      <span className="material-symbols-outlined">play_arrow</span>
                      <span>{progressData.percent > 0 ? "Continue Learning" : "Start Learning"}</span>
                    </Link>
                  </div>
                </div>

                {/* Card 2: Progress Report Card */}
                <div className="dash-card progress-report-card glass-card">
                  <div className="card-top-title-row">
                    <span className="card-eyebrow mono">PROGRESS REPORT</span>
                    <span className="material-symbols-outlined text-primary">donut_large</span>
                  </div>

                  <div className="progress-score-hero">
                    <span className="big-performance-num mono">{performanceGPA}</span>
                    <span className="performance-sub mono text-xs">Average Performance GPA</span>
                  </div>

                  <div className="progress-metrics-list">
                    <div
                      className="progress-metric-row clickable-metric"
                      onClick={() => navigate("/mcq")}
                      title="Launch Practice Gym & Coding Simulation"
                    >
                      <span className="mono text-xs text-muted">Practice Gym:</span>
                      <span className="mono text-xs font-bold text-secondary">85% Complete →</span>
                    </div>
                    <div
                      className="progress-metric-row clickable-metric"
                      onClick={() => setActiveNav("analytics")}
                      title="View Active Study Streak"
                    >
                      <span className="mono text-xs text-muted">Study Streak:</span>
                      <span className="mono text-xs font-bold text-amber">4 Days Streak</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="open-report-link mono text-xs"
                    onClick={() => setActiveNav("analytics")}
                  >
                    Open Detailed Report →
                  </button>
                </div>

                {/* Card 3: Upcoming Live Workshops */}
                <div className="dash-card upcoming-sessions-card glass-card">
                  <div className="card-top-title-row">
                    <span className="card-eyebrow mono">UPCOMING LIVE WORKSHOPS</span>
                    <span className="material-symbols-outlined text-secondary">laptop_chromebook</span>
                  </div>

                  <div className="sessions-list">
                    {UPCOMING_SESSIONS.map((s) => (
                      <div className="session-item-row" key={s.id}>
                        <div className="session-icon-wrap">
                          <span className="material-symbols-outlined">video_camera_front</span>
                        </div>
                        <div className="session-info">
                          <strong className="session-time-text mono text-xs">{s.time}</strong>
                          <span className="session-title-text">{s.title}</span>
                        </div>
                        <div>
                          {s.status === "cancelled" ? (
                            <button
                              type="button"
                              className="session-cancelled-badge mono"
                              onClick={() => setCancelledSessionNotice(s)}
                              title="Click for cancellation reason & reschedule time"
                            >
                              Cancelled
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="session-join-btn mono text-xs"
                              onClick={() => setActiveLiveSession(s)}
                            >
                              JOIN
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Bottom Row Grid: Course Modules + Hall of Fame + Hot Stats */}
              <section className="dash-bottom-grid">
                {/* Card 4: DYNAMIC CURRICULUM MODULES & PROGRESS */}
                <div className="dash-card curriculum-timeline-card glass-card">
                  <div className="card-top-title-row">
                    <div className="timeline-title-group">
                      <span className="material-symbols-outlined text-primary">menu_book</span>
                      <h3
                        className="curriculum-track-name clickable-title"
                        onClick={() => navigate(`/courses/${activeCourse.id}`)}
                        title="Open full course curriculum"
                      >
                        {activeCourse.title.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  <div className="timeline-modules-stack">
                    {progressData.modules.map((mod) => (
                      <div className="timeline-module-item" key={mod.id}>
                        <div className="timeline-marker mono">{mod.number}</div>
                        <div className="timeline-body glass-card">
                          <div
                            className="module-banner-thumb clickable-banner"
                            onClick={() => navigate(`/courses/${activeCourse.id}`)}
                            title={`Click to launch ${mod.title}`}
                          >
                            <div className="banner-badge-top">
                              <span className={`${mod.status === "completed" ? "completed-tag" : "in-progress-tag"} mono`}>
                                {mod.statusLabel}
                              </span>
                            </div>
                            <div className="banner-code-preview">
                              <code>{mod.codeSnippet}</code>
                            </div>
                          </div>

                          <div className="module-meta-bar">
                            <span className="mono text-xs" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>auto_stories</span>
                              {mod.totalLessons} Lessons
                            </span>
                            <span
                              className={`mono text-xs font-bold ${mod.percent === 100 ? "text-emerald" : "text-primary"}`}
                            >
                              {mod.percent}% Complete
                            </span>
                          </div>

                          <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${mod.percent}%` }} />
                          </div>

                          <button
                            type="button"
                            className={`view-assignments-btn mono text-xs ${mod.percent < 100 ? "view-assignments-btn--submit" : ""}`}
                            onClick={() => setSelectedAssignment(mod.assignment)}
                          >
                            {mod.percent === 100 ? "View Assignments" : "Submit Assignment"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 5: Hall of Fame (Podium Leaderboard) */}
                <div className="dash-card hall-of-fame-card glass-card">
                  <div className="card-top-title-row">
                    <span className="card-eyebrow mono">HALL OF FAME</span>
                    <div className="carousel-nav-arrows mono text-xs">
                      <button
                        type="button"
                        className="carousel-arrow-btn"
                        onClick={() => setLeaderboardIndex((prev) => (prev === 0 ? LEADERBOARDS.length - 1 : prev - 1))}
                        title="Previous Leaderboard"
                      >
                        &lt;
                      </button>
                      <span className="carousel-label text-muted">{currentLeaderboard.label}</span>
                      <button
                        type="button"
                        className="carousel-arrow-btn"
                        onClick={() => setLeaderboardIndex((prev) => (prev === LEADERBOARDS.length - 1 ? 0 : prev + 1))}
                        title="Next Leaderboard"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  <div className="podium-stage-container">
                    {/* 2nd Place (Left) */}
                    <div
                      className="podium-pillar pillar-second clickable-pillar"
                      onClick={() => setSelectedScholar(currentLeaderboard.podium[1])}
                      title={`View ${currentLeaderboard.podium[1].name}'s scholar profile`}
                    >
                      <div className="podium-avatar-wrap border-amber">
                        <span className="podium-avatar-text mono">{currentLeaderboard.podium[1].avatar}</span>
                        <span className="rank-circle-badge bg-amber">2</span>
                      </div>
                      <span className="podium-name">{currentLeaderboard.podium[1].handle}</span>
                      <span className="podium-points mono text-amber">{currentLeaderboard.podium[1].points} pts</span>
                      <div className="podium-block block-2" />
                    </div>

                    {/* 1st Place (Center - Tallest) */}
                    <div
                      className="podium-pillar pillar-first clickable-pillar"
                      onClick={() => setSelectedScholar(currentLeaderboard.podium[0])}
                      title={`View ${currentLeaderboard.podium[0].name}'s scholar profile`}
                    >
                      <div className="podium-avatar-wrap border-cyan">
                        <span className="podium-avatar-text mono">{currentLeaderboard.podium[0].avatar}</span>
                        <span className="rank-circle-badge bg-cyan">1</span>
                      </div>
                      <span className="podium-name font-bold">{currentLeaderboard.podium[0].handle}</span>
                      <span className="podium-points mono text-cyan">{currentLeaderboard.podium[0].points} pts</span>
                      <div className="podium-sword-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#38bdf8" }}>military_tech</span>
                      </div>
                      <div className="podium-block block-1" />
                    </div>

                    {/* 3rd Place (Right) */}
                    <div
                      className="podium-pillar pillar-third clickable-pillar"
                      onClick={() => setSelectedScholar(currentLeaderboard.podium[2])}
                      title={`View ${currentLeaderboard.podium[2].name}'s scholar profile`}
                    >
                      <div className="podium-avatar-wrap border-emerald">
                        <span className="podium-avatar-text mono">{currentLeaderboard.podium[2].avatar}</span>
                        <span className="rank-circle-badge bg-emerald">3</span>
                      </div>
                      <span className="podium-name">{currentLeaderboard.podium[2].handle}</span>
                      <span className="podium-points mono text-emerald">{currentLeaderboard.podium[2].points} pts</span>
                      <div className="podium-block block-3" />
                    </div>
                  </div>
                </div>

                {/* Card 6: Hot Stats (Paginated Cohort Metrics) */}
                <div className="dash-card hot-stats-card glass-card">
                  <div className="card-top-title-row">
                    <div>
                      <span className="card-eyebrow mono">HOT STATS</span>
                      <span className="hot-stats-month mono text-xs text-muted">{currentHotStats.month}</span>
                    </div>
                    <div className="carousel-nav-arrows mono text-xs">
                      <button
                        type="button"
                        className="carousel-arrow-btn"
                        onClick={() => setHotStatsIndex((prev) => (prev === 0 ? HOT_STATS_SLIDES.length - 1 : prev - 1))}
                        title="Previous Stat Slide"
                      >
                        &lt;
                      </button>
                      <span className="carousel-label text-muted">{currentHotStats.page}</span>
                      <button
                        type="button"
                        className="carousel-arrow-btn"
                        onClick={() => setHotStatsIndex((prev) => (prev === HOT_STATS_SLIDES.length - 1 ? 0 : prev + 1))}
                        title="Next Stat Slide"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  <div className="hot-stats-grid">
                    {currentHotStats.items.map((it, idx) => (
                      <div
                        className="hot-stat-item clickable-stat"
                        key={idx}
                        onClick={() => navigate("/engineering")}
                        title="Click to view industry engineering streams"
                      >
                        <strong className={`hot-stat-num mono ${it.color || ""}`}>{it.num}</strong>
                        <span className="hot-stat-desc">{it.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: ASSIGNMENTS & CASE STUDIES HUB */}
          {/* ========================================================= */}
          {activeNav === "assignments" && (
            <div className="assignments-hub-view glass-card animate-fade-in">
              <div className="hub-top-header">
                <div>
                  <div className="cyber-pill mb-2">
                    <span className="pulsing-dot" />
                    <span>COURSEWORK &amp; CODE EVALUATION</span>
                  </div>
                  <h1 className="hub-title gradient-text">Assignments &amp; Case Studies</h1>
                  <p className="hub-subtitle">
                    Coursework for <strong>{activeCourse.title}</strong> — submit code implementations, review rubrics, and unlock course milestones.
                  </p>
                </div>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary"
                  onClick={() => setActiveNav("home")}
                >
                  ← Back to Overview
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="assignment-filter-tabs">
                <button
                  type="button"
                  className={`filter-tab-btn ${assignmentFilter === "all" ? "active" : ""}`}
                  onClick={() => setAssignmentFilter("all")}
                >
                  All ({progressData.modules.length})
                </button>
                <button
                  type="button"
                  className={`filter-tab-btn ${assignmentFilter === "pending" ? "active" : ""}`}
                  onClick={() => setAssignmentFilter("pending")}
                >
                  Pending ({progressData.modules.filter((m) => m.percent < 100).length})
                </button>
                <button
                  type="button"
                  className={`filter-tab-btn ${assignmentFilter === "graded" ? "active" : ""}`}
                  onClick={() => setAssignmentFilter("graded")}
                >
                  Graded ({progressData.modules.filter((m) => m.percent === 100).length})
                </button>
              </div>

              {/* Assignment Cards List */}
              <div className="assignments-grid-list">
                {progressData.modules
                  .filter((m) => {
                    if (assignmentFilter === "graded") return m.percent === 100;
                    if (assignmentFilter === "pending") return m.percent < 100;
                    return true;
                  })
                  .map((m) => (
                    <div className="assignment-full-card glass-card" key={m.assignment.id}>
                      <div className="assignment-card-top">
                        <div>
                          <span className="mono text-xs text-secondary">Module {m.number} · {m.title}</span>
                          <h3 className="assignment-card-heading">{m.assignment.title}</h3>
                        </div>
                        <span className={`status-pill mono ${m.percent === 100 ? "status-pill--graded" : "status-pill--pending"}`}>
                          {m.percent === 100 ? "✓ Graded (95/100)" : "Pending Submission"}
                        </span>
                      </div>

                      <p className="assignment-card-desc">{m.assignment.description}</p>

                      <div className="assignment-card-footer">
                        <div className="assignment-meta-tags mono text-xs">
                          <span>Max Points: {m.assignment.maxPoints}</span>
                          <span>Due: {m.assignment.due}</span>
                        </div>

                        <button
                          type="button"
                          className="cyber-btn cyber-btn--primary"
                          onClick={() => setSelectedAssignment(m.assignment)}
                        >
                          {m.percent === 100 ? "View Graded Solution →" : "Submit Solution →"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: PERFORMANCE & DIAGNOSTICS CENTER */}
          {/* ========================================================= */}
          {activeNav === "analytics" && (
            <div className="analytics-hub-view glass-card animate-fade-in">
              <div className="hub-top-header">
                <div>
                  <div className="cyber-pill mb-2">
                    <span className="pulsing-dot" />
                    <span>SCHOLAR TELEMETRY &amp; DIAGNOSTICS</span>
                  </div>
                  <h1 className="hub-title gradient-text">Performance &amp; Diagnostics</h1>
                  <p className="hub-subtitle">
                    Cognitive stress levels, course completion telemetry, study streaks, and Razorpay Pro subscription management.
                  </p>
                </div>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary"
                  onClick={() => setActiveNav("home")}
                >
                  ← Back to Overview
                </button>
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="analytics-kpi-grid">
                <div className="kpi-card glass-card">
                  <span className="mono text-xs text-muted">COMPREHENSION GPA</span>
                  <strong className="kpi-hero-num mono text-primary">{performanceGPA} / 10</strong>
                  <span className="mono text-xs text-emerald">Top 12% in current cohort</span>
                </div>

                <div className="kpi-card glass-card">
                  <span className="mono text-xs text-muted">COURSE PROGRESS</span>
                  <strong className="kpi-hero-num mono text-secondary">{progressData.percent}%</strong>
                  <span className="mono text-xs text-secondary">{progressData.completedLessons} of {progressData.totalLessons} lessons</span>
                </div>

                <div className="kpi-card glass-card">
                  <span className="mono text-xs text-muted">ACTIVE STUDY STREAK</span>
                  <strong className="kpi-hero-num mono text-amber">4 Days</strong>
                  <span className="mono text-xs text-amber">Personal best: 14 days</span>
                </div>

                <div className="kpi-card glass-card">
                  <span className="mono text-xs text-muted">SCHOLAR ENERGY POINTS</span>
                  <strong className="kpi-hero-num mono text-cyan">{dynamicTotalPoints} PTS</strong>
                  <span className="mono text-xs text-cyan">Rank #2 in weekly sprint</span>
                </div>
              </div>

              {/* Pro Upgrade & Subscription Row */}
              <div className="pro-subscription-banner glass-card">
                <div className="pro-banner-left">
                  <div className="pro-pill-large mono">PATHWARD PRO UNIVERSE</div>
                  <h2>Unlock All 35+ Engineering &amp; Medical Branches</h2>
                  <p>Get lifetime verified certifications, 1-on-1 doubt sessions, and unlimited mock MCQ exams.</p>
                  {paySuccessMessage && <div className="submit-success-alert mono text-xs">{paySuccessMessage}</div>}
                  {payError && <div className="submit-error-alert mono text-xs">{payError}</div>}
                </div>

                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary pro-upgrade-btn"
                  onClick={() => handleUpgrade("pathward_pro", "Pathward Pro Lifetime")}
                  disabled={payingPlan !== null}
                >
                  <span className="material-symbols-outlined">bolt</span>
                  <span>{payingPlan ? "Processing Razorpay…" : "Upgrade via Razorpay (₹499)"}</span>
                </button>
              </div>

              {/* Payment History Invoices Table */}
              <div className="payment-history-section">
                <h3 className="section-subtitle">Payment &amp; Invoice History</h3>
                <div className="table-responsive">
                  <table className="monetization-table">
                    <thead>
                      <tr className="mono text-xs">
                        <th>TRANSACTION ID</th>
                        <th>PLAN / COURSE</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? (
                        payments.map((p) => (
                          <tr key={p.id}>
                            <td className="mono">{p.razorpay_payment_id || `PW-${p.id}`}</td>
                            <td><strong>{p.plan_name || "Pathward Pro"}</strong></td>
                            <td className="mono text-emerald">₹{p.amount || 499}</td>
                            <td><span className="completed-tag mono">Confirmed</span></td>
                            <td className="mono text-xs">{new Date(p.created_at || Date.now()).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="mono">pay_PW_99214</td>
                          <td><strong>Pathward Pro Membership</strong></td>
                          <td className="mono text-emerald font-bold">₹499</td>
                          <td><span className="completed-tag mono">Active</span></td>
                          <td className="mono text-xs">July 2026</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: PRACTICE GYM & APTITUDE DRILL */}
          {/* ========================================================= */}
          {activeNav === "gym" && (
            <div className="gym-hub-view glass-card animate-fade-in">
              <div className="hub-top-header">
                <div>
                  <div className="cyber-pill mb-2">
                    <span className="pulsing-dot" />
                    <span>PRACTICE GYM &amp; APTITUDE SPEED DRILL</span>
                  </div>
                  <h1 className="hub-title gradient-text">Practice Gym &amp; Question Matrix</h1>
                  <p className="hub-subtitle">
                    Master high-yield quantitative, logical, verbal, and technical aptitude questions from TCS NQT, CAT, GATE, and NEET.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary"
                    onClick={() => navigate("/mcq")}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>quiz</span>
                    <span>Launch Full Practice Gym →</span>
                  </button>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--secondary"
                    onClick={() => setActiveNav("home")}
                  >
                    ← Overview
                  </button>
                </div>
              </div>

              {/* Gym Domain Filter Buttons */}
              <div className="assignment-filter-tabs">
                {["all", "quant", "logical", "verbal", "tech", "medical", "commerce"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-tab-btn ${gymCategory === cat ? "active" : ""}`}
                    onClick={() => setGymCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="mcq-questions-stack mt-4">
                {MASTER_APTITUDE_BANK
                  .filter((q) => gymCategory === "all" || q.category === gymCategory)
                  .slice(0, 6)
                  .map((q, idx) => {
                    const isAnswered = gymAnswers[q.id] !== undefined;
                    const userAnswer = gymAnswers[q.id];
                    const isCorrect = userAnswer === q.answer;
                    const isHintOpen = gymHints[q.id];

                    return (
                      <div className="question-card glass-card" key={q.id}>
                        <div className="q-card-top">
                          <div className="q-badge-row">
                            <span className="q-number-badge mono">Q{idx + 1}</span>
                            <span className="q-subject-pill mono">{q.subject}</span>
                            <span className="q-difficulty-pill mono">{q.difficulty}</span>
                          </div>

                          <div className="q-actions-right">
                            {q.formula && (
                              <button
                                type="button"
                                className="formula-hint-btn mono text-xs"
                                onClick={() => setGymHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>lightbulb</span>
                                <span>{isHintOpen ? "Hide Formula" : "Formula Hint"}</span>
                              </button>
                            )}

                            {isAnswered && (
                              <span className={`status-pill mono ${isCorrect ? "correct" : "wrong"}`}>
                                {isCorrect ? "✓ Correct (+4)" : "✗ Incorrect (-1)"}
                              </span>
                            )}
                          </div>
                        </div>

                        {isHintOpen && q.formula && (
                          <div className="formula-hint-box mono text-xs">
                            <strong>Formula Reference:</strong> <code>{q.formula}</code>
                          </div>
                        )}

                        <h3 className="q-statement">{q.question}</h3>

                        <div className="q-options-grid">
                          {q.options.map((opt, optIdx) => {
                            let btnClass = "option-btn";
                            if (isAnswered) {
                              if (optIdx === q.answer) btnClass += " correct";
                              else if (optIdx === userAnswer) btnClass += " wrong";
                              else btnClass += " dimmed";
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                className={btnClass}
                                onClick={() => {
                                  if (!isAnswered) {
                                    setGymAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                  }
                                }}
                                disabled={isAnswered}
                              >
                                <span className="option-letter mono">{["A", "B", "C", "D"][optIdx]}</span>
                                <span className="option-text">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className={`explanation-box ${isCorrect ? "correct" : "wrong"}`}>
                            <strong>{isCorrect ? "✓ Solution Explanation:" : "✗ Detailed Breakdown:"}</strong>
                            <p className="explanation-text">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: VIDEO MASTERCLASSES & LECTURE PLAYER */}
          {/* ========================================================= */}
          {activeNav === "lectures" && (
            <div className="lectures-hub-view glass-card animate-fade-in">
              <div className="hub-top-header">
                <div>
                  <div className="cyber-pill mb-2">
                    <span className="pulsing-dot" />
                    <span>ACTIVE VIDEO MASTERCLASS</span>
                  </div>
                  <h1 className="hub-title gradient-text">{activeCourse.title}</h1>
                  <p className="hub-subtitle">
                    Watch video lectures, review synchronized code snippets, and mark milestones as completed.
                  </p>
                </div>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary"
                  onClick={() => setActiveNav("home")}
                >
                  ← Overview
                </button>
              </div>

              <div className="workshop-room-grid mt-4">
                <div className="workshop-player-pane">
                  <VideoPlayer
                    videoUrl={activeLectureUrl || activeCourse.trailerVideoUrl}
                    title={activeLectureTitle || `${activeCourse.title} - Lecture Player`}
                  />
                </div>

                <div className="workshop-chat-pane glass-card">
                  <h4 className="mono text-xs text-primary mb-3">COURSE LESSON PLAYLIST</h4>
                  <div className="lessons-playlist-scroll" style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto" }}>
                    {activeCourse.curriculum.map((m) => (
                      <div key={m.id} className="module-group-item">
                        <span className="mono text-xs text-secondary font-bold">Module {m.number}: {m.title}</span>
                        <div className="module-lessons-list mt-1" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {m.lessons.map((l) => {
                            const isDone = (storedProgress?.completedLessons && storedProgress.completedLessons[activeCourse.id] && storedProgress.completedLessons[activeCourse.id][l.id]);
                            return (
                              <div
                                key={l.id}
                                className="lecture-playlist-row glass-card"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  background: (activeLectureUrl === l.videoUrl) ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)"
                                }}
                                onClick={() => {
                                  setActiveLectureUrl(l.videoUrl || activeCourse.trailerVideoUrl);
                                  setActiveLectureTitle(l.title);
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: isDone ? "#22c55e" : "#818cf8" }}>
                                    {isDone ? "check_circle" : "play_circle"}
                                  </span>
                                  <span className="text-xs font-bold">{l.title}</span>
                                </div>

                                <button
                                  type="button"
                                  className="mono text-xs"
                                  style={{ background: "transparent", border: "none", color: isDone ? "#22c55e" : "var(--on-surface-variant)", cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonCompletion(activeCourse.id, l.id, !isDone);
                                  }}
                                  title="Toggle Completed"
                                >
                                  {isDone ? "✓ Done" : "Mark Done"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: HALL OF FAME & LEADERBOARDS */}
          {/* ========================================================= */}
          {activeNav === "leaderboard" && (
            <div className="leaderboard-hub-view glass-card animate-fade-in">
              <div className="hub-top-header">
                <div>
                  <div className="cyber-pill mb-2">
                    <span className="pulsing-dot" />
                    <span>HALL OF FAME &amp; SPRINT PODIUM</span>
                  </div>
                  <h1 className="hub-title gradient-text">Scholar Rankings &amp; Badges</h1>
                  <p className="hub-subtitle">
                    Top performing scholars, energy point leaders, verified certificates, and weekly sprint rankings.
                  </p>
                </div>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--secondary"
                  onClick={() => setActiveNav("home")}
                >
                  ← Overview
                </button>
              </div>

              {/* 3 Cohort Podiums */}
              <div className="leaderboard-cohorts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "20px" }}>
                {LEADERBOARDS.map((cohort) => (
                  <div className="cohort-podium-card glass-card" key={cohort.id} style={{ padding: "20px", borderRadius: "14px" }}>
                    <h3 className="mono text-sm text-primary mb-3">{cohort.label}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {cohort.podium.map((sch) => (
                        <div
                          key={sch.rank}
                          className="podium-row-card glass-card"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedScholar(sch)}
                          title="Click to view scholar profile"
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="mono font-bold" style={{ color: sch.rank === 1 ? "#f59e0b" : sch.rank === 2 ? "#94a3b8" : "#d97706" }}>
                              #{sch.rank}
                            </span>
                            <div className="navbar__avatar" style={{ width: "32px", height: "32px", fontSize: "12px", background: sch.color }}>
                              {sch.avatar}
                            </div>
                            <div>
                              <strong className="text-xs" style={{ display: "block" }}>{sch.name}</strong>
                              <span className="mono text-xs text-muted">@{sch.handle}</span>
                            </div>
                          </div>
                          <span className="mono text-xs font-bold text-cyan">{sch.points} PTS</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. ASSIGNMENT MODAL & SUBMISSION DRAWER */}
      {/* ========================================================= */}
      {selectedAssignment && (
        <div className="modal-backdrop" onClick={() => setSelectedAssignment(null)}>
          <div className="assignment-modal-card glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-primary">assignment</span>
                <div>
                  <h3 className="modal-title">{selectedAssignment.title}</h3>
                  <span className="mono text-xs text-muted">
                    Due Date: {selectedAssignment.due || "July 30, 2026"} • Max Points: {selectedAssignment.maxPoints || 100}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedAssignment(null)}>✕</button>
            </div>

            <div className="assignment-modal-body">
              <div className="assignment-desc-box">
                <p>{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.due === "Completed" && (
                <div className="graded-feedback-box glass-card">
                  <div className="feedback-top">
                    <span className="mono text-xs font-bold text-emerald">✓ GRADE SCORE: 95/100</span>
                    <span className="completed-tag mono">Distinction</span>
                  </div>
                  <p className="feedback-text text-sm">Approved with distinction. Clean structure and accurate derivation.</p>
                </div>
              )}

              {selectedAssignment.starterCode && (
                <div className="starter-code-box">
                  <span className="mono text-xs text-secondary">STARTER CODE TEMPLATE:</span>
                  <pre className="code-pre mono text-xs">{selectedAssignment.starterCode}</pre>
                </div>
              )}

              {submitSuccess && (
                <div className="submit-success-alert mono text-xs">
                  {submitSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitAssignment} className="assignment-submit-form">
                <div className="form-group">
                  <label className="mono text-xs">GITHUB / REPOSITORY URL (OPTIONAL)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/assignment-solution"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">SOLUTION EXPLANATION &amp; CODE SNIPPET</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Paste your solution code, mathematical derivation, or test results here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                </div>

                <div className="submit-actions-row">
                  <button type="button" className="cyber-btn cyber-btn--secondary" onClick={() => setSelectedAssignment(null)}>
                    Close
                  </button>
                  <button type="submit" className="cyber-btn cyber-btn--primary" disabled={submitting}>
                    {submitting ? "Submitting Solution…" : "Submit for Evaluation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LIVE WORKSHOP INTERACTIVE ROOM MODAL */}
      {/* ========================================================= */}
      {activeLiveSession && (
        <div className="modal-backdrop" onClick={() => setActiveLiveSession(null)}>
          <div className="live-workshop-room-modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="pulsing-dot" />
                <div>
                  <h3 className="modal-title">{activeLiveSession.title}</h3>
                  <span className="mono text-xs text-muted">Instructor: {activeLiveSession.faculty}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setActiveLiveSession(null)}>✕</button>
            </div>

            <div className="workshop-room-grid">
              <div className="workshop-player-pane">
                <VideoPlayer
                  videoUrl={activeLiveSession.videoUrl}
                  title={activeLiveSession.title}
                  onClose={() => setActiveLiveSession(null)}
                />
              </div>

              <div className="workshop-chat-pane glass-card">
                <div className="workshop-chat-tabs">
                  <button
                    type="button"
                    className={`workshop-tab-btn ${workshopTab === "chat" ? "active" : ""}`}
                    onClick={() => setWorkshopTab("chat")}
                  >
                    Live Chat
                  </button>
                  <button
                    type="button"
                    className={`workshop-tab-btn ${workshopTab === "notes" ? "active" : ""}`}
                    onClick={() => setWorkshopTab("notes")}
                  >
                    Session Notes
                  </button>
                </div>

                {workshopTab === "chat" ? (
                  <div className="chat-messages-container">
                    <div className="chat-messages-scroll">
                      {chatMessages.map((m, i) => (
                        <div className="chat-bubble" key={i}>
                          <div className="chat-bubble-top">
                            <span className="chat-sender font-bold">{m.sender}</span>
                            <span className="chat-time mono text-xs text-muted">{m.time}</span>
                          </div>
                          <p className="chat-text text-sm">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChatMessage} className="chat-input-form">
                      <input
                        type="text"
                        placeholder="Ask a doubt in live session…"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="cyber-btn cyber-btn--primary">
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="session-notes-box">
                    <h4 className="mono text-xs text-primary mb-2">KEY TAKEAWAYS &amp; FORMULAS</h4>
                    <ul className="notes-list text-sm">
                      <li>Scaled Attention: <code>softmax(QK^T / sqrt(d_k)) * V</code></li>
                      <li>Causal mask prevents future token leakage in autoregressive decoders.</li>
                      <li>Use AdamW optimizer with cosine learning rate schedule for transformer pre-training.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SCHOLAR PROFILE MODAL */}
      {/* ========================================================= */}
      {selectedScholar && (
        <div className="modal-backdrop" onClick={() => setSelectedScholar(null)}>
          <div className="scholar-profile-modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-amber">military_tech</span>
                <h3 className="modal-title">Scholar Profile Card</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedScholar(null)}>✕</button>
            </div>

            <div className="scholar-card-body">
              <div className="scholar-hero-row">
                <div
                  className="scholar-big-avatar mono"
                  style={{ background: `linear-gradient(135deg, ${selectedScholar.color} 0%, #6366f1 100%)` }}
                >
                  {selectedScholar.avatar}
                </div>
                <div>
                  <h2 className="scholar-name-large">{selectedScholar.name}</h2>
                  <span className="mono text-xs text-muted">@{selectedScholar.handle}</span>
                  <div className="scholar-badge-chip mono">{selectedScholar.badge}</div>
                </div>
              </div>

              <div className="scholar-metrics-row">
                <div className="scholar-metric-box glass-card">
                  <span className="mono text-xs text-muted">POINTS</span>
                  <strong className="mono text-cyan" style={{ fontSize: "20px" }}>{selectedScholar.points}</strong>
                </div>
                <div className="scholar-metric-box glass-card">
                  <span className="mono text-xs text-muted">CERTIFICATES</span>
                  <strong className="mono text-emerald" style={{ fontSize: "20px" }}>{selectedScholar.certs} Verified</strong>
                </div>
                <div className="scholar-metric-box glass-card">
                  <span className="mono text-xs text-muted">STUDY STREAK</span>
                  <strong className="mono text-amber" style={{ fontSize: "20px" }}>{selectedScholar.streak}</strong>
                </div>
              </div>

              <div className="scholar-action-btn-row">
                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary"
                  onClick={() => setSelectedScholar(null)}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CANCELLED WORKSHOP NOTICE POPUP */}
      {/* ========================================================= */}
      {cancelledSessionNotice && (
        <div className="modal-backdrop" onClick={() => setCancelledSessionNotice(null)}>
          <div className="cancel-notice-modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-amber">info</span>
                <h3 className="modal-title">Session Notice</h3>
              </div>
              <button className="close-btn" onClick={() => setCancelledSessionNotice(null)}>✕</button>
            </div>

            <div className="cancel-notice-body">
              <h4>{cancelledSessionNotice.title}</h4>
              <p className="text-muted text-sm my-2">{cancelledSessionNotice.cancelReason}</p>
              <div className="cyber-pill my-3">
                <span className="pulsing-dot" />
                <span>Next Scheduled Session: Friday 4:00 PM</span>
              </div>
              <button
                type="button"
                className="cyber-btn cyber-btn--primary"
                onClick={() => setCancelledSessionNotice(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
