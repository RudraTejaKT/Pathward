import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState("trainee"); // 'trainee' | 'instructor'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "instructor") {
      setRole("instructor");
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signup(name, email, password, role);
      if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Could not complete registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Main Registration Area */}
      <main className="login-main">
        <div className="login-card-container">
          <div className="login-heading-group">
            <div className="cyber-pill mb-3">
              <span className="pulsing-dot" />
              <span>{role === "instructor" ? "CREATOR PORTAL" : "STUDENT ONBOARDING"}</span>
            </div>
            <h1 className="login-title gradient-text">
              {role === "instructor" ? "Become an Instructor" : "Create Student Account"}
            </h1>
            <p className="login-sub">
              {role === "instructor"
                ? "Publish stream-aligned courses, upload video lectures, and monetize via Razorpay."
                : "Get personalized stream matches, full semester roadmaps, and practice MCQs."}
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
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder={role === "instructor" ? "Dr. / Prof. Aryan Sharma" : "Aryan Sharma"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={role === "instructor" ? "instructor@pathward.edu" : "student@university.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting
                ? "Creating Profile…"
                : role === "instructor"
                ? "Launch Instructor Studio →"
                : "Create Student Account →"}
            </button>
          </form>

          <div className="auth-switch">
            <span>Already registered? </span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
