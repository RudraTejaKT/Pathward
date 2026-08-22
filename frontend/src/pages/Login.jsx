import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-register-shell">
        <header className="auth-topbar">
          <div className="auth-brand">EduVault LMS</div>
          <div className="auth-help">Help Center</div>
        </header>

        <div className="auth-register-card auth-login-card">
          <div className="auth-register-header">
            <h1>EduVault LMS</h1>
            <p>Sign in to your account</p>
          </div>

          <div className="auth-role-switch" role="tablist" aria-label="Account type">
            <button
              type="button"
              className={`auth-role-button ${role === "student" ? "auth-role-button--active" : ""}`}
              onClick={() => setRole("student")}
              aria-pressed={role === "student"}
            >
              Student
            </button>
            <button
              type="button"
              className={`auth-role-button ${role === "instructor" ? "auth-role-button--active" : ""}`}
              onClick={() => setRole("instructor")}
              aria-pressed={role === "instructor"}
            >
              Instructor
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <form className="auth-form auth-login-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.edu"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="auth-inline-row">
              <label className="auth-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="auth-forgot-link">Forgot Password?</a>
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-signin-link auth-signup-link">
            <Link to="/signup">
              Don&apos;t have an account? <span>Sign up</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
