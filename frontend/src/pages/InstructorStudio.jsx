import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import "./InstructorStudio.css";

const AI_TOPIC_PRESETS = [
  "Generative AI & LLM Transformer Architecture",
  "Clinical Cardiology & 12-Lead ECG Mastery",
  "Autonomous EV & Robotics ROS2 Systems",
  "Distributed Cloud Architecture & Kubernetes",
  "Quantitative Finance & Algorithmic Trading",
  "Constitutional Law & Corporate Mergers (M&A)",
];

export default function InstructorStudio() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  // Create Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Software & AI Systems",
    stream_id: "science",
    price: 499,
  });
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Add Module Form State
  const [moduleForm, setModuleForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    resourceUrl: "",
    position: 1,
    file: null,
  });
  const [addingModule, setAddingModule] = useState(false);

  // AI Course Generator State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("Software & AI Systems");
  const [aiStream, setAiStream] = useState("science");
  const [aiLevel, setAiLevel] = useState("Advanced");
  const [aiModulesCount, setAiModulesCount] = useState(4);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(0); // 0: Input, 1: Generating, 2: Preview
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [aiPublishing, setAiPublishing] = useState(false);

  // Video preview in studio
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    if (user && ["instructor", "admin"].includes(user.role)) {
      Promise.all([api.getInstructorCourses(), api.getLearningStreams()])
        .then(([c, s]) => {
          setCourses(c || []);
          setStreams(s || []);
          if (c && c.length > 0) {
            setModuleForm((prev) => ({ ...prev, courseId: c[0].id }));
          }
        })
        .catch((e) => {
          setMsg(e.message);
          setMsgType("error");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  async function handleCreateCourse(e) {
    e.preventDefault();
    setMsg(null);
    setCreatingCourse(true);
    try {
      await api.createCourse(courseForm);
      setMsg(`Course "${courseForm.title}" published successfully!`);
      setMsgType("success");
      setCourseForm({
        title: "",
        description: "",
        category: "Software & AI Systems",
        stream_id: "science",
        price: 499,
      });
      const updated = await api.getInstructorCourses();
      setCourses(updated);
      if (updated.length > 0) {
        setModuleForm((prev) => ({ ...prev, courseId: updated[0].id }));
      }
    } catch (err) {
      setMsg(err.message || "Failed to publish course.");
      setMsgType("error");
    } finally {
      setCreatingCourse(false);
    }
  }

  async function handleAddModule(e) {
    e.preventDefault();
    setMsg(null);
    if (!moduleForm.courseId) {
      setMsg("Please select a target course.");
      setMsgType("error");
      return;
    }
    if (!moduleForm.title) {
      setMsg("Module title is required.");
      setMsgType("error");
      return;
    }

    setAddingModule(true);
    try {
      if (moduleForm.file) {
        const fd = new FormData();
        fd.append("moduleFile", moduleForm.file);
        fd.append("title", moduleForm.title);
        fd.append("description", moduleForm.description);
        fd.append("videoUrl", moduleForm.videoUrl);
        fd.append("position", moduleForm.position);
        await api.uploadModule(moduleForm.courseId, fd);
      } else {
        await api.addModule(moduleForm.courseId, {
          title: moduleForm.title,
          description: moduleForm.description,
          videoUrl: moduleForm.videoUrl,
          resourceUrl: moduleForm.resourceUrl,
          position: moduleForm.position,
        });
      }

      setMsg(`Module "${moduleForm.title}" attached to course.`);
      setMsgType("success");
      setModuleForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        videoUrl: "",
        resourceUrl: "",
        file: null,
      }));
      const updated = await api.getInstructorCourses();
      setCourses(updated);
    } catch (err) {
      setMsg(err.message || "Failed to add module.");
      setMsgType("error");
    } finally {
      setAddingModule(false);
    }
  }

  // Handle AI Course Synthesis
  async function handleGenerateAiCourse(e) {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    setAiStep(1);

    try {
      const res = await api.generateAiCourse({
        topic: aiPrompt.trim(),
        category: aiCategory,
        streamId: aiStream,
        level: aiLevel,
        modulesCount: aiModulesCount,
      });

      setGeneratedCourse(res);
      setAiStep(2); // Show preview
    } catch (err) {
      setMsg(err.message || "AI synthesis failed. Try another prompt.");
      setMsgType("error");
      setAiStep(0);
    } finally {
      setAiGenerating(false);
    }
  }

  // Publish AI Generated Course to Live Database
  async function handlePublishAiCourse() {
    if (!generatedCourse) return;
    setAiPublishing(true);

    try {
      await api.publishAiCourse(generatedCourse);
      setMsg(`✨ AI Course "${generatedCourse.title}" published with ${generatedCourse.curriculum?.length} modules!`);
      setMsgType("success");
      setIsAiModalOpen(false);
      setAiStep(0);
      setGeneratedCourse(null);
      setAiPrompt("");

      // Refresh instructor courses list
      const updated = await api.getInstructorCourses();
      setCourses(updated);
    } catch (err) {
      setMsg(err.message || "Failed to publish AI course.");
      setMsgType("error");
    } finally {
      setAiPublishing(false);
    }
  }

  if (!user || !["instructor", "admin"].includes(user.role)) {
    return (
      <div className="instructor-studio-root">
        <main className="container studio-denied-view">
          <div className="denied-card glass-card">
            <span className="material-symbols-outlined denied-icon">lock</span>
            <h2>Instructor Studio Access Required</h2>
            <p>
              You are signed in as a student. To publish stream-aligned courses, upload video lectures, and monetize via Razorpay, create or switch to an Instructor account.
            </p>
            <div className="denied-actions">
              <Link to="/signup?role=instructor" className="cyber-btn cyber-btn--primary">
                Create Instructor Profile →
              </Link>
              <Link to="/login" className="cyber-btn cyber-btn--secondary">
                Switch Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="instructor-studio-root">
      {/* Background Cosmic Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Header Banner with AI Generator Callout */}
      <header className="studio-header">
        <div className="container studio-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>INSTRUCTOR &amp; CREATOR CONSOLE</span>
          </div>

          <div className="studio-header-title-row">
            <div>
              <h1 className="studio-title gradient-text">Creator Studio &amp; Course Publisher</h1>
              <p className="studio-sub">
                Publish high-yield curriculum pathways, upload video lectures, and synthesize full courses with our AI Curriculum Architect.
              </p>
            </div>

            {/* AI Generator CTA Trigger Button */}
            <button
              type="button"
              className="cyber-btn cyber-btn--primary ai-generator-trigger-btn"
              onClick={() => {
                setIsAiModalOpen(true);
                setAiStep(0);
              }}
            >
              <span className="sparkle-icon">✨</span>
              <span>AI Course Generator</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container studio-main">
        {msg && (
          <div className={`studio-alert ${msgType === "error" ? "studio-alert--error" : "studio-alert--success"}`}>
            <span>{msgType === "error" ? "⚠️" : "✓"}</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Video Player Modal in Studio */}
        {previewVideo && (
          <div className="modal-backdrop" onClick={() => setPreviewVideo(null)}>
            <div className="video-player-modal-wrap" onClick={(e) => e.stopPropagation()}>
              <VideoPlayer
                videoUrl={previewVideo.url}
                title={previewVideo.title}
                onClose={() => setPreviewVideo(null)}
              />
            </div>
          </div>
        )}

        {/* Studio Grid: Create Course / Manage Modules */}
        <div className="studio-grid">
          {/* Left: Create Course & Telemetry */}
          <div className="studio-col-left">
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">post_add</span>
                <div>
                  <h2 className="card-title">1. Publish New Course</h2>
                  <span className="mono text-xs text-muted">Set metadata, stream mapping &amp; pricing</span>
                </div>
              </div>

              <form onSubmit={handleCreateCourse} className="studio-form">
                <div className="form-group">
                  <label className="mono text-xs">COURSE TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Machine Learning & Neural Transformers"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">SYLLABUS DESCRIPTION &amp; ABSTRACT</label>
                  <textarea
                    rows={3}
                    placeholder="Describe target concepts, tools covered, and learning outcomes..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="mono text-xs">DOMAIN CATEGORY</label>
                    <input
                      type="text"
                      placeholder="e.g. Software & AI Systems"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">TARGET STREAM</label>
                    <select
                      value={courseForm.stream_id}
                      onChange={(e) => setCourseForm({ ...courseForm, stream_id: e.target.value })}
                    >
                      {streams.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="mono text-xs">COURSE PRICING (INR)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="499"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  />
                </div>

                <button type="submit" className="cyber-btn cyber-btn--primary w-full" disabled={creatingCourse}>
                  {creatingCourse ? "Publishing to Universe…" : "⚡ Publish Course to Catalog"}
                </button>
              </form>
            </section>
          </div>

          {/* Right: Add Modules & Video Lectures */}
          <div className="studio-col-right">
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">video_call</span>
                <div>
                  <h2 className="card-title">2. Attach Modules &amp; Video Lectures</h2>
                  <span className="mono text-xs text-muted">Upload 1080p video or stream links</span>
                </div>
              </div>

              <form onSubmit={handleAddModule} className="studio-form">
                <div className="form-group">
                  <label className="mono text-xs">TARGET COURSE</label>
                  <select
                    value={moduleForm.courseId}
                    onChange={(e) => setModuleForm({ ...moduleForm, courseId: e.target.value })}
                  >
                    {courses.length === 0 && <option value="">No courses yet — create one first</option>}
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.module_count || 0} modules)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="mono text-xs">MODULE TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Module 1: Scaled Dot-Product & Self-Attention"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">MODULE DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this module's topics..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">1080P VIDEO STREAM URL (YOUTUBE / DIRECT MP4)</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                    value={moduleForm.videoUrl}
                    onChange={(e) => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                  />
                </div>

                <button type="submit" className="cyber-btn cyber-btn--secondary w-full" disabled={addingModule}>
                  {addingModule ? "Attaching Module…" : "＋ Attach Module to Course"}
                </button>
              </form>
            </section>
          </div>
        </div>

        {/* Existing Courses Catalog Preview */}
        <section className="studio-existing-courses">
          <div className="section-header-row">
            <h2>Your Published Courses ({courses.length})</h2>
            <span className="mono text-xs text-muted">Active in Trainee Discover Directory</span>
          </div>

          <div className="studio-courses-grid">
            {courses.length === 0 ? (
              <div className="empty-courses-card glass-card">
                <span className="material-symbols-outlined empty-icon">school</span>
                <h3>No courses published yet</h3>
                <p>Use the form above or click the <strong>✨ AI Course Generator</strong> to create your first course!</p>
              </div>
            ) : (
              courses.map((c) => (
                <article className="studio-course-card glass-card" key={c.id}>
                  <div className="course-card-top">
                    <span className="course-cat-tag mono">{c.category}</span>
                    <span className="course-price-tag mono">₹{c.price_paise ? c.price_paise / 100 : 0}</span>
                  </div>
                  <h3 className="course-title">{c.title}</h3>
                  <p className="course-desc">{c.description || "Stream-aligned comprehensive curriculum."}</p>
                  <div className="course-meta-bar mono text-xs">
                    <span>{c.module_count || 0} Modules Attached</span>
                    <span className="status-live">● Live</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* ✨ AI COURSE CONTENT GENERATOR MODAL */}
      {/* ========================================================= */}
      {isAiModalOpen && (
        <div className="modal-backdrop" onClick={() => !aiGenerating && setIsAiModalOpen(false)}>
          <div className="ai-generator-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="header-badge-group">
                <span className="ai-sparkle-pill mono">
                  <span className="sparkle-icon">✨</span> AI CURRICULUM ARCHITECT
                </span>
                <h2>Generate Production Course with AI</h2>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsAiModalOpen(false)}
                disabled={aiGenerating}
              >
                ✕
              </button>
            </div>

            {/* STEP 0: Configuration & Prompt Input */}
            {aiStep === 0 && (
              <div className="ai-modal-body">
                <p className="ai-prompt-sub">
                  Enter any engineering, medical, financial, or legal topic. Our AI architect will automatically structure complete syllabus modules, learning outcomes, and curated video masterclasses.
                </p>

                <div className="ai-presets-box">
                  <span className="mono text-xs text-muted">QUICK TOPIC PRESETS:</span>
                  <div className="presets-chips-row">
                    {AI_TOPIC_PRESETS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="preset-chip mono"
                        onClick={() => setAiPrompt(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleGenerateAiCourse} className="ai-generator-form">
                  <div className="form-group">
                    <label className="mono text-xs">COURSE TOPIC / DISCIPLINE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quantum Computing & Qiskit Algorithm Implementation"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="mono text-xs">CATEGORY</label>
                      <select value={aiCategory} onChange={(e) => setAiCategory(e.target.value)}>
                        <option value="Software & AI Systems">Software &amp; AI Systems</option>
                        <option value="Medical & Health Sciences">Medical &amp; Health Sciences</option>
                        <option value="Engineering & Cloud">Engineering &amp; Cloud</option>
                        <option value="Design & Product">Design &amp; Product</option>
                        <option value="Finance & Economics">Finance &amp; Economics</option>
                        <option value="Law & Legal Studies">Law &amp; Legal Studies</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="mono text-xs">DIFFICULTY</label>
                      <select value={aiLevel} onChange={(e) => setAiLevel(e.target.value)}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Competitive Specialist">Competitive Specialist</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="mono text-xs">MODULES COUNT</label>
                      <select value={aiModulesCount} onChange={(e) => setAiModulesCount(Number(e.target.value))}>
                        <option value={3}>3 Modules</option>
                        <option value={4}>4 Modules</option>
                        <option value={5}>5 Modules</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="cyber-btn cyber-btn--primary ai-submit-btn w-full"
                    disabled={!aiPrompt.trim()}
                  >
                    ✨ Synthesize Complete Course &amp; Syllabus
                  </button>
                </form>
              </div>
            )}

            {/* STEP 1: Generating Loading Animation */}
            {aiStep === 1 && (
              <div className="ai-generating-view">
                <div className="ai-radar-spinner">
                  <div className="radar-circle" />
                  <span className="material-symbols-outlined ai-pulse-icon">psychology</span>
                </div>
                <h3>AI Curriculum Architect at Work…</h3>
                <div className="ai-progress-steps mono text-xs">
                  <span className="step-item active">✓ Deconstructing domain foundations</span>
                  <span className="step-item active">✓ Synthesizing {aiModulesCount} structured modules</span>
                  <span className="step-item active">⚡ Curating 1080p video lecture masterclasses</span>
                  <span className="step-item">○ Formatting checkpoints &amp; capstone briefs</span>
                </div>
              </div>
            )}

            {/* STEP 2: Generated Course Preview & 1-Click Publish */}
            {aiStep === 2 && generatedCourse && (
              <div className="ai-preview-view">
                <div className="preview-top-card glass-card">
                  <div className="preview-pill-row">
                    <span className="preview-badge mono">{generatedCourse.category}</span>
                    <span className="preview-badge mono">{generatedCourse.level}</span>
                    <span className="preview-badge mono text-primary">✨ AI Generated</span>
                  </div>
                  <h3 className="preview-title">{generatedCourse.title}</h3>
                  <p className="preview-desc">{generatedCourse.description}</p>
                </div>

                <div className="preview-outcomes-box">
                  <strong className="mono text-xs text-primary">SYNTHESIZED LEARNING OUTCOMES:</strong>
                  <ul className="outcomes-checklist">
                    {generatedCourse.outcomes?.map((out, oIdx) => (
                      <li key={oIdx}>
                        <span className="material-symbols-outlined check-icon">check_circle</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="preview-modules-list">
                  <strong className="mono text-xs text-muted">GENERATED MODULES &amp; VIDEO MASTERCLASSES ({generatedCourse.curriculum?.length}):</strong>
                  {generatedCourse.curriculum?.map((mod, mIdx) => (
                    <div className="preview-module-card glass-card" key={mod.id || mIdx}>
                      <div className="mod-head">
                        <div>
                          <h4 className="mod-title">{mod.title}</h4>
                          <span className="mono text-xs text-muted">{mod.duration} · {mod.lessons?.length || 0} lessons</span>
                        </div>
                        {mod.videoUrl && (
                          <button
                            type="button"
                            className="preview-video-btn mono text-xs"
                            onClick={() => setPreviewVideo({ title: mod.title, url: mod.videoUrl })}
                          >
                            ▶ Preview Video
                          </button>
                        )}
                      </div>
                      <p className="mod-desc">{mod.description}</p>
                    </div>
                  ))}
                </div>

                <div className="ai-preview-actions">
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--secondary"
                    onClick={() => setAiStep(0)}
                  >
                    ← Edit Prompt
                  </button>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary"
                    onClick={handlePublishAiCourse}
                    disabled={aiPublishing}
                  >
                    {aiPublishing ? "Publishing to Live Catalog…" : "⚡ Publish Generated Course to Catalog"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}