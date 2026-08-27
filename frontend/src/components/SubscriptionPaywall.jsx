import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./SubscriptionPaywall.css";

export default function SubscriptionPaywall({ title = "Pro Scholar Subscription Required", subtitle }) {
  const { user } = useAuth();

  function handleOpenSubscribeModal() {
    window.dispatchEvent(new CustomEvent("backlox:open-subscription"));
  }

  return (
    <main className="paywall-container">
      <div className="paywall-card glass-card animate-scale-up">
        {/* Lock & Glow Icon */}
        <div className="paywall-icon-wrap">
          <div className="paywall-icon-ring" />
          <span className="material-symbols-outlined paywall-lock-icon">lock</span>
        </div>

        <div className="pro-sparkle-pill mono">
          <span>✨</span> PRO EXCLUSIVE WORKSPACE
        </div>

        <h1 className="paywall-title gradient-text">{title}</h1>
        <p className="paywall-desc">
          {subtitle ||
            "This advanced curriculum, practice lab, and telemetry suite is exclusive to Backlox Pro scholars. Basic branch orientation videos and the front page remain completely free."}
        </p>

        {/* What You Unlock Grid */}
        <div className="paywall-perks-grid">
          <div className="perk-item">
            <span className="material-symbols-outlined perk-icon text-indigo">checklist</span>
            <div>
              <strong>Multi-Year Roadmaps</strong>
              <p>Full syllabus checkpoint tracking and completion milestones.</p>
            </div>
          </div>

          <div className="perk-item">
            <span className="material-symbols-outlined perk-icon text-teal">sports_esports</span>
            <div>
              <strong>MCQ Practice Gym</strong>
              <p>Competitive exam test batteries (JEE, NEET, GATE, CAT, USMLE).</p>
            </div>
          </div>

          <div className="perk-item">
            <span className="material-symbols-outlined perk-icon text-amber">psychology</span>
            <div>
              <strong>✨ AI Syllabus Architect</strong>
              <p>Synthesize specialized courses and generate lecture flashcards.</p>
            </div>
          </div>

          <div className="perk-item">
            <span className="material-symbols-outlined perk-icon text-purple">school</span>
            <div>
              <strong>Full Course Masterclasses</strong>
              <p>HD video lectures, starter code, and verified capstone projects.</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="paywall-actions">
          <button
            type="button"
            className="cyber-btn cyber-btn--primary paywall-cta-btn"
            onClick={handleOpenSubscribeModal}
          >
            ⚡ Subscribe to Backlox Pro (from ₹299) →
          </button>

          <div className="paywall-secondary-links">
            <Link to="/engineering" className="cyber-btn cyber-btn--secondary">
              🎬 Watch Free Branch Videos
            </Link>
            <Link to="/" className="paywall-home-link mono text-xs">
              ← Return to Front Page
            </Link>
          </div>
        </div>

        {!user && (
          <div className="paywall-auth-hint mono text-xs text-muted mt-3">
            Already have a Pro subscription? <Link to="/login" className="text-primary font-bold">Sign In here</Link>
          </div>
        )}
      </div>
    </main>
  );
}
