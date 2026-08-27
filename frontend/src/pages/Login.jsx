import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("trainee"); // 'trainee' | 'instructor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        const redirectTo = location.state?.from || "/dashboard";
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDemoFill(demoRole) {
    if (demoRole === "instructor") {
      setRole("instructor");
      setEmail("instructor@backlox.edu");
      setPassword("password123");
    } else {
      setRole("trainee");
      setEmail("student@university.edu");
      setPassword("password123");
    }
  }

  return (
    <div className="login-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Main Login Area */}
      <main className="login-main">
        <div className="login-card-container">
          <div className="login-heading-group">
            <div className="cyber-pill mb-3">
              <span className="pulsing-dot" />
              <span>AUTHENTICATION GATEWAY</span>
            </div>
            <h1 className="login-title gradient-text">Sign in to Backlox</h1>
            <p className="login-sub">
              {role === "instructor"
                ? "Access Instructor Studio, publish courses in ₹ INR, and manage students."
                : "Explore personalized branch roadmaps, practice MCQ tests, and track career progress."}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${role === "trainee" ? "active" : ""}`}
              onClick={() => setRole("trainee")}
            >
              <span className="material-symbols-outlined">school</span>
              <span>Student / Scholar</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === "instructor" ? "active" : ""}`}
              onClick={() => setRole("instructor")}
            >
              <span className="material-symbols-outlined">co_present</span>
              <span>Instructor / Creator</span>
            </button>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form className="login-form glass-card" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={role === "instructor" ? "instructor@backlox.edu" : "student@university.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div className="form-label-split">
                <label htmlFor="password">Password</label>
                <a
                  href="#forgot"
                  className="auth-link text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Enter your registered email address or contact support@backlox.edu to reset password.");
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting
                ? "Authenticating…"
                : role === "instructor"
                ? "Sign in to Creator Studio →"
                : "Sign in to Learning Hub →"}
            </button>

            {/* Quick Fill Demo Helpers */}
            <div className="demo-accounts-row">
              <span className="mono text-xs text-muted">QUICK DEMO LOGIN:</span>
              <div className="demo-btns">
                <button type="button" className="demo-pill" onClick={() => handleDemoFill("student")}>
                  Student Demo
                </button>
                <button type="button" className="demo-pill" onClick={() => handleDemoFill("instructor")}>
                  Instructor Demo
                </button>
              </div>
            </div>
          </form>

          <div className="auth-switch">
            <span>Don't have an account? </span>
            <Link to={`/signup?role=${role}`} className="auth-link">
              Create a {role === "instructor" ? "Creator" : "Student"} account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
