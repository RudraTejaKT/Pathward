import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import PathTrail from "../components/PathTrail.jsx";
import "./BranchDetail.css";

const LEVEL_COLOR = {
  Beginner: "var(--teal)",
  Intermediate: "var(--amber)",
  Advanced: "var(--rust)",
};

export default function BranchDetail() {
  const { branchId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState({}); // "roadmap_stage:Name" -> bool
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getBranchDetails(branchId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
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
    ? ["Prof-wise Roadmap", "Clinical Case Studies & Audits", "Healthcare Specialties & Roles"]
    : ["Roadmap", "Projects", "Job Roles"];

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
                        style={{ color: LEVEL_COLOR[p.level] || "var(--teal)" }}
                      >
                        ● {p.level}
                      </span>
                      {user && (
                        <label className="progress-check mono">
                          <input
                            type="checkbox"
                            checked={done}
                            disabled={savingKey === key}
                            onChange={() => toggleItem("project", p.title)}
                          />
                          {done ? (isMedical ? "Completed" : "Built") : (isMedical ? "Mark complete" : "Mark built")}
                        </label>
                      )}
                    </div>
                    <h3>{p.title}</h3>
                    <p className="project-card__desc">{p.description}</p>
                    <div className="roadmap-stage__chips">
                      {p.stack.map((s) => (
                        <span key={s} className="chip mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: JOB ROLES & SPECIALTIES */}
          {activeTab === 2 && (
            <div className="job-list">
              {jobs.map((j) => (
                <div className="job-card" key={j.role}>
                  <div className="job-card__top">
                    <h3>{j.role}</h3>
                    <span className="job-card__demand mono">{j.demand}</span>
                  </div>
                  <div className="roadmap-stage__chips">
                    {j.skills.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
