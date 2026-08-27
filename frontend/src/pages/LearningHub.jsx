import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import "./LearningHub.css";

const DEFAULT_STREAM_VIDEOS = {
  science: "https://www.youtube.com/embed/kU_t-wJ-t9c",
  medical: "https://www.youtube.com/embed/uBGl2BujkPQ",
  commerce: "https://www.youtube.com/embed/HXV3zeQKqGY",
  arts: "https://www.youtube.com/embed/nu_pCVPKzTk",
  vocational: "https://www.youtube.com/embed/IPvYjXCsTg8",
};

const DEFAULT_STREAMS = [
  { id: "science", name: "Engineering & Technology (PCM)", groups: ["MPC", "PCMB"], courses: ["B.Tech CSE", "AI & Data Science", "ECE", "Robotics"] },
  { id: "medical", name: "Medical & Health Sciences (PCB)", groups: ["BiPC", "PCMB"], courses: ["MBBS", "BDS", "AYUSH", "Pharm.D", "B.Sc Nursing"] },
  { id: "commerce", name: "Commerce & FinTech (MEC / CEC)", groups: ["MEC", "CEC"], courses: ["CA", "CS", "CMA", "B.Com FinTech", "BBA Finance"] },
  { id: "arts", name: "Humanities, Law & Media (HEC)", groups: ["HEC", "Arts"], courses: ["BA LLB (5-Yr)", "Psychology", "Journalism", "Economics"] },
  { id: "vocational", name: "Vocational & Applied Tech", groups: ["Applied"], courses: ["Polytechnic Diploma", "B.Voc", "Industrial Automation"] },
];

