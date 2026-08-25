import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* Top Desktop & Mobile Header */}
      <header className="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="navbar__brand">
            <span className="material-symbols-outlined brand-icon">explore_nearby</span>
            <span className="brand-title">PATHWARD</span>
          </Link>

          <nav className="navbar__links">
            <NavLink to="/discover" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Discover
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Career Quiz 🎯
            </NavLink>
            <NavLink to="/engineering" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Engineering
            </NavLink>
            <NavLink to="/medical" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Medical 🩺
            </NavLink>
            <NavLink to="/learn" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Pathways
            </NavLink>
            <NavLink to="/mcq" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              MCQ Lab
            </NavLink>
            {user?.role === "instructor" && (
              <NavLink to="/instructor" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Instructor Studio
              </NavLink>
            )}
          </nav>

          <div className="navbar__actions">
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
                  {/* Half Moon Icon */}
                  <path
                    d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg className="half-moon-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {/* Half-filled Sun / Moon Theme Icon */}
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
                <Link to="/dashboard" className="navbar__user-link">
                  <div className="navbar__avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="navbar__username">
                    {user.name.split(" ")[0]}
                    {user.isPremium && <span className="pro-sparkle">★ PRO</span>}
                  </span>
                </Link>
                <button className="navbar__logout" onClick={handleLogout} title="Log out">
                  <span className="material-symbols-outlined logout-icon">logout</span>
                </button>
              </div>
            ) : (
              <div className="navbar__auth-group">
                <Link to="/login" className="navbar__login-link">
                  Log in
                </Link>
                <Link to="/signup" className="navbar__cta">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/discover" className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}>
          <span className="material-symbols-outlined">search</span>
          <span>Explorer</span>
        </NavLink>
        <NavLink to="/engineering" className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}>
          <span className="material-symbols-outlined">terminal</span>
          <span>Engineering</span>
        </NavLink>
        <NavLink to="/medical" className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}>
          <span className="material-symbols-outlined">health_and_safety</span>
          <span>Medical</span>
        </NavLink>
        <NavLink to="/mcq" className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}>
          <span className="material-symbols-outlined">biotech</span>
          <span>MCQ Lab</span>
        </NavLink>
        <button
          type="button"
          className="mobile-tab mobile-theme-toggle"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined">{isDark ? "dark_mode" : "light_mode"}</span>
          <span>{isDark ? "Dark" : "Light"}</span>
        </button>
        <NavLink to={user ? "/dashboard" : "/login"} className={({ isActive }) => (isActive ? "mobile-tab active" : "mobile-tab")}>
          <span className="material-symbols-outlined">account_circle</span>
          <span>{user ? "Profile" : "Log In"}</span>
        </NavLink>
      </nav>
    </>
  );
}
