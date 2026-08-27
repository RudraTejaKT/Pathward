import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import PathTrail from "../components/PathTrail.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { getFallbackBranchDetail } from "../lib/branchDataFallback";
import { getBranchFreeVideos } from "../lib/branchVideos";
import "./BranchDetail.css";

const LEVEL_COLOR = {
  Beginner: "var(--teal)",
  Intermediate: "var(--amber)",
  Advanced: "var(--rust)",
};

export default function BranchDetail() {
  const { branchId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(() => getFallbackBranchDetail(branchId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState({}); // "roadmap_stage:Name" -> bool
  const [savingKey, setSavingKey] = useState(null);

  // Free Foundation Videos for chosen branch
  const freeVideos = getBranchFreeVideos(branchId);
  const [selectedFreeVideo, setSelectedFreeVideo] = useState(freeVideos[0] || null);

  useEffect(() => {
    const vids = getBranchFreeVideos(branchId);
    setSelectedFreeVideo(vids[0] || null);
  }, [branchId]);

  // AI Custom Roadmap Synthesizer State
  const [aiCustomTopic, setAiCustomTopic] = useState("");
  const [aiCustomRoadmap, setAiCustomRoadmap] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiVideoModal, setAiVideoModal] = useState(null);

  const isSubscribed = user && (user.isPremium || user.role === "instructor" || user.role === "admin");

  useEffect(() => {
    setData(getFallbackBranchDetail(branchId));
    setError(null);
    api
      .getBranchDetails(branchId)
      .then((res) => {
        if (res && res.branch) setData(res);
      })
      .catch(() => {
        // Fallback is already loaded cleanly
      });
  }, [branchId]);

  useEffect(() => {
    if (!user) {
      setProgress({});
      return;
    }
    api
      .getBranchProgress(branchId)
      .then((res) => setProgress(res.items))
      .catch(() => setProgress({}));
  }, [branchId, user]);

  async function toggleItem(itemType, itemKey) {
    if (!user) return;
    const key = `${itemType}:${itemKey}`;
    const nextValue = !progress[key];
    setSavingKey(key);
    setProgress((prev) => ({ ...prev, [key]: nextValue })); // optimistic
    try {
      await api.setProgress(branchId, itemType, itemKey, nextValue);
    } catch {
      setProgress((prev) => ({ ...prev, [key]: !nextValue })); // revert on failure
    } finally {
      setSavingKey(null);
    }
  }

  // Generate Custom Roadmap with AI
  async function handleGenerateCustomRoadmap(e) {
    if (e) e.preventDefault();
    if (!isSubscribed) {
      window.dispatchEvent(
        new CustomEvent("pathward:open-subscription", {
          detail: { plan: "pathward_pro" },
        })
      );
      return;
    }
    if (!aiCustomTopic.trim()) return;

    setAiGenerating(true);
    try {
      const res = await api.generateAiCourse({
        topic: aiCustomTopic.trim(),
        category: data?.branch?.name || "Engineering",
        streamId: data?.branch?.streamId || "science",
        level: "Advanced",
        modulesCount: 4,
      });
      const course = res?.data || res;
      setAiCustomRoadmap(course);
    } catch (err) {
      console.error("AI Roadmap generation error:", err);
      // Fallback synthesis ensures user is never blocked
      const fallbackCourse = {
        title: `${aiCustomTopic.trim()} Specialized Curriculum`,
        description: `Comprehensive 4-stage modular curriculum synthesized for ${aiCustomTopic.trim()} in ${data?.branch?.name || "Engineering"}.`,
        curriculum: [
          {
            id: 1,
            title: `Module 1: Foundations & Theoretical Principles of ${aiCustomTopic.trim()}`,
            description: "Core architectural frameworks, math formulations, and baseline environment configuration.",
            videoUrl: isMedical ? "https://www.youtube.com/embed/uBGl2BujkPQ" : "https://www.youtube.com/embed/3nB1Ntku06w",
            subtopics: ["Foundations & Setup", "Core Axioms & Equations", "Diagnostic Checkpoint"],
            checkpoint: "Complete foundational diagnostic quiz with 80%+ score."
          },
          {
            id: 2,
            title: "Module 2: Practical Implementation & Core Patterns",
            description: "Step-by-step pipeline design, state management, and algorithmic optimizations.",
            videoUrl: isMedical ? "https://www.youtube.com/embed/kYy36761x-c" : "https://www.youtube.com/embed/O5nskjZ_GoI",
            subtopics: ["Pipeline Construction", "Algorithmic Efficiency", "Error Handling"],
            checkpoint: "Construct end-to-end processing pipeline locally."
          },
          {
            id: 3,
            title: "Module 3: Advanced Optimization & Scaling Patterns",
            description: "Production latency profiling, stress testing, and real-world system integrations.",
            videoUrl: isMedical ? "https://www.youtube.com/embed/ob5U8zPbAX4" : "https://www.youtube.com/embed/aircAruvnKk",
            subtopics: ["Performance Tuning", "Integration Testing", "Security Protocols"],
            checkpoint: "Run stress testing and profiling benchmarks."
          },
          {
            id: 4,
            title: "Module 4: Capstone Industry Build & Demonstration",
            description: "End-to-end verified project implementation with portfolio documentation.",
            videoUrl: isMedical ? "https://www.youtube.com/embed/n5lX950s_t0" : "https://www.youtube.com/embed/LN0ucKNX0hc",
            subtopics: ["Full System Build", "Documentation", "Live Demo"],
            checkpoint: "Publish working codebase and documentation."
          }
        ]
      };
      setAiCustomRoadmap(fallbackCourse);
    } finally {
      setAiGenerating(false);
    }
  }

  if (loading) {
    return (
      <main className="container branch-detail__status">
        <p className="mono">Loading pathway roadmap…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container branch-detail__status">
        <p className="mono" style={{ color: "var(--rust)" }}>
          {error || "Pathway not found."}
        </p>
        <Link to="/engineering" className="branch-detail__back">
          ← Back to pathways
        </Link>
      </main>
    );
  }

  const { branch, roadmap, projects, jobs } = data;
  const isMedical = branch.streamId === "medical" || ["mbbs", "bds", "ayush", "pharm", "nursing", "allied", "medical-pg"].includes(branchId);

  const journeyStages = isMedical
    ? ["12th (PCB)", "Medical", branch.short, "Prof Roadmap", "Clinical Cases", "Healthcare Roles"]
    : ["12th grade", "Stream", "Branch", "Courses", "Projects", "IT Job"];

  const tabs = isMedical
    ? ["🎬 Free Orientation Videos", "Prof-wise Roadmap", "Clinical Case Studies & Audits", "Healthcare Specialties & Roles", "✨ AI Custom Roadmap"]
    : ["🎬 Free Orientation Videos", "Full Syllabus Roadmap", "Projects & Sandboxes", "Job Roles & Salaries", "✨ AI Custom Roadmap"];

  return (
    <main>
      <section className="branch-detail-hero">
        <div className="container">
          <PathTrail stages={journeyStages} activeIndex={3} />
          <Link
            to={isMedical ? "/medical" : "/engineering"}
            className="branch-detail__back"
          >
            ← Back to {isMedical ? "Medical Universe" : "All Engineering Branches"}
          </Link>
          <div className="branch-hero-tags-row">
            <span className="mono branch-detail__eyebrow">{branch.short}</span>
            <span className="free-preview-pill mono">✓ Free Orientation Videos Open</span>
          </div>
          <h1>{branch.name}</h1>
          <p className="branch-detail__tagline">{branch.tagline}</p>
        </div>
      </section>

      <section className="branch-detail-tabs">
        <div className="container branch-detail-tabs__row">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === idx ? "tab-btn--active" : ""}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {aiVideoModal && (
        <div className="modal-backdrop" onClick={() => setAiVideoModal(null)}>
          <div className="video-player-modal-wrap" onClick={(e) => e.stopPropagation()}>
            <VideoPlayer
              videoUrl={aiVideoModal.url}
              title={aiVideoModal.title}
              onClose={() => setAiVideoModal(null)}
            />
          </div>
        </div>
      )}

      <section className="branch-detail-content">
        <div className="container">
          {/* TAB 0: 🎬 FREE ORIENTATION & FOUNDATION VIDEOS */}
          {activeTab === 0 && (
            <div className="free-branch-video-theater">
              <div className="free-theater-top-banner glass-card">
                <div className="theater-badge-row">
                  <span className="free-tag mono">★ 100% FREE ACCESS</span>
                  <span className="video-count-tag mono">{freeVideos.length} Masterclasses Included</span>
                </div>
                <h2>Explore {branch.name} Through Curated Foundational Videos</h2>
                <p>
                  Get an authoritative, in-depth view of what studying {branch.short} involves — core mathematical frameworks, real-world applications, curriculum milestones, and industry demand before enrolling.
                </p>
              </div>

              {selectedFreeVideo && (
                <div className="free-theater-grid">
                  {/* Primary Video Player */}
                  <div className="theater-player-card glass-card">
                    <div className="theater-video-frame">
                      <iframe
                        src={selectedFreeVideo.videoUrl}
                        title={selectedFreeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="theater-video-details">
                      <div className="video-headline-row">
                        <h3>{selectedFreeVideo.title}</h3>
                        <span className="video-pill mono">{selectedFreeVideo.duration}</span>
                      </div>
                      <p className="video-instructor mono text-xs text-primary">
                        🎓 {selectedFreeVideo.instructor}
                      </p>
                      <p className="video-synopsis">{selectedFreeVideo.description}</p>
                      <div className="video-topics-wrap">
                        <span className="mono text-xs text-muted">KEY FOUNDATION CONCEPTS:</span>
                        <div className="topics-chips-list">
                          {selectedFreeVideo.topics?.map((t) => (
                            <span key={t} className="chip chip--accent">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Playlist Selector Column */}
                  <div className="theater-playlist-card glass-card">
                    <div className="playlist-heading mono">
                      <span>BRANCH ORIENTATION LECTURES</span>
                    </div>
                    <div className="playlist-scroll-list">
                      {freeVideos.map((vid, idx) => (
                        <div
                          key={vid.id || idx}
                          className={`playlist-card ${selectedFreeVideo.id === vid.id ? "playlist-card--active" : ""}`}
                          onClick={() => setSelectedFreeVideo(vid)}
                        >
                          <div className="playlist-card-marker mono">0{idx + 1}</div>
                          <div className="playlist-card-body">
                            <span className="playlist-badge mono">{vid.badge}</span>
                            <h4 className="playlist-title">{vid.title}</h4>
                            <div className="playlist-meta mono text-xs">
                              <span>⏱ {vid.duration}</span>
                              <span>•</span>
                              <span>{vid.instructor.split("·")[0]}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined playlist-icon">
                            {selectedFreeVideo.id === vid.id ? "volume_up" : "play_circle"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="playlist-upgrade-cta">
                      <p className="mono text-xs text-muted">Want full 4-year video libraries &amp; interactive practice labs?</p>
                      <button
                        type="button"
                        className="cyber-btn cyber-btn--primary w-full mt-1"
                        style={{ padding: "8px 14px", fontSize: "12.5px" }}
                        onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-subscription"))}
                      >
                        ⭐ Subscribe to Pathward Pro (₹499)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: ROADMAP (Gated with Pro Milestone Tracking) */}
          {activeTab === 1 && (
            <div className="roadmap-list">
              {!isSubscribed && (
                <div className="pro-milestone-gate-banner glass-card">
                  <div className="pro-gate-left">
                    <span className="material-symbols-outlined pro-lock-icon">lock_open</span>
                    <div>
                      <h4>Interactive Milestone Checkpoints &amp; Telemetry (Pro)</h4>
                      <p>
                        You are browsing the curriculum outline. Subscribe to <strong>Pathward Pro</strong> to check off completed syllabus stages, sync streaks to your Student Dashboard, and take practice quizzes.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary"
                    onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-subscription"))}
                  >
                    ⚡ Unlock Pro Tracking (₹499) →
                  </button>
                </div>
              )}

              {roadmap.map((stage, i) => {
                const key = `roadmap_stage:${stage.stage}`;
                const done = !!progress[key];
                return (
                  <div className={`roadmap-stage ${done ? "roadmap-stage--done" : ""}`} key={stage.stage}>
                    <div className="roadmap-stage__marker">
                      <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="roadmap-stage__body">
                      <div className="roadmap-stage__heading">
                        <h3>{stage.stage}</h3>
                        {isSubscribed ? (
                          <label className="progress-check mono">
                            <input
                              type="checkbox"
                              checked={done}
                              disabled={savingKey === key}
                              onChange={() => toggleItem("roadmap_stage", stage.stage)}
                            />
                            {done ? "Completed" : "Mark complete"}
                          </label>
                        ) : (
                          <button
                            type="button"
                            className="locked-check-btn mono text-xs"
                            onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-subscription"))}
                          >
                            🔒 Unlock Checkpoint
                          </button>
                        )}
                      </div>
                      <div className="roadmap-stage__group">
                        <p className="roadmap-stage__label mono">
                          {isMedical ? "CORE CLINICAL SUBJECTS" : "CORE SUBJECTS"}
                        </p>
                        <div className="roadmap-stage__chips">
                          {stage.subjects.map((s) => (
                            <span key={s} className="chip">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="roadmap-stage__group">
                        <p className="roadmap-stage__label mono">
                          {isMedical ? "CLINICAL & PRACTICAL COMPETENCIES" : "SKILLS TO LEARN"}
                        </p>
                        <div className="roadmap-stage__chips">
                          {stage.skillsToLearn.map((s) => (
                            <span key={s} className="chip chip--accent">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: PROJECTS & CLINICAL AUDITS */}
          {activeTab === 2 && (
            <div className="project-grid">
              {!isSubscribed && (
                <div className="pro-milestone-gate-banner glass-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="pro-gate-left">
                    <span className="material-symbols-outlined pro-lock-icon">code</span>
                    <div>
                      <h4>Verified Capstones &amp; Code Sandboxes (Pro)</h4>
                      <p>
                        Pathward Pro members receive starter code repositories, automated evaluation rubrics, and faculty portfolio reviews.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary"
                    onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-subscription", { detail: { plan: "pathward_pro" } }))}
                  >
                    ⚡ Unlock All Capstones →
                  </button>
                </div>
              )}

              {(!projects || projects.length === 0) ? (
                <div className="glass-card text-center" style={{ gridColumn: "1 / -1", padding: "40px" }}>
                  <p className="text-muted">No capstone projects listed for this branch yet.</p>
                </div>
              ) : (
                projects.map((p) => {
                  const key = `project:${p.title}`;
                  const done = !!progress[key];
                  const tags = p.stack || p.skills || [];
                  return (
                    <div className={`project-card ${done ? "project-card--done" : ""}`} key={p.title}>
                      <div className="project-card__top">
                        <span
                          className="project-card__level mono"
                          style={{ color: LEVEL_COLOR[p.level] || "var(--ink)" }}
                        >
                          {p.level}
                        </span>
                        {isSubscribed && (
                          <label className="progress-check mono">
                            <input
                              type="checkbox"
                              checked={done}
                              disabled={savingKey === key}
                              onChange={() => toggleItem("project", p.title)}
                            />
                            {done ? "Completed" : "Mark done"}
                          </label>
                        )}
                      </div>
                      <h3>{p.title}</h3>
                      <p className="project-card__desc">{p.description}</p>
                      <div className="project-card__tags">
                        {tags.map((s) => (
                          <span key={s} className="chip chip--sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: JOB ROLES & SALARIES */}
          {activeTab === 3 && (
            <div className="job-grid">
              {(!jobs || jobs.length === 0) ? (
                <div className="glass-card text-center" style={{ gridColumn: "1 / -1", padding: "40px" }}>
                  <p className="text-muted">No specific job roles listed for this branch yet.</p>
                </div>
              ) : (
                jobs.map((j) => {
                  const skillList = j.skills || j.skillsRequired || [];
                  const salaryBadge = j.salaryRangeIndia || (j.demand ? `Demand: ${j.demand}` : "High Growth");
                  return (
                    <div className="job-card" key={j.role}>
                      <div className="job-card__header">
                        <h3>{j.role}</h3>
                        <span className="job-card__salary mono">{salaryBadge}</span>
                      </div>
                      <div className="job-card__skills">
                        <p className="mono text-xs text-muted">KEY SKILLS &amp; TOOLS</p>
                        <div className="roadmap-stage__chips">
                          {skillList.map((s) => (
                            <span key={s} className="chip">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ✨ AI CUSTOM ROADMAP SYNTHESIZER */}
          {activeTab === 4 && (
            <div className="ai-branch-roadmap-container">
              {!isSubscribed && (
                <div className="pro-milestone-gate-banner glass-card mb-4">
                  <div className="pro-gate-left">
                    <span className="material-symbols-outlined pro-lock-icon">psychology</span>
                    <div>
                      <h4>✨ AI Syllabus Architect is a Pathward Pro Feature</h4>
                      <p>
                        Synthesize customized modular curriculums for electives, hackathons, and sub-specialties with curated video lectures and practical checkpoints.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary"
                    onClick={() => window.dispatchEvent(new CustomEvent("pathward:open-subscription"))}
                  >
                    ⭐ Upgrade to Pro (₹499) →
                  </button>
                </div>
              )}

              <div className="ai-branch-input-card glass-card">
                <div className="ai-branch-header">
                  <span className="ai-sparkle-pill mono">
                    <span>✨</span> AI SYLLABUS ARCHITECT
                  </span>
                  <h2>Synthesize Custom {branch.name} Learning Path</h2>
                  <p>
                    Targeting a specialized elective, hackathon topic, or clinical sub-specialty? Enter your focus area below to generate a modular curriculum with video masterclasses and checkpoints.
                  </p>
                </div>

                <form onSubmit={handleGenerateCustomRoadmap} className="ai-branch-form">
                  <div className="form-group">
                    <label className="mono text-xs">CUSTOM SPECIALIZATION / TOPIC</label>
                    <div className="ai-input-button-row">
                      <input
                        type="text"
                        required
                        placeholder={`e.g. ${
                          isMedical
                            ? "Interventional Cardiology & Catheterization Techniques"
                            : "Embedded Firmware & Real-Time Operating Systems (FreeRTOS)"
                        }`}
                        value={aiCustomTopic}
                        onChange={(e) => setAiCustomTopic(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="cyber-btn cyber-btn--primary"
                        disabled={aiGenerating || !aiCustomTopic.trim()}
                        title={!isSubscribed ? "Subscribe to Pathward Pro to synthesize custom paths" : "Synthesize custom modular curriculum"}
                      >
                        {aiGenerating ? "Synthesizing…" : "⚡ Synthesize Path"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Generating Animation */}
              {aiGenerating && (
                <div className="ai-branch-generating-box glass-card">
                  <div className="radar-circle" style={{ width: "60px", height: "60px" }} />
                  <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--primary)" }}>
                    psychology
                  </span>
                  <p className="mono text-sm">Structuring modular learning roadmap and curating video lectures…</p>
                </div>
              )}

              {/* Synthesized Results Stack */}
              {aiCustomRoadmap && (
                <div className="ai-synthesized-results-stack">
                  <div className="ai-results-banner glass-card">
                    <div>
                      <span className="ai-sparkle-pill mono">✨ AI GENERATED ROADMAP</span>
                      <h3 style={{ fontSize: "22px", margin: "8px 0" }}>{aiCustomRoadmap.title}</h3>
                      <p style={{ color: "var(--on-surface-variant)" }}>{aiCustomRoadmap.description}</p>
                    </div>
                  </div>

                  <div className="roadmap-list">
                    {aiCustomRoadmap.curriculum?.map((mod, mIdx) => (
                      <div className="roadmap-stage" key={mod.id || mIdx}>
                        <div className="roadmap-stage__marker">
                          <span className="mono">{String(mIdx + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="roadmap-stage__body">
                          <div className="roadmap-stage__heading">
                            <h3>{mod.title}</h3>
                            {mod.videoUrl && (
                              <button
                                type="button"
                                className="cyber-btn cyber-btn--secondary"
                                style={{ padding: "4px 12px", fontSize: "12px" }}
                                onClick={() => setAiVideoModal({ title: mod.title, url: mod.videoUrl })}
                              >
                                ▶ Watch Lecture
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", margin: "4px 0 10px" }}>
                            {mod.description}
                          </p>
                          <div className="roadmap-stage__group">
                            <p className="roadmap-stage__label mono">SUB-LESSONS &amp; PRACTICAL TOPICS</p>
                            <div className="roadmap-stage__chips">
                              {mod.lessons?.map((l) => (
                                <span key={l.title} className="chip">
                                  {l.title} ({l.duration})
                                </span>
                              ))}
                            </div>
                          </div>
                          {mod.checkpoint && (
                            <div className="roadmap-stage__group">
                              <p className="roadmap-stage__label mono">PRACTICAL CHECKPOINT</p>
                              <span className="chip chip--accent">{mod.checkpoint}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* AI Lecture Video Modal */}
      {aiVideoModal && (
        <div
          className="modal-backdrop"
          onClick={() => setAiVideoModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "800px",
              background: "#0d1018",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                {aiVideoModal.title}
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setAiVideoModal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: "10px", overflow: "hidden" }}>
                <iframe
                  src={aiVideoModal.url}
                  title={aiVideoModal.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
