import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function selectRole(role) {
    setSelectedRole(role);
    setError(null);
  }

  function resetRole() {
    setSelectedRole(null);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <div className="auth-register-shell">
        <header className="auth-topbar">
          <div className="auth-brand">EduVault LMS</div>
          <div className="auth-help">Help Center</div>
        </header>

        <div className="auth-register-card">
          <div className="auth-register-header">
            <h1>Create your account</h1>
            <p>Select your role to get started with EduVault.</p>
          </div>

          {!selectedRole ? (
            <div className="auth-role-grid">
              <button
                type="button"
                className="auth-role-card"
                onClick={() => selectRole("student")}
                aria-label="Register as student"
              >
                <div className="auth-role-icon">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div className="auth-role-title">I am a Student</div>
                <div className="auth-role-copy">Access courses and track progress.</div>
              </button>

              <button
                type="button"
                className="auth-role-card"
                onClick={() => selectRole("instructor")}
                aria-label="Register as instructor"
              >
                <div className="auth-role-icon">
                  <span className="material-symbols-outlined">swipe_vertical</span>
                </div>
                <div className="auth-role-title">I am an Instructor</div>
                <div className="auth-role-copy">Create courses and manage students.</div>
              </button>
            </div>
          ) : (
            <div className="auth-form-panel">
              <div className="auth-form-header">
                <h2>{selectedRole === "student" ? "Register as Student" : "Register as Instructor"}</h2>
                <button type="button" className="auth-back-link" onClick={resetRole}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Change Role
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.edu"
                    required
                  />
                </div>

                {selectedRole === "instructor" && (
                  <div className="auth-field">
                    <label htmlFor="institution">
                      Institution/Organization <span>(Optional)</span>
                    </label>
                    <input
                      id="institution"
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. State University"
                    />
                  </div>
                )}

                <div className="auth-dual-grid">
                  <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="auth-submit-wrap">
                  <button className="auth-submit" type="submit" disabled={submitting}>
                    {submitting ? "Creating account…" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="auth-signin-link">
            <Link to="/login">
              Already have an account? <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
