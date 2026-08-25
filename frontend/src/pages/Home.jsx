import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Home.css";

export default function Home() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLearningStreams()
      .then(setStreams)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>Platform Design System</span>
          </div>

          <h1 className="home-hero__title gradient-text">
            Stellar Engineering &amp; Career Showcase
          </h1>

          <p className="home-hero__subtitle">
            Responsive multi-platform architecture built for high-performance career guidance, clinical case audits, semester roadmaps, and technical assessment across India.
          </p>

          <div className="home-hero__cta-row">
            <Link to="/quiz" className="cyber-btn cyber-btn--primary">
              <span className="material-symbols-outlined btn-icon">psychology</span>
              <span>Take 3-Min Career Quiz 🎯</span>
            </Link>
            <Link to="/engineering" className="cyber-btn cyber-btn--secondary">
              <span className="material-symbols-outlined btn-icon">terminal</span>
              <span>Engineering Command Center</span>
            </Link>
            <Link to="/medical" className="cyber-btn cyber-btn--medical">
              <span className="material-symbols-outlined btn-icon">health_and_safety</span>
              <span>Medical Universe 🩺</span>
            </Link>
          </div>

          {/* Telemetry Stats Strip */}
          <div className="home-stats-strip">
            <div className="stat-node">
              <span className="stat-number gradient-text">35+</span>
              <span className="stat-label mono">ENGINEERING &amp; MEDICAL BRANCHES</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-node">
              <span className="stat-number gradient-text">500+</span>
              <span className="stat-label mono">PRACTICE MCQ QUESTIONS</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-node">
              <span className="stat-number gradient-text">24</span>
              <span className="stat-label mono">NATIONAL ENTRANCES (JEE/NEET/CUET)</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-node">
              <span className="stat-number gradient-text">₹499</span>
              <span className="stat-label mono">LIFETIME PRO UNLOCK VIA RAZORPAY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Modules Section */}
      <section className="showcase-section">
        <div className="container">
          {/* Module 01: Engineering Branch Selection */}
          <article className="showcase-module">
            <div className="showcase-module__header">
              <span className="module-badge">MODULE 01</span>
              <h2>Engineering Branch Selection &amp; Roadmaps</h2>
            </div>

            <div className="showcase-grid">
              {/* Desktop Viewport Card */}
              <div className="viewport-card viewport-card--desktop">
                <div className="viewport-top-bar">
                  <div className="command-dots">
                    <span className="command-dot command-dot--red" />
                    <span className="command-dot command-dot--purple" />
                    <span className="command-dot command-dot--cyan" />
                  </div>
                  <span className="viewport-label mono">DESKTOP COMMAND VIEWPORT (1440PX)</span>
                </div>

                <div className="viewport-content-preview">
                  <div className="preview-cyber-hero">
                    <div className="preview-pill">
                      <span className="preview-dot" />
                      <span>LIVE ROADMAP TELEMETRY</span>
                    </div>
                    <h3>Computer Science &amp; AI Engineering</h3>
                    <p>8-Semester curriculum, 12 verified project blueprints, and high-frequency tech stacks.</p>
                    <div className="preview-tags">
                      <span className="tag-chip">Data Structures</span>
                      <span className="tag-chip">Distributed Systems</span>
                      <span className="tag-chip">LLM Fine-Tuning</span>
                      <span className="tag-chip">Docker / K8s</span>
                    </div>
                    <Link to="/engineering/cse" className="preview-action-btn">
                      Launch CSE Roadmap →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile Viewport Card */}
              <div className="viewport-card viewport-card--mobile">
                <div className="mobile-notch" />
                <div className="mobile-screen-content">
                  <div className="mobile-header-bar">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <span className="mono text-xs">BRANCH MATRIX</span>
                  </div>
                  <div className="mobile-branch-list">
                    <Link to="/engineering/cse" className="mobile-branch-item active">
                      <div className="branch-dot cse-dot" />
                      <div>
                        <strong>CSE &amp; AI/ML</strong>
                        <span>Very High Demand · ₹18L Avg</span>
                      </div>
                    </Link>
                    <Link to="/engineering/ece" className="mobile-branch-item">
                      <div className="branch-dot ece-dot" />
                      <div>
                        <strong>ECE &amp; VLSI</strong>
                        <span>High Demand · ₹14L Avg</span>
                      </div>
                    </Link>
                    <Link to="/engineering/mech" className="mobile-branch-item">
                      <div className="branch-dot mech-dot" />
                      <div>
                        <strong>Robotics &amp; Mech</strong>
                        <span>Moderate Demand · ₹10L Avg</span>
                      </div>
                    </Link>
                  </div>
                </div>
                <span className="viewport-label mono mobile-caption">MOBILE VIEWPORT (390PX)</span>
              </div>
            </div>
          </article>

          {/* Module 02: Career Explorer & Medical Universe */}
          <article className="showcase-module">
            <div className="showcase-module__header showcase-module__header--reverse">
              <span className="module-badge" style={{ color: "var(--tertiary)" }}>MODULE 02</span>
              <h2>Medical &amp; Clinical Health Sciences Universe</h2>
            </div>

            <div className="showcase-grid showcase-grid--reverse">
              {/* Mobile Viewport Card */}
              <div className="viewport-card viewport-card--mobile">
                <div className="mobile-notch" />
                <div className="mobile-screen-content">
                  <div className="mobile-header-bar">
                    <span className="material-symbols-outlined text-secondary">health_and_safety</span>
                    <span className="mono text-xs">CLINICAL STREAMS</span>
                  </div>
                  <div className="mobile-branch-list">
                    <Link to="/medical/mbbs" className="mobile-branch-item active">
                      <div className="branch-dot med-dot" />
                      <div>
                        <strong>MBBS Clinical</strong>
                        <span>4.5 Yrs + 1 Yr Rotary</span>
                      </div>
                    </Link>
                    <Link to="/medical/bds" className="mobile-branch-item">
                      <div className="branch-dot bds-dot" />
                      <div>
                        <strong>BDS Dental</strong>
                        <span>Conservative &amp; Surgery</span>
                      </div>
                    </Link>
                    <Link to="/medical/medical-pg" className="mobile-branch-item">
                      <div className="branch-dot pg-dot" />
                      <div>
                        <strong>Medical PG (MD/MS)</strong>
                        <span>Residency &amp; Super-Spec</span>
                      </div>
                    </Link>
                  </div>
                </div>
                <span className="viewport-label mono mobile-caption">MOBILE VIEWPORT (390PX)</span>
              </div>

              {/* Desktop Viewport Card */}
              <div className="viewport-card viewport-card--desktop">
                <div className="viewport-top-bar">
                  <div className="command-dots">
                    <span className="command-dot command-dot--cyan" />
                    <span className="command-dot command-dot--purple" />
                    <span className="command-dot command-dot--red" />
                  </div>
                  <span className="viewport-label mono">CLINICAL EXPLORER VIEWPORT (1440PX)</span>
                </div>

                <div className="viewport-content-preview viewport-content-preview--med">
                  <div className="preview-cyber-hero">
                    <div className="preview-pill preview-pill--cyan">
                      <span className="preview-dot" />
                      <span>PROF-WISE CLINICAL AUDITS</span>
                    </div>
                    <h3>MBBS &amp; Healthcare Specializations</h3>
                    <p>Pre-clinical Anatomy &amp; Physiology, Para-clinical Pathology, and Clinical hospital rotations.</p>
                    <div className="preview-tags">
                      <span className="tag-chip">Bedside Auscultation</span>
                      <span className="tag-chip">12-Lead ECG Analysis</span>
                      <span className="tag-chip">NEET-PG / USMLE Prep</span>
                      <span className="tag-chip">OSCE Case Vignettes</span>
                    </div>
                    <Link to="/medical" className="preview-action-btn preview-action-btn--cyan">
                      Explore Medical Universe →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Pathways Universe Grid */}
      <section className="pathways-universe-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="cyber-pill">
              <span className="pulsing-dot" />
              <span>POST-12TH CAREER COMPASS</span>
            </span>
            <h2 className="section-title">Explore All 5 Career Universes</h2>
            <p className="section-sub">
              Complete entrance syllabi, eligibility matrices, top college cutoffs, and verified professional milestones.
            </p>
          </div>

          {loading ? (
            <p className="mono loading-text">Loading pathways telemetry…</p>
          ) : (
            <div className="pathways-grid">
              {streams.map((s) => {
                const targetRoute =
                  s.id === "science"
                    ? "/engineering"
                    : s.id === "medical"
                    ? "/medical"
                    : `/learn#${s.id}`;

                return (
                  <Link to={targetRoute} className="pathway-card glass-card" key={s.id}>
                    <div className="pathway-card__glow-hover" />
                    <div className="pathway-card__header">
                      <h3>{s.name}</h3>
                      <span className="pathway-card__badge mono">ACTIVE</span>
                    </div>
                    <p className="pathway-card__groups mono">{s.groups.join(" · ")}</p>
                    <p className="pathway-card__desc">{s.courses.slice(0, 4).join(", ")}...</p>
                    <div className="pathway-card__footer">
                      <span className="pathway-card__cta">
                        {s.id === "science"
                          ? "Launch 6 Engineering Branches →"
                          : s.id === "medical"
                          ? "Launch 7 Medical Pathways →"
                          : "Launch Learning Pathway →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
