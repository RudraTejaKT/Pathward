import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import PathTrail from "../components/PathTrail.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { getFallbackBranchDetail } from "../lib/branchDataFallback";
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

  // AI Custom Roadmap Synthesizer State
  const [aiCustomTopic, setAiCustomTopic] = useState("");
  const [aiCustomRoadmap, setAiCustomRoadmap] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiVideoModal, setAiVideoModal] = useState(null);

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
      setAiCustomRoadmap(res);
    } catch (err) {
      console.error(err);
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
    ? ["Prof-wise Roadmap", "Clinical Case Studies & Audits", "Healthcare Specialties & Roles", "✨ AI Custom Roadmap"]
    : ["Roadmap", "Projects", "Job Roles", "✨ AI Custom Roadmap"];

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
          <p className="mono branch-detail__eyebrow">{branch.short}</p>
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
          {/* TAB 0: ROADMAP */}
          {activeTab === 0 && (
            <div className="roadmap-list">
              {!user && (
                <p className="mono progress-hint">
                  <Link to="/login">Log in</Link> to check off modules as you complete them.
                </p>
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
                        {user && (
                          <label className="progress-check mono">
                            <input
                              type="checkbox"
                              checked={done}
                              disabled={savingKey === key}
                              onChange={() => toggleItem("roadmap_stage", stage.stage)}
                            />
                            {done ? "Completed" : "Mark complete"}
                          </label>
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

          {/* TAB 1: PROJECTS & CLINICAL AUDITS */}
          {activeTab === 1 && (
            <div className="project-grid">
              {!user && (
                <p className="mono progress-hint">
                  <Link to="/login">Log in</Link> to check off case studies as you review/conduct them.
                </p>
              )}
              {projects.map((p) => {
                const key = `project:${p.title}`;
                const done = !!progress[key];
                return (
                  <div className={`project-card ${done ? "project-card--done" : ""}`} key={p.title}>
                    <div className="project-card__top">
                      <span
                        className="project-card__level mono"
                        style={{ color: LEVEL_COLOR[p.level] || "var(--ink)" }}
                      >
                        {p.level}
                      </span>
                      {user && (
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
                      {p.skills.map((s) => (
                        <span key={s} className="chip chip--sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: JOB ROLES & SALARIES */}
          {activeTab === 2 && (
            <div className="job-grid">
              {jobs.map((j) => (
                <div className="job-card" key={j.role}>
                  <div className="job-card__header">
                    <h3>{j.role}</h3>
                    <span className="job-card__salary mono">{j.salaryRangeIndia}</span>
                  </div>
                  <div className="job-card__skills">
                    <p className="mono text-xs text-muted">KEY SKILLS &amp; TOOLS</p>
                    <div className="roadmap-stage__chips">
                      {j.skillsRequired.map((s) => (
                        <span key={s} className="chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ✨ AI CUSTOM ROADMAP SYNTHESIZER */}
          {activeTab === 3 && (
            <div className="ai-branch-roadmap-container">
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
    </main>
  );
}
