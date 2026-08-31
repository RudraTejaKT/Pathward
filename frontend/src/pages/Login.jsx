import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("trainee"); // 'trainee' | 'instructor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forgot / Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
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
      setPassword("Password123!");
    } else {
      setRole("trainee");
      setEmail("student@university.edu");
      setPassword("Password123!");
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      const res = await api.resetPassword(resetEmail, resetNewPassword);
      setResetSuccess(res?.message || res?.data?.message || "Password updated successfully!");
      setEmail(resetEmail);
      setPassword(resetNewPassword);
      setSuccessMsg("Password reset successfully. You can now click Sign In.");
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess(null);
      }, 1500);
    } catch (err) {
      setResetError(err.message || "Failed to reset password. Please check your email.");
    } finally {
      setResetLoading(false);
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

          {error && (
            <div className="auth-error animate-fade-in">
              <div>⚠️ {error}</div>
              {error.toLowerCase().includes("invalid") && (
                <button
                  type="button"
                  className="auth-link text-xs mt-1"
                  style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", color: "inherit" }}
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetModal(true);
                  }}
                >
                  Forgot your password? Click here to reset it.
                </button>
              )}
            </div>
          )}

          {successMsg && <div className="auth-success animate-fade-in" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>✓ {successMsg}</div>}

          <form className="login-form glass-card" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={role === "instructor" ? "e.g. professor@university.edu" : "e.g. student@college.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div className="form-label-split">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="auth-link text-xs"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setResetEmail(email);
                    setResetError(null);
                    setResetSuccess(null);
                    setShowResetModal(true);
                  }}
                >
                  Forgot Password?
                </button>
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

      {/* Interactive Reset Password Modal */}
      {showResetModal && (
        <div className="subscription-modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="subscription-modal-panel glass-card animate-scale-up" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="subscription-modal-close" onClick={() => setShowResetModal(false)}>✕</button>
            <div className="text-center mb-4">
              <div className="cyber-pill mb-2">
                <span>🔐 ACCOUNT RECOVERY</span>
              </div>
              <h2 className="gradient-text" style={{ fontSize: "1.5rem" }}>Reset Your Password</h2>
              <p className="text-muted text-xs">Enter your registered email and choose a new password (min 8 chars).</p>
            </div>

            {resetError && <div className="auth-error mb-3">⚠️ {resetError}</div>}
            {resetSuccess && <div className="auth-success mb-3" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px" }}>✓ {resetSuccess}</div>}

            <form onSubmit={handleResetPasswordSubmit} className="login-form">
              <div className="form-field">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ktrudrateja@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Create New Password (min 8 characters)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit mt-2" disabled={resetLoading}>
                {resetLoading ? "Updating Password…" : "Save New Password & Continue →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