export default function LearningHub() {
  const { user } = useAuth();
  const [streams, setStreams] = useState(DEFAULT_STREAMS);
  const [exams, setExams] = useState([]);
  const [talks, setTalks] = useState([]);
  const [selected, setSelected] = useState("science");
  const [pathway, setPathway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState({});

  // Working Video Player State
  const [playingVideo, setPlayingVideo] = useState(null); // { title, url }

  useEffect(() => {
    Promise.all([api.getLearningStreams(), api.getExams(), api.getTedTalks()])
      .then(([s, e, t]) => {
        if (s && s.length > 0) setStreams(s);
        setExams(e || []);
        setTalks(t || []);
        return api.getPathway("science");
      })
      .then((pw) => {
        if (pw) {
          setPathway(pw);
          if (pw?.modules?.length) {
            setExpandedModule(pw.modules[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .getPathway(selected)
      .then((pw) => {
        setPathway(pw);
        if (pw?.modules?.length) {
          setExpandedModule(pw.modules[0].id);
        }
      })
      .catch(() => setPathway(null));
  }, [selected]);

  function toggleCheckpoint(checkpointKey) {
    setCompletedCheckpoints((prev) => ({
      ...prev,
      [checkpointKey]: !prev[checkpointKey],
    }));
  }

  function handlePlayModuleVideo(module) {
    const videoUrl = DEFAULT_STREAM_VIDEOS[selected] || DEFAULT_STREAM_VIDEOS.science;
    setPlayingVideo({
      title: `${pathway?.stream?.name || "Curriculum"} — ${module.title}`,
      url: videoUrl,
    });
  }

  return (
    <div className="learn-page-root">
      {/* Background Cosmic Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Hero Header Section */}
      <header className="learn-hero-header">
        <div className="container learn-hero-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>MODULE 03 · STREAM &amp; CURRICULUM UNIVERSE</span>
          </div>

          <h1 className="learn-hero-title gradient-text">
            Interactive Stream Pathways &amp; Curriculum
          </h1>

          <p className="learn-hero-sub">
            Drill into structured syllabus modules across Science (PCM/PCB), Commerce, Humanities, and Technical Vocational tracks. Master core concepts with video lectures, checkpoints, and entrance exam mappings.
          </p>

          <div className="learn-hero-actions">
            <Link to="/engineering" className="cyber-btn cyber-btn--primary">
              <span className="material-symbols-outlined">memory</span>
              <span>Engineering Universe (6 Branches)</span>
            </Link>

            <Link to="/medical" className="cyber-btn cyber-btn--secondary">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>Medical &amp; Clinical Sciences (7 Tracks)</span>
            </Link>

            <Link to="/quiz" className="cyber-btn cyber-btn--medical">
              <span className="material-symbols-outlined">psychology</span>
              <span>Aptitude Match Quiz</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Video Masterclass Player Modal */}
      {playingVideo && (
        <div className="modal-backdrop" onClick={() => setPlayingVideo(null)}>
          <div className="video-player-modal-wrap" onClick={(e) => e.stopPropagation()}>
            <VideoPlayer
              videoUrl={playingVideo.url}
              title={playingVideo.title}
              onClose={() => setPlayingVideo(null)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="learn-main-area">
        <div className="container learn-container">
          {/* Section 1: Choose Stream */}
          <section className="learn-section">
            <div className="learn-section-header">
              <h2>1. Select Class 12 Academic Stream</h2>
              <p>Switch between streams to explore syllabus roadmaps and specialized degree options.</p>
            </div>

            <div className="learn-streams-scroll-row">
              {streams.map((s) => {
                const isActive = selected === s.id;
                return (
                  <article
                    key={s.id}
                    className={`learn-stream-card glass-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelected(s.id)}
                  >
                    <div className="stream-card-top">
                      <span className="stream-groups-mono mono">{s.groups.join(" • ")}</span>
                      {isActive && <span className="stream-active-badge mono">Active</span>}
                    </div>
                    <h3 className="stream-name-text">{s.name}</h3>
                    <p className="stream-summary-desc">{s.courses.join(" • ")}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Section 2: Interactive Modules */}
          {pathway && (
            <section className="learn-section">
              <div className="learn-section-header">
                <h2>2. Interactive Learning Modules: {pathway.stream.name}</h2>
                <p>Click any module to launch video lectures, review syllabus concepts, and complete milestones.</p>
              </div>

              <div className="learn-accordion-stack">
                {pathway.modules.map((m, idx) => {
                  const isExpanded = expandedModule === m.id;
                  const isFree = idx === 0 || user?.isPremium;

                  return (
                    <div key={m.id} className={`learn-module-box glass-card ${isExpanded ? "open" : ""}`}>
                      <div
                        className="learn-module-summary"
                        onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                      >
                        <div className="learn-module-left">
                          <div className="module-tag-row">
                            <span className="module-pos-badge mono">MODULE {m.position}</span>
                            {isFree ? (
                              <span className="preview-badge mono">Free Preview</span>
                            ) : (
                              <span className="unlocked-badge mono">Pro Track</span>
                            )}
                          </div>
                          <h3 className="module-title">{m.title}</h3>
                        </div>
                        <div className="learn-module-right mono text-xs">
                          <span>⏱️ {m.duration || "4 Weeks"}</span>
                          <span className="module-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      <p className="module-desc">{m.description}</p>

                      {isExpanded && (
                        <div className="module-expanded-panel">
                          {/* Play Video Trigger */}
                          <div className="module-video-banner">
                            <button
                              type="button"
                              className="module-play-lecture-btn"
                              onClick={() => handlePlayModuleVideo(m)}
                            >
                              <span className="material-symbols-outlined play-icon-sm">play_circle</span>
                              <span>Play 1080p Video Lecture ({m.title})</span>
                            </button>
                          </div>

                          {m.topics && m.topics.length > 0 && (
                            <div className="panel-block">
                              <h4 className="mono text-xs text-primary">📖 CORE SYLLABUS CONCEPTS</h4>
                              <ul className="topics-bullet-list">
                                {m.topics.map((t) => (
                                  <li key={t}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {m.checkpoints && m.checkpoints.length > 0 && (
                            <div className="panel-block">
                              <h4 className="mono text-xs text-secondary">✅ PRACTICE CHECKPOINTS &amp; MILESTONES</h4>
                              <div className="checkpoints-col">
                                {m.checkpoints.map((cp, cIdx) => {
                                  const cpKey = `${m.id}-cp-${cIdx}`;
                                  const isDone = !!completedCheckpoints[cpKey];

                                  return (
                                    <label key={cp} className={`checkpoint-box ${isDone ? "done" : ""}`}>
                                      <input
                                        type="checkbox"
                                        checked={isDone}
                                        onChange={() => toggleCheckpoint(cpKey)}
                                      />
                                      <span>{cp}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {m.resources && m.resources.length > 0 && (
                            <div className="panel-block">
                              <h4 className="mono text-xs text-muted">📚 RECOMMENDED TEXTS &amp; PAPERS</h4>
                              <div className="resources-tags-row">
                                {m.resources.map((r) => (
                                  <span key={r} className="resource-tag-pill mono">
                                    🔗 {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="module-bottom-cta-row">
                            <Link to="/mcq" className="cyber-btn cyber-btn--primary">
                              Practice Questions in MCQ Lab →
                            </Link>
                            {selected === "science" && (
                              <Link to="/engineering" className="cyber-btn cyber-btn--secondary">
                                Explore Engineering Roadmaps →
                              </Link>
                            )}
                            {selected === "medical" && (
                              <Link to="/medical" className="cyber-btn cyber-btn--secondary">
                                Explore Medical Roadmaps →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Career Families Grid */}
              <div className="learn-section-header" style={{ marginTop: "48px" }}>
                <h2>3. Career Families in {pathway.stream.name}</h2>
                <p>Major degree specializations and career trajectories available after Class 12.</p>
              </div>
              <div className="learn-families-grid">
                {pathway.careerFamilies.map((f) => (
                  <article className="family-card glass-card" key={f.id}>
                    <span className="family-after-tag mono">{f.after.join(" • ")}</span>
                    <h3 className="family-title">{f.name}</h3>
                    <p className="family-branches-text">{f.branches.join(" • ")}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Competitive Entrance Exams */}
          <section className="learn-section">
            <div className="learn-section-header">
              <h2>4. Competitive Entrance Exams Directory</h2>
              <p>National, state-level, and specialized entrance examinations across India.</p>
            </div>
            <div className="learn-exams-grid">
              {exams.map((e) => (
                <article className="learn-exam-card glass-card" key={e.id}>
                  <span className="exam-cat-tag mono">{e.category}</span>
                  <h3 className="exam-name">{e.name}</h3>
                  <p className="learn-exam-desc">{e.description}</p>
                  <div className="learn-exam-subjects">
                    {e.subjects.map((sub) => (
                      <span key={sub} className="exam-subj-pill mono">{sub}</span>
                    ))}
                  </div>
                  <Link to="/mcq" className="exam-practice-link mono">
                    Practice {e.name} Questions →
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Section 5: TED Talks Masterclasses */}
          <section className="learn-section">
            <div className="learn-section-header">
              <h2>5. Communication &amp; Domain Masterclasses (TED Talks)</h2>
              <p>Improve English fluency, technical presentation, and strategic critical thinking.</p>
            </div>
            <div className="ted-talks-stack">
              {talks.map((t) => (
                <div
                  className="ted-talk-card glass-card"
                  key={t.url}
                  onClick={() => setPlayingVideo({ title: `${t.title} — ${t.speaker}`, url: t.url })}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <span className="ted-level-tag mono">{t.level}</span>
                    <h3 className="ted-title">{t.title}</h3>
                    <p className="ted-speaker">Speaker: {t.speaker}</p>
                  </div>
                  <button className="ted-play-btn" title="Watch Video">
                    <span className="material-symbols-outlined">play_circle</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}