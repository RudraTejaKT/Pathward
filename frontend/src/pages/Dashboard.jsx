import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import VideoPlayer from "../components/VideoPlayer.jsx";
import "./Dashboard.css";

const LEADERBOARD_PODIUM = [
  {
    rank: 1,
    name: "Nabisha Khan",
    handle: "nabisha",
    points: "3,899",
    avatar: "NA",
    color: "#47d6ff",
    badge: "⚔️ Champion",
  },
  {
    rank: 2,
    name: "Chandrakesh Sharma",
    handle: "Chandrakesh S...",
    points: "2,430",
    avatar: "CS",
    color: "#f59e0b",
    badge: "🥈 Vanguard",
  },
  {
    rank: 3,
    name: "Mohammad Umar",
    handle: "Mohammad Um...",
    points: "2,306",
    avatar: "MO",
    color: "#10b981",
    badge: "🥉 Sentinel",
  },
];

const UPCOMING_SESSIONS = [
  { id: 1, title: "Live + Doubt Clarification", time: "Today - 1:00 PM", status: "cancelled" },
  { id: 2, title: "Live + Doubt (Deep Learning Systems)", time: "Today - 10:00 PM", status: "join" },
  { id: 3, title: "Live + Doubt (Distributed Cloud & Kafka)", time: "Wednesday - 1:00 PM", status: "join" },
  { id: 4, title: "Live + Doubt (Clinical Cardiology Triage)", time: "Wednesday - 10:00 PM", status: "join" },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Navigation Rail state
  const [activeNav, setActiveNav] = useState("home"); // 'home' | 'assignments' | 'gym' | 'lectures' | 'analytics'
  const [progress, setProgress] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Live session modal
  const [activeLiveSession, setActiveLiveSession] = useState(null);

  // Stats & Payments
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const [payError, setPayError] = useState(null);
  const [paySuccessMessage, setPaySuccessMessage] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.getProgressOverview(),
      api.getLatestAssessment(),
      api.getPaymentHistory(),
      api.getAssignments(),
    ])
      .then(([progressRes, assessmentRes, paymentRes, assignmentsRes]) => {
        if (progressRes.status === "fulfilled") setProgress(progressRes.value);
        if (assessmentRes.status === "fulfilled") setAssessment(assessmentRes.value);
        if (paymentRes.status === "fulfilled" && Array.isArray(paymentRes.value)) setPayments(paymentRes.value);
        if (assignmentsRes.status === "fulfilled" && Array.isArray(assignmentsRes.value)) setAssignments(assignmentsRes.value);
      })
      .finally(() => setLoading(false));
  }, []);

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
      setSubmissionUrl("");
      setSubmissionText("");
    } catch (err) {
      setSubmitSuccess(`⚠️ Submission notice: ${err.message || "Saved to local progress."}`);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="student-dashboard-root">
      {/* Background Ambient Cosmic Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      <div className="dashboard-shell-container">
        {/* ========================================================= */}
        {/* 1. LEFT CYBER VERTICAL NAVIGATION RAIL */}
        {/* ========================================================= */}
        <aside className="dashboard-left-rail glass-card">
          <div className="rail-top">
            <Link to="/" className="rail-logo" title="Pathward Universe">
              <span className="material-symbols-outlined rail-lightning-icon">bolt</span>
            </Link>

            <nav className="rail-nav-list">
              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "home" ? "active" : ""}`}
                onClick={() => setActiveNav("home")}
                title="Overview & Course Hub"
              >
                <span className="material-symbols-outlined">home</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "assignments" ? "active" : ""}`}
                onClick={() => setActiveNav("assignments")}
                title="Assignments & Case Studies"
              >
                <span className="material-symbols-outlined">assignment</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "gym" ? "active" : ""}`}
                onClick={() => navigate("/mcq")}
                title="MCQ Practice Gym"
              >
                <span className="material-symbols-outlined">sports_esports</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "lectures" ? "active" : ""}`}
                onClick={() => navigate("/courses/feat-1")}
                title="Video Masterclasses"
              >
                <span className="material-symbols-outlined">video_library</span>
              </button>

              <button
                type="button"
                className={`rail-nav-btn ${activeNav === "analytics" ? "active" : ""}`}
                onClick={() => setActiveNav("analytics")}
                title="Performance & Diagnostics"
              >
                <span className="material-symbols-outlined">insights</span>
              </button>

              <button
                type="button"
                className="rail-nav-btn"
                onClick={() => navigate("/discover")}
                title="Favorites & Catalog"
              >
                <span className="material-symbols-outlined">star</span>
              </button>

              <button
                type="button"
                className="rail-nav-btn"
                onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-stress-meter"))}
                title="Cognitive Stress Meter"
              >
                <span className="material-symbols-outlined">monitor_heart</span>
              </button>

              <button
                type="button"
                className="rail-nav-btn"
                onClick={() => navigate("/quiz")}
                title="Career Aptitude Assessment"
              >
                <span className="material-symbols-outlined">help_center</span>
              </button>
            </nav>
          </div>

          <div className="rail-bottom">
            <div className="coin-reward-pill mono" title="Scholar Energy Coins">
              <span className="coin-gift-icon">🎁</span>
              <span>1000</span>
            </div>

            <Link to="/dashboard" className="rail-user-avatar" title={user?.name || "Scholar"}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN DASHBOARD CONTENT AREA */}
        {/* ========================================================= */}
        <main className="dashboard-main-view">
          {/* Top Row Grid: Course Hero + Progress Report + Upcoming Sessions */}
          <section className="dash-top-grid">
            {/* Card 1: Active Course Hero Header */}
            <div className="dash-card hero-course-card glass-card">
              <div className="hero-card-header">
                <div>
                  <h2 className="hero-course-title">Data Visualization &amp; Reporting</h2>
                  <div className="hero-meta-row">
                    <span className="rating-pill mono">⭐ 4.5</span>
                    <span className="active-scholars-pill mono">👥 98 active scholars</span>
                  </div>
                </div>
              </div>

              <div className="hero-stat-boxes-row">
                <div className="hero-stat-box glass-card">
                  <div className="stat-icon-wrap">
                    <span className="material-symbols-outlined">track_changes</span>
                  </div>
                  <div>
                    <span className="stat-box-label mono text-xs text-muted">Total Points</span>
                    <strong className="stat-box-val mono">550</strong>
                  </div>
                </div>

                <div className="hero-stat-box glass-card">
                  <div className="stat-icon-wrap">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <span className="stat-box-label mono text-xs text-muted">Average Time</span>
                    <strong className="stat-box-val mono">3d 3h</strong>
                  </div>
                </div>
              </div>

              <div className="hero-action-row">
                <Link to="/courses/feat-1" className="cyber-btn cyber-btn--primary start-learning-btn">
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Start Learning</span>
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
                <span className="big-performance-num mono">6.97</span>
                <span className="performance-sub mono text-xs">Average Performance</span>
              </div>

              <div className="progress-metrics-list">
                <div className="progress-metric-row">
                  <span className="mono text-xs text-muted">Practice Gym:</span>
                  <span className="mono text-xs font-bold text-secondary">85% Complete</span>
                </div>
                <div className="progress-metric-row">
                  <span className="mono text-xs text-muted">Study Streak:</span>
                  <span className="mono text-xs font-bold text-amber">4 Days 🔥</span>
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

            {/* Card 3: Upcoming Live Sessions */}
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
                        <span className="session-cancelled-badge mono">Cancelled</span>
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
            {/* Card 4: Curriculum Modules & Assignments */}
            <div className="dash-card curriculum-timeline-card glass-card">
              <div className="card-top-title-row">
                <div className="timeline-title-group">
                  <span className="material-symbols-outlined text-primary">menu_book</span>
                  <h3 className="curriculum-track-name">DATA SCIENCE WITH GENERATIVE AI</h3>
                </div>
              </div>

              <div className="timeline-modules-stack">
                {/* Module 1 */}
                <div className="timeline-module-item">
                  <div className="timeline-marker mono">1</div>
                  <div className="timeline-body glass-card">
                    <div className="module-banner-thumb">
                      <div className="banner-badge-top">
                        <span className="completed-tag mono">Completed</span>
                      </div>
                      <div className="banner-code-preview">
                        <code>{`Using Spreadsheet Like An Expert\nimport pandas as pd\ndf = pd.read_csv("analytics.csv")`}</code>
                      </div>
                    </div>

                    <div className="module-meta-bar">
                      <span className="mono text-xs">📖 7 Modules</span>
                      <span className="mono text-xs text-emerald font-bold">100% Complete</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: "100%" }} />
                    </div>

                    <button
                      type="button"
                      className="view-assignments-btn mono text-xs"
                      onClick={() => {
                        setSelectedAssignment(assignments[0] || {
                          id: 1,
                          title: "Using Spreadsheet & Pandas Like An Expert",
                          description: "Clean the raw dataset, perform multi-level pivot table transformations, and output executive KPI visualizations.",
                          starter_code: "import pandas as pd\ndef transform_kpi(df):\n    pass"
                        });
                      }}
                    >
                      View Assignments
                    </button>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="timeline-module-item">
                  <div className="timeline-marker mono">2</div>
                  <div className="timeline-body glass-card">
                    <div className="module-banner-thumb">
                      <div className="banner-badge-top">
                        <span className="in-progress-tag mono">In Progress</span>
                      </div>
                      <div className="banner-code-preview">
                        <code>{`PyTorch Attention & Self-Attention\nclass ScaledDotProductAttention(nn.Module):`}</code>
                      </div>
                    </div>

                    <div className="module-meta-bar">
                      <span className="mono text-xs">📖 8 Modules</span>
                      <span className="mono text-xs text-primary font-bold">60% Complete</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: "60%" }} />
                    </div>

                    <button
                      type="button"
                      className="view-assignments-btn mono text-xs"
                      onClick={() => {
                        setSelectedAssignment(assignments[1] || {
                          id: 2,
                          title: "PyTorch Attention Matrix & Scaled Softmax",
                          description: "Implement multi-head attention projection and causal mask matrix from scratch.",
                          starter_code: "import torch\ndef multi_head_attention(q, k, v):\n    pass"
                        });
                      }}
                    >
                      Submit Assignment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Hall of Fame (Podium Leaderboard) */}
            <div className="dash-card hall-of-fame-card glass-card">
              <div className="card-top-title-row">
                <span className="card-eyebrow mono">HALL OF FAME</span>
                <span className="mono text-xs text-muted">&lt; #1 &gt;</span>
              </div>

              <div className="podium-stage-container">
                {/* 2nd Place (Left) */}
                <div className="podium-pillar pillar-second">
                  <div className="podium-avatar-wrap border-amber">
                    <span className="podium-avatar-text mono">CS</span>
                    <span className="rank-circle-badge bg-amber">2</span>
                  </div>
                  <span className="podium-name">{LEADERBOARD_PODIUM[1].handle}</span>
                  <span className="podium-points mono text-amber">{LEADERBOARD_PODIUM[1].points} pts</span>
                  <div className="podium-block block-2" />
                </div>

                {/* 1st Place (Center - Tallest) */}
                <div className="podium-pillar pillar-first">
                  <div className="podium-avatar-wrap border-cyan">
                    <span className="podium-avatar-text mono">NA</span>
                    <span className="rank-circle-badge bg-cyan">1</span>
                  </div>
                  <span className="podium-name font-bold">{LEADERBOARD_PODIUM[0].handle}</span>
                  <span className="podium-points mono text-cyan">{LEADERBOARD_PODIUM[0].points} pts</span>
                  <div className="podium-sword-badge">⚔️</div>
                  <div className="podium-block block-1" />
                </div>

                {/* 3rd Place (Right) */}
                <div className="podium-pillar pillar-third">
                  <div className="podium-avatar-wrap border-emerald">
                    <span className="podium-avatar-text mono">MO</span>
                    <span className="rank-circle-badge bg-emerald">3</span>
                  </div>
                  <span className="podium-name">{LEADERBOARD_PODIUM[2].handle}</span>
                  <span className="podium-points mono text-emerald">{LEADERBOARD_PODIUM[2].points} pts</span>
                  <div className="podium-block block-3" />
                </div>
              </div>
            </div>

            {/* Card 6: Hot Stats (July 2026 Metrics) */}
            <div className="dash-card hot-stats-card glass-card">
              <div className="card-top-title-row">
                <div>
                  <span className="card-eyebrow mono">HOT STATS</span>
                  <span className="hot-stats-month mono text-xs text-muted">July 2026</span>
                </div>
                <span className="mono text-xs text-muted">&lt; 1/12 &gt;</span>
              </div>

              <div className="hot-stats-grid">
                <div className="hot-stat-item">
                  <strong className="hot-stat-num mono">150</strong>
                  <span className="hot-stat-desc">Companies interviewed Scholars</span>
                </div>

                <div className="hot-stat-item">
                  <strong className="hot-stat-num mono">102</strong>
                  <span className="hot-stat-desc">Sharpened scholars placed</span>
                </div>

                <div className="hot-stat-item">
                  <strong className="hot-stat-num mono text-primary">18 LPA</strong>
                  <span className="hot-stat-desc">Highest package of month</span>
                </div>

                <div className="hot-stat-item">
                  <strong className="hot-stat-num mono text-secondary">349</strong>
                  <span className="hot-stat-desc">Interviews &amp; mock audits</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. ASSIGNMENT MODAL & SUBMISSION DRAWER */}
      {/* ========================================================= */}
      {selectedAssignment && (
        <div className="modal-backdrop" onClick={() => setSelectedAssignment(null)}>
          <div className="assignment-modal-card glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-primary">assignment</span>
                <div>
                  <h3 className="modal-title">{selectedAssignment.title}</h3>
                  <span className="mono text-xs text-muted">Due Date: {selectedAssignment.due_date || "July 30, 2026"} • Max Points: 100</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedAssignment(null)}>✕</button>
            </div>

            <div className="assignment-modal-body">
              <div className="assignment-desc-box">
                <p>{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.starter_code && (
                <div className="starter-code-box">
                  <span className="mono text-xs text-secondary">STARTER CODE TEMPLATE:</span>
                  <pre className="code-pre mono text-xs">{selectedAssignment.starter_code}</pre>
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
                    Cancel
                  </button>
                  <button type="submit" className="cyber-btn cyber-btn--primary" disabled={submitting}>
                    {submitting ? "Submitting Solution…" : "⚡ Submit for Evaluation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LIVE WORKSHOP JOIN MODAL */}
      {/* ========================================================= */}
      {activeLiveSession && (
        <div className="modal-backdrop" onClick={() => setActiveLiveSession(null)}>
          <div className="live-session-modal glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="pulsing-dot" />
                <h3 className="modal-title">{activeLiveSession.title}</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveLiveSession(null)}>✕</button>
            </div>

            <div className="live-session-body">
              <VideoPlayer
                videoUrl="https://www.youtube.com/embed/aircAruvnKk"
                title={activeLiveSession.title}
                onClose={() => setActiveLiveSession(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
