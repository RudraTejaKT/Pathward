import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import PathwardLogo from "./PathwardLogo.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect active workspace mode
  const isStudentDashboard = location.pathname.startsWith("/dashboard");
  const isInstructorStudio = location.pathname.startsWith("/instructor");
  const isDedicatedWorkspace = isStudentDashboard || isInstructorStudio;

  // Disable navbar completely on student and instructor dashboards
  if (isStudentDashboard || isInstructorStudio) {
    return null;
  }

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

  function handleOpenStressMeter() {
    window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* Top Desktop & Header Bar */}
      <header className={`navbar ${isDedicatedWorkspace ? "navbar--workspace" : ""}`}>
        <div className="container navbar__inner">
          {/* Brand & Context Identifier */}
          <div className="navbar__brand-wrapper">
            <Link to="/" className="navbar__brand" title="Pathward — Career Universe">
              <PathwardLogo size="default" />
            </Link>

            {/* Context Badge for Dedicated Dashboards */}
            {isStudentDashboard && (
              <div className="navbar__context-group">
                <span className="navbar__workspace-pill navbar__workspace-pill--student">
                  <span className="workspace-dot" />
                  STUDENT PORTAL
                </span>
                <Link to="/discover" className="navbar__quick-return-btn" title="Explore Course Catalog">
                  <span className="material-symbols-outlined">explore</span>
                  <span>Catalog</span>
                </Link>
              </div>
            )}

            {isInstructorStudio && (
              <div className="navbar__context-group">
                <span className="navbar__workspace-pill navbar__workspace-pill--instructor">
                  <span className="workspace-dot" />
                  INSTRUCTOR STUDIO
                </span>
                <Link to="/discover" className="navbar__quick-return-btn" title="Return to Main Platform">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Platform</span>
                </Link>
              </div>
            )}
          </div>

          {/* Public Marketing Links — ONLY rendered when NOT on Student or Instructor Dashboard */}
          {!isDedicatedWorkspace && (
            <nav className="navbar__links">
              <NavLink to="/discover" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Discover
              </NavLink>
              <NavLink to="/quiz" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Career Assessment
              </NavLink>
              <NavLink to="/engineering" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Engineering
              </NavLink>
              <NavLink to="/medical" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Medical Sciences
              </NavLink>
              <NavLink to="/learn" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Pathways
              </NavLink>
              <NavLink to="/mcq" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                MCQ Practice
              </NavLink>
              {user?.role === "instructor" && (
                <NavLink to="/instructor" className={({ isActive }) => (isActive ? "nav-link active nav-link--creator" : "nav-link nav-link--creator")}>
                  Instructor Studio
                </NavLink>
              )}
            </nav>
          )}

          {/* Right Action Suite (Theme, Telemetry, User, Auth) */}
          <div className="navbar__actions">
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

            {/* Half Moon Theme Toggle Button */}
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

            {user ? (
              <div className="navbar__user-group">
                <Link to={user.role === "instructor" ? "/instructor" : "/dashboard"} className="navbar__user-link">
                  <div className="navbar__avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                  <span className="navbar__username">
                    {user.name ? user.name.split(" ")[0] : "Account"}
                    {user.role === "instructor" && <span className="instructor-pill mono">CREATOR</span>}
                    {user.isPremium && <span className="pro-pill mono">PRO</span>}
                  </span>
                </Link>
                <button type="button" onClick={handleLogout} className="navbar__logout-btn mono" title="Log out">
                  <span className="material-symbols-outlined logout-icon">logout</span>
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/login" className="cyber-btn cyber-btn--secondary">
                  Login
                </Link>
                <Link to="/signup" className="cyber-btn cyber-btn--primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation for Mobile screens (Suppressed on dedicated workspace dashboards) */}
      {!isDedicatedWorkspace && (
        <nav className="mobile-bottom-nav">
          <NavLink to="/discover" className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
            <span className="material-symbols-outlined">explore</span>
            <span>Discover</span>
          </NavLink>
          <NavLink to="/engineering" className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
            <span className="material-symbols-outlined">terminal</span>
            <span>Engineering</span>
          </NavLink>
          <NavLink to="/medical" className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
            <span className="material-symbols-outlined">health_and_safety</span>
            <span>Medical</span>
          </NavLink>
          <NavLink to="/learn" className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
            <span className="material-symbols-outlined">school</span>
            <span>Pathways</span>
          </NavLink>
          <NavLink to="/mcq" className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
            <span className="material-symbols-outlined">quiz</span>
            <span>MCQ Gym</span>
          </NavLink>
          {user && (
            <NavLink to={user.role === "instructor" ? "/instructor" : "/dashboard"} className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Portal</span>
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
}
