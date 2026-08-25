import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import PathwardLogo from "./PathwardLogo.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect active dedicated workspace modes
  const isStudentDashboard = location.pathname.startsWith("/dashboard");
  const isInstructorStudio = location.pathname.startsWith("/instructor");
  const isDedicatedWorkspace = isStudentDashboard || isInstructorStudio;

  // Active Dropdown & MegaMenu State
  // 'disciplines' | 'practice' | 'academics' | 'workspaces' | 'user' | null
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Click outside to close desktop dropdowns
  const navRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time stress monitor status in Navbar
  const [stressData, setStressData] = useState({ score: 12, label: "Optimal Flow", color: "#22c55e" });

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

  // On student or instructor workspaces, render null since they have full-bleed custom command headers
  if (isStudentDashboard || isInstructorStudio) {
    return null;
  }

  function handleOpenStressMeter() {
    window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"));
  }

  function handleOpenOcti() {
    window.dispatchEvent(new CustomEvent("pathward:open-ai-chat"));
  }

  function handleLogout() {
    logout();
    setActiveMenu(null);
    navigate("/login");
  }

  function toggleMenu(menuKey) {
    setActiveMenu((prev) => (prev === menuKey ? null : menuKey));
  }

  return (
    <>
      <header className="navbar enterprise-navbar" ref={navRef}>
        <div className="container navbar__inner">
          {/* ========================================================= */}
          {/* 1. BRAND LOGO */}
          {/* ========================================================= */}
          <div className="navbar__brand-wrapper">
            <Link to="/" className="navbar__brand" title="Pathward — Career Universe">
              <PathwardLogo size="default" />
            </Link>
          </div>

          {/* ========================================================= */}
          {/* 2. ENTERPRISE NAVIGATION MENU & MEGA-MENU */}
          {/* ========================================================= */}
          <nav className="navbar__links enterprise-nav-links">
            {/* MEGA-MENU: Disciplines & Streams */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`enterprise-nav-btn ${activeMenu === "disciplines" ? "active" : ""}`}
                onClick={() => toggleMenu("disciplines")}
                aria-expanded={activeMenu === "disciplines"}
              >
                <span>Disciplines &amp; Branches</span>
                <span className="material-symbols-outlined nav-caret">
                  {activeMenu === "disciplines" ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </button>

              {activeMenu === "disciplines" && (
                <div className="mega-menu-panel glass-card animate-slide-up">
                  <div className="mega-menu-grid">
                    {/* Column 1: Engineering & Technology */}
                    <div className="mega-menu-col">
                      <div className="mega-col-header">
                        <span className="material-symbols-outlined col-icon text-indigo">engineering</span>
                        <div>
                          <h4 className="col-title">Engineering &amp; Tech (PCM)</h4>
                          <span className="mono text-xs text-muted">35+ Disciplines</span>
                        </div>
                      </div>
                      <div className="mega-links-list">
                        <Link to="/engineering/computer-science-and-engineering" className="mega-link-item">
                          <span className="mega-link-name">Computer Science &amp; AI</span>
                          <span className="mono text-xs text-secondary">₹14 - ₹38 LPA</span>
                        </Link>
                        <Link to="/engineering/electronics-and-communication-engineering" className="mega-link-item">
                          <span className="mega-link-name">Electronics &amp; Embedded (VLSI)</span>
                          <span className="mono text-xs text-secondary">₹12 - ₹28 LPA</span>
                        </Link>
                        <Link to="/engineering/robotics-and-automation" className="mega-link-item">
                          <span className="mega-link-name">Robotics &amp; Autonomous Systems</span>
                          <span className="mono text-xs text-secondary">₹15 - ₹32 LPA</span>
                        </Link>
                        <Link to="/engineering/aerospace-engineering" className="mega-link-item">
                          <span className="mega-link-name">Aerospace &amp; Satellite Systems</span>
                          <span className="mono text-xs text-secondary">₹12 - ₹30 LPA</span>
                        </Link>
                        <Link to="/engineering/mechanical-engineering" className="mega-link-item">
                          <span className="mega-link-name">Mechanical &amp; Mechatronics</span>
                          <span className="mono text-xs text-secondary">₹8 - ₹18 LPA</span>
                        </Link>
                        <Link to="/engineering" className="mega-view-all-link">
                          Explore All 35+ Engineering Branches →
                        </Link>
                      </div>
                    </div>

                    {/* Column 2: Medical & Clinical Sciences */}
                    <div className="mega-menu-col">
                      <div className="mega-col-header">
                        <span className="material-symbols-outlined col-icon text-teal">medical_services</span>
                        <div>
                          <h4 className="col-title">Medical &amp; Clinical (PCB)</h4>
                          <span className="mono text-xs text-muted">NEET &amp; PG Matrix</span>
                        </div>
                      </div>
                      <div className="mega-links-list">
                        <Link to="/medical/general-medicine-mbbs" className="mega-link-item">
                          <span className="mega-link-name">MBBS &amp; Clinical Surgery</span>
                          <span className="mono text-xs text-emerald">5.5 Yrs • NEET</span>
                        </Link>
                        <Link to="/medical/dental-surgery-bds" className="mega-link-item">
                          <span className="mega-link-name">Dental Surgery (BDS)</span>
                          <span className="mono text-xs text-emerald">5.0 Yrs • NEET</span>
                        </Link>
                        <Link to="/medical/pharmacy-and-pharmacology" className="mega-link-item">
                          <span className="mega-link-name">Pharmacy &amp; Drug Discovery</span>
                          <span className="mono text-xs text-emerald">4.0 Yrs • Clinical</span>
                        </Link>
                        <Link to="/medical/allied-health-and-radiology" className="mega-link-item">
                          <span className="mega-link-name">Allied Health &amp; Radiology</span>
                          <span className="mono text-xs text-emerald">3.5 Yrs • Imaging</span>
                        </Link>
                        <Link to="/medical/biotechnology-and-genomics" className="mega-link-item">
                          <span className="mega-link-name">Biotechnology &amp; Genomics</span>
                          <span className="mono text-xs text-emerald">4.0 Yrs • Genetics</span>
                        </Link>
                        <Link to="/medical" className="mega-view-all-link text-teal">
                          Explore Medical Universe →
                        </Link>
                      </div>
                    </div>

                    {/* Column 3: Commerce & Management */}
                    <div className="mega-menu-col">
                      <div className="mega-col-header">
                        <span className="material-symbols-outlined col-icon text-amber">account_balance</span>
                        <div>
                          <h4 className="col-title">Commerce, Law &amp; Finance</h4>
                          <span className="mono text-xs text-muted">FinTech &amp; Policy</span>
                        </div>
                      </div>
                      <div className="mega-links-list">
                        <Link to="/learn" className="mega-link-item">
                          <span className="mega-link-name">FinTech &amp; Algorithmic Trading</span>
                          <span className="mono text-xs text-amber">₹15 - ₹35 LPA</span>
                        </Link>
                        <Link to="/learn" className="mega-link-item">
                          <span className="mega-link-name">Corporate Law &amp; Mergers (M&amp;A)</span>
                          <span className="mono text-xs text-amber">5.0 Yrs • CLAT</span>
                        </Link>
                        <Link to="/learn" className="mega-link-item">
                          <span className="mega-link-name">Business Analytics &amp; Product MBA</span>
                          <span className="mono text-xs text-amber">₹18 - ₹42 LPA</span>
                        </Link>
                        <Link to="/learn" className="mega-link-item">
                          <span className="mega-link-name">Chartered Accountancy (CA/CFA)</span>
                          <span className="mono text-xs text-amber">ICAI Accredited</span>
                        </Link>
                      </div>
                    </div>

                    {/* Column 4: Featured Career Spotlight Banner */}
                    <div className="mega-menu-spotlight glass-card">
                      <div className="spotlight-pill mono">
                        <span className="pulsing-dot" />
                        <span>AI CAREER RADAR</span>
                      </div>
                      <h4 className="spotlight-title">Not sure which branch matches your aptitude?</h4>
                      <p className="spotlight-desc">
                        Take our 15-question psychometric &amp; analytical assessment to receive personalized stream matches with CTC projections.
                      </p>
                      <Link to="/quiz" className="cyber-btn cyber-btn--primary spotlight-btn">
                        <span>Launch Career Diagnostic Quiz →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN 2: Practice & Competitive Gym */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`enterprise-nav-btn ${activeMenu === "practice" ? "active" : ""}`}
                onClick={() => toggleMenu("practice")}
                aria-expanded={activeMenu === "practice"}
              >
                <span>Practice Gym</span>
                <span className="material-symbols-outlined nav-caret">
                  {activeMenu === "practice" ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </button>

              {activeMenu === "practice" && (
                <div className="dropdown-panel glass-card animate-slide-up">
                  <div className="dropdown-menu-list">
                    <Link to="/mcq" className="dropdown-item">
                      <div className="drop-icon-box bg-cyan">
                        <span className="material-symbols-outlined">quiz</span>
                      </div>
                      <div className="drop-item-text">
                        <strong>National Aptitude Gym</strong>
                        <span>Quant, Logical, Verbal &amp; CS Questions</span>
                      </div>
                    </Link>

                    <Link to="/mcq" className="dropdown-item">
                      <div className="drop-icon-box bg-indigo">
                        <span className="material-symbols-outlined">speed</span>
                      </div>
                      <div className="drop-item-text">
                        <strong>Placement Speed Challenge</strong>
                        <span>TCS NQT, Infosys, CAT, GATE &amp; Bank PO</span>
                      </div>
                    </Link>

                    <Link to="/quiz" className="dropdown-item">
                      <div className="drop-icon-box bg-amber">
                        <span className="material-symbols-outlined">psychology</span>
                      </div>
                      <div className="drop-item-text">
                        <strong>AI Career Aptitude Assessment</strong>
                        <span>15-Question Comprehensive Stream Diagnostic</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN 3: Academics & Courses */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`enterprise-nav-btn ${activeMenu === "academics" ? "active" : ""}`}
                onClick={() => toggleMenu("academics")}
                aria-expanded={activeMenu === "academics"}
              >
                <span>Courses &amp; Roadmaps</span>
                <span className="material-symbols-outlined nav-caret">
                  {activeMenu === "academics" ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </button>

              {activeMenu === "academics" && (
                <div className="dropdown-panel glass-card animate-slide-up">
                  <div className="dropdown-menu-list">
                    <Link to="/discover" className="dropdown-item">
                      <div className="drop-icon-box bg-purple">
                        <span className="material-symbols-outlined">play_circle</span>
                      </div>
                      <div className="drop-item-text">
                        <strong>Course Masterclass Catalog</strong>
                        <span>1080p DRM Protected HD Video Lessons</span>
                      </div>
                    </Link>

                    <Link to="/learn" className="dropdown-item">
                      <div className="drop-icon-box bg-emerald">
                        <span className="material-symbols-outlined">alt_route</span>
                      </div>
                      <div className="drop-item-text">
                        <strong>4-Year Semester Roadmaps</strong>
                        <span>Curriculum, Milestone Checkpoints &amp; Capstones</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT LINK: Instructor Studio (if instructor) or Platform Hub */}
            {user?.role === "instructor" ? (
              <Link to="/instructor" className="enterprise-nav-btn enterprise-nav-btn--creator">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>co_present</span>
                <span>Instructor Studio</span>
              </Link>
            ) : (
              <Link to="/learn" className="enterprise-nav-btn">
                <span>Learning Hub</span>
              </Link>
            )}
          </nav>

          {/* ========================================================= */}
          {/* 3. RIGHT ACTION SUITE (Telemetry, Octi, Theme, Auth) */}
          {/* ========================================================= */}
          <div className="navbar__actions enterprise-nav-actions">
            {/* Live Cognitive Stress Telemetry Pill */}
            <button
              type="button"
              className="navbar-stress-pill"
              onClick={handleOpenStressMeter}
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

            {/* Octi AI Trigger Pill */}
            <button
              type="button"
              className="octi-nav-trigger-pill mono"
              onClick={handleOpenOcti}
              title="Octi: Your Academic Companion & Doubt Solver"
            >
              <span className="octi-emoji">🎓</span>
              <span>Octi</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Clean Light Theme" : "Switch to Dark Cosmic Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <svg
                  className="half-moon-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg
                  className="half-moon-icon sun"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Authenticated User Menu OR Guest Buttons */}
            {user ? (
              <div className="nav-dropdown-wrapper">
                <button
                  type="button"
                  className="user-profile-pill"
                  onClick={() => toggleMenu("user")}
                  title={`Logged in as ${user.name}`}
                >
                  <div className="navbar__avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <span className="user-pill-name mono">
                    {user.name ? user.name.split(" ")[0] : "Scholar"}
                  </span>
                  <span className="material-symbols-outlined nav-caret">
                    {activeMenu === "user" ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {activeMenu === "user" && (
                  <div className="user-dropdown-panel glass-card animate-slide-up">
                    <div className="user-dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="mono text-xs text-muted">{user.email}</span>
                      <div className="mt-1">
                        <span className={`status-pill mono ${user.role === "instructor" ? "status-pill--graded" : "status-pill--pending"}`}>
                          {user.role === "instructor" ? "Instructor / Faculty" : "Verified Scholar"}
                        </span>
                      </div>
                    </div>

                    <div className="user-dropdown-links">
                      {user.role === "instructor" ? (
                        <Link to="/instructor" className="user-drop-link">
                          <span className="material-symbols-outlined">dashboard</span>
                          <span>Instructor Studio</span>
                        </Link>
                      ) : (
                        <Link to="/dashboard" className="user-drop-link">
                          <span className="material-symbols-outlined">dashboard</span>
                          <span>Student Dashboard</span>
                        </Link>
                      )}

                      <Link to="/mcq" className="user-drop-link">
                        <span className="material-symbols-outlined">sports_esports</span>
                        <span>Practice Gym</span>
                      </Link>

                      <Link to="/discover" className="user-drop-link">
                        <span className="material-symbols-outlined">explore</span>
                        <span>Explore Catalog</span>
                      </Link>

                      <button type="button" onClick={handleLogout} className="user-drop-link text-error">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/login" className="cyber-btn cyber-btn--secondary mono text-xs">
                  Sign In
                </Link>
                <Link to="/signup" className="cyber-btn cyber-btn--primary mono text-xs">
                  Get Started →
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              aria-label="Toggle Mobile Navigation"
            >
              <span className="material-symbols-outlined">
                {mobileDrawerOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MOBILE OFF-CANVAS ENTERPRISE DRAWER */}
        {/* ========================================================= */}
        {mobileDrawerOpen && (
          <div className="mobile-enterprise-drawer glass-card animate-slide-up">
            <div className="mobile-drawer-body">
              {/* Disciplines Accordion */}
              <div className="mobile-accordion-item">
                <button
                  type="button"
                  className="mobile-accordion-header"
                  onClick={() => setMobileAccordion((prev) => (prev === "disciplines" ? null : "disciplines"))}
                >
                  <span className="material-symbols-outlined text-indigo">engineering</span>
                  <strong>Disciplines &amp; Branches</strong>
                  <span className="material-symbols-outlined accordion-caret">
                    {mobileAccordion === "disciplines" ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {mobileAccordion === "disciplines" && (
                  <div className="mobile-accordion-content">
                    <Link to="/engineering" className="mobile-sub-link">
                      All 35+ Engineering Branches (PCM)
                    </Link>
                    <Link to="/medical" className="mobile-sub-link">
                      Medical &amp; Clinical Sciences (PCB)
                    </Link>
                    <Link to="/learn" className="mobile-sub-link">
                      Commerce, FinTech &amp; Corporate Law
                    </Link>
                  </div>
                )}
              </div>

              {/* Practice Gym Accordion */}
              <div className="mobile-accordion-item">
                <button
                  type="button"
                  className="mobile-accordion-header"
                  onClick={() => setMobileAccordion((prev) => (prev === "practice" ? null : "practice"))}
                >
                  <span className="material-symbols-outlined text-cyan">sports_esports</span>
                  <strong>Practice &amp; Mocks</strong>
                  <span className="material-symbols-outlined accordion-caret">
                    {mobileAccordion === "practice" ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {mobileAccordion === "practice" && (
                  <div className="mobile-accordion-content">
                    <Link to="/mcq" className="mobile-sub-link">
                      National Aptitude Gym
                    </Link>
                    <Link to="/quiz" className="mobile-sub-link">
                      Career Diagnostic Quiz
                    </Link>
                  </div>
                )}
              </div>

              {/* Courses & Academics Accordion */}
              <div className="mobile-accordion-item">
                <button
                  type="button"
                  className="mobile-accordion-header"
                  onClick={() => setMobileAccordion((prev) => (prev === "courses" ? null : "courses"))}
                >
                  <span className="material-symbols-outlined text-purple">play_circle</span>
                  <strong>Courses &amp; Roadmaps</strong>
                  <span className="material-symbols-outlined accordion-caret">
                    {mobileAccordion === "courses" ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {mobileAccordion === "courses" && (
                  <div className="mobile-accordion-content">
                    <Link to="/discover" className="mobile-sub-link">
                      Masterclass Catalog
                    </Link>
                    <Link to="/learn" className="mobile-sub-link">
                      Semester Roadmaps &amp; Syllabi
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              {user?.role === "instructor" ? (
                <Link to="/instructor" className="mobile-direct-link">
                  <span className="material-symbols-outlined text-amber">co_present</span>
                  <strong>Instructor Studio</strong>
                </Link>
              ) : user ? (
                <Link to="/dashboard" className="mobile-direct-link">
                  <span className="material-symbols-outlined text-indigo">dashboard</span>
                  <strong>Student Dashboard</strong>
                </Link>
              ) : null}

              {/* Auth actions on mobile */}
              <div className="mobile-drawer-auth mt-3">
                {user ? (
                  <button type="button" onClick={handleLogout} className="cyber-btn cyber-btn--secondary w-full">
                    Logout (@{user.name})
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to="/login" className="cyber-btn cyber-btn--secondary" style={{ flex: 1 }}>
                      Sign In
                    </Link>
                    <Link to="/signup" className="cyber-btn cyber-btn--primary" style={{ flex: 1 }}>
                      Get Started →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
