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

const MONETIZATION_STATS = {
  totalRevenue: "₹1,48,500",
  monthlyGrowth: "+24.8%",
  coursesSold: 342,
  activeScholars: "1,840",
  avgRating: "4.92 ★",
  payoutStatus: "₹38,200 Next Payout on Aug 30",
};

export default function InstructorStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("monetization"); // 'monetization' | 'courses' | 'assignments' | 'qa'
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  // Create Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Software & AI Systems",
    stream_id: "science",
    price: 999,
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

  // Assignment Creation Form State (Coursera/Udemy model)
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: "feat-1",
    title: "",
    description: "",
    dueDate: "Next Week",
    maxPoints: 100,
    starterCode: "",
  });
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  // AI Course Generator State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("Software & AI Systems");
  const [aiStream, setAiStream] = useState("science");
  const [aiLevel, setAiLevel] = useState("Advanced");
  const [aiModulesCount, setAiModulesCount] = useState(4);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [aiPublishing, setAiPublishing] = useState(false);

  // Video preview in studio
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    if (user && ["instructor", "admin"].includes(user.role)) {
      Promise.all([
        api.getInstructorCourses(),
        api.getLearningStreams(),
        api.getInstructorAllSubmissions(),
      ])
        .then(([c, s, sub]) => {
          setCourses(c || []);
          setStreams(s || []);
          setSubmissions(sub || []);
          if (c && c.length > 0) {
            setModuleForm((prev) => ({ ...prev, courseId: c[0].id }));
            setAssignmentForm((prev) => ({ ...prev, courseId: c[0].id }));
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
        price: 999,
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

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setMsg(null);
    setCreatingAssignment(true);

    try {
      await api.createAssignment(assignmentForm);
      setMsg(`Assignment "${assignmentForm.title}" published to enrolled students!`);
      setMsgType("success");
      setAssignmentForm({
        courseId: courses[0]?.id || "feat-1",
        title: "",
        description: "",
        dueDate: "Next Week",
        maxPoints: 100,
        starterCode: "",
      });
      const updatedSub = await api.getInstructorAllSubmissions();
      setSubmissions(updatedSub);
    } catch (err) {
      setMsg(err.message || "Failed to create assignment.");
      setMsgType("error");
    } finally {
      setCreatingAssignment(false);
    }
  }

  async function handleSaveGrade(e) {
    e.preventDefault();
    if (!gradingSubmission) return;

    setGradingLoading(true);
    try {
      await api.gradeSubmission(gradingSubmission.id, {
        score: gradeScore,
        feedback: gradeFeedback.trim() || "Approved with distinction.",
      });
      setMsg(`Grade and feedback recorded for ${gradingSubmission.student_name}!`);
      setMsgType("success");
      setGradingSubmission(null);
      const updatedSub = await api.getInstructorAllSubmissions();
      setSubmissions(updatedSub);
    } catch (err) {
      setMsg(err.message || "Failed to record grade.");
      setMsgType("error");
    } finally {
      setGradingLoading(false);
    }
  }

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
      setAiStep(2);
    } catch (err) {
      setMsg(err.message || "AI synthesis failed. Try another prompt.");
      setMsgType("error");
      setAiStep(0);
    } finally {
      setAiGenerating(false);
    }
  }

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
              You are signed in as a student. To publish stream-aligned courses, assign coursework, track revenue, and monetize via Razorpay, create or switch to an Instructor account.
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
            <span>COURSERA / UDEMY CREATOR HUB</span>
          </div>

          <div className="studio-header-title-row">
            <div>
              <h1 className="studio-title gradient-text">Instructor Studio &amp; Monetization</h1>
              <p className="studio-sub">
                Track revenue, manage assignments, grade scholar submissions, and synthesize AI courses with direct Razorpay payouts.
              </p>
            </div>

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

          {/* Instructor Navigation Tabs (Coursera / Udemy Model) */}
          <div className="instructor-tabs-bar">
            <button
              type="button"
              className={`inst-tab-btn ${activeTab === "monetization" ? "active" : ""}`}
              onClick={() => setActiveTab("monetization")}
            >
              <span className="material-symbols-outlined">payments</span>
              <span>Revenue &amp; Monetization</span>
            </button>

            <button
              type="button"
              className={`inst-tab-btn ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              <span className="material-symbols-outlined">assignment_turned_in</span>
              <span>Give &amp; Grade Assignments ({submissions.length})</span>
            </button>

            <button
              type="button"
              className={`inst-tab-btn ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              <span className="material-symbols-outlined">video_library</span>
              <span>Course Catalog &amp; Modules</span>
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

        {/* ========================================================= */}
        {/* TAB 1: REVENUE & MONETIZATION (Coursera / Udemy Analytics) */}
        {/* ========================================================= */}
        {activeTab === "monetization" && (
          <div className="monetization-tab-view">
            {/* Top 4 KPI Metrics Cards */}
            <div className="monetization-kpi-grid">
              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">TOTAL REVENUE (INR)</span>
                  <span className="material-symbols-outlined text-emerald">currency_rupee</span>
                </div>
                <div className="kpi-hero-num mono">{MONETIZATION_STATS.totalRevenue}</div>
                <span className="kpi-badge mono text-emerald">{MONETIZATION_STATS.monthlyGrowth} this month</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">COURSES SOLD / ENROLLED</span>
                  <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                </div>
                <div className="kpi-hero-num mono">{MONETIZATION_STATS.coursesSold}</div>
                <span className="kpi-badge mono text-secondary">342 active learners</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">INSTRUCTOR RATING</span>
                  <span className="material-symbols-outlined text-amber">star</span>
                </div>
                <div className="kpi-hero-num mono">{MONETIZATION_STATS.avgRating}</div>
                <span className="kpi-badge mono text-amber">1,280 Scholar reviews</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">RAZORPAY PAYOUT STATUS</span>
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <div className="kpi-hero-num mono text-primary" style={{ fontSize: "20px", marginTop: "6px" }}>
                  Active Payout
                </div>
                <span className="kpi-badge mono text-primary">{MONETIZATION_STATS.payoutStatus}</span>
              </div>
            </div>

            {/* Course Monetization Breakdown Table */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">analytics</span>
                <div>
                  <h2 className="card-title">Course Monetization &amp; Performance Breakdown</h2>
                  <span className="mono text-xs text-muted">Per-course revenue, conversion rates, and completion statistics</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="monetization-table">
                  <thead>
                    <tr className="mono text-xs">
                      <th>COURSE TITLE</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>UNITS SOLD</th>
                      <th>GROSS EARNINGS</th>
                      <th>COMPLETION RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Advanced Machine Learning &amp; Transformers</strong>
                      </td>
                      <td><span className="cat-pill mono">Software &amp; AI</span></td>
                      <td className="mono">₹1,499</td>
                      <td className="mono font-bold">142</td>
                      <td className="mono text-emerald font-bold">₹2,12,858</td>
                      <td><span className="mono text-xs font-bold text-secondary">88%</span></td>
                    </tr>
                    <tr>
                      <td>
                        <strong>UX/UI Foundations &amp; Scalable Design Systems</strong>
                      </td>
                      <td><span className="cat-pill mono">Design &amp; Product</span></td>
                      <td className="mono">₹999</td>
                      <td className="mono font-bold">98</td>
                      <td className="mono text-emerald font-bold">₹97,902</td>
                      <td><span className="mono text-xs font-bold text-secondary">92%</span></td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Clinical Medicine &amp; 12-Lead ECG Mastery</strong>
                      </td>
                      <td><span className="cat-pill mono">Medical &amp; Health</span></td>
                      <td className="mono">₹1,299</td>
                      <td className="mono font-bold">102</td>
                      <td className="mono text-emerald font-bold">₹1,32,498</td>
                      <td><span className="mono text-xs font-bold text-secondary">84%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GIVE & GRADE ASSIGNMENTS (Coursera / Udemy Model) */}
        {/* ========================================================= */}
        {activeTab === "assignments" && (
          <div className="assignments-tab-view">
            {/* Create Assignment Form */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">post_add</span>
                <div>
                  <h2 className="card-title">Create &amp; Assign Coursework</h2>
                  <span className="mono text-xs text-muted">Publish assignments, problem statements, and code rubrics</span>
                </div>
              </div>

              <form onSubmit={handleCreateAssignment} className="studio-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="mono text-xs">TARGET COURSE</label>
                    <select
                      value={assignmentForm.courseId}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                    >
                      <option value="feat-1">Advanced Machine Learning &amp; Transformers</option>
                      <option value="feat-2">UX/UI Foundations &amp; Design Systems</option>
                      <option value="feat-3">Clinical Medicine &amp; Diagnostic Reasoning</option>
                      <option value="feat-4">Distributed Cloud Architecture &amp; Kafka</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">DUE DATE &amp; DEADLINE</label>
                    <input
                      type="text"
                      placeholder="e.g. August 10, 2026 or Next Week"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="mono text-xs">ASSIGNMENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assignment 3: Implementing LoRA Quantization in PyTorch"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">INSTRUCTIONS &amp; PROBLEM STATEMENT</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe specific criteria, unit tests, and expected deliverables..."
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">STARTER CODE / REPOSITORY TEMPLATE (OPTIONAL)</label>
                  <textarea
                    rows={2}
                    placeholder="import torch\ndef lora_linear_forward(x, W, A, B, r, scaling):\n    pass"
                    value={assignmentForm.starterCode}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, starterCode: e.target.value })}
                  />
                </div>

                <button type="submit" className="cyber-btn cyber-btn--primary" disabled={creatingAssignment}>
                  {creatingAssignment ? "Publishing Assignment…" : "⚡ Publish Assignment to Students"}
                </button>
              </form>
            </section>

            {/* Student Submissions Review Table */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">checklist_rtl</span>
                <div>
                  <h2 className="card-title">Scholar Submissions for Grading ({submissions.length})</h2>
                  <span className="mono text-xs text-muted">Review solutions, enter marks, and provide rubric feedback</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="monetization-table">
                  <thead>
                    <tr className="mono text-xs">
                      <th>SCHOLAR</th>
                      <th>ASSIGNMENT</th>
                      <th>SUBMISSION DATE</th>
                      <th>REPO / SOLUTION</th>
                      <th>STATUS</th>
                      <th>GRADE ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.student_name}</strong>
                        </td>
                        <td>
                          <span className="mono text-xs">{sub.assignment_title || "Course Assignment"}</span>
                        </td>
                        <td className="mono text-xs text-muted">{sub.submitted_at || "Recent"}</td>
                        <td>
                          {sub.submission_url ? (
                            <a
                              href={sub.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mono text-xs text-primary"
                            >
                              🔗 View Repo
                            </a>
                          ) : (
                            <span className="mono text-xs text-muted">In-Platform Code</span>
                          )}
                        </td>
                        <td>
                          {sub.status === "graded" ? (
                            <span className="graded-badge mono">✓ Graded ({sub.score}/100)</span>
                          ) : (
                            <span className="pending-badge mono">● Pending Review</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="cyber-btn cyber-btn--secondary grade-btn mono text-xs"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeScore(sub.score || 95);
                              setGradeFeedback(sub.feedback || "Well implemented architecture!");
                            }}
                          >
                            {sub.status === "graded" ? "Edit Grade" : "Grade Now"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: COURSE CATALOG & MODULES */}
        {/* ========================================================= */}
        {activeTab === "courses" && (
          <div className="studio-grid">
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
                      placeholder="999"
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
        )}
      </main>

      {/* ========================================================= */}
      {/* 4. INSTRUCTOR GRADING MODAL */}
      {/* ========================================================= */}
      {gradingSubmission && (
        <div className="modal-backdrop" onClick={() => setGradingSubmission(null)}>
          <div className="grade-modal-card glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-primary">grading</span>
                <div>
                  <h3 className="modal-title">Grade Submission: {gradingSubmission.student_name}</h3>
                  <span className="mono text-xs text-muted">{gradingSubmission.assignment_title}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setGradingSubmission(null)}>✕</button>
            </div>

            <div className="grade-modal-body">
              <div className="submission-content-preview glass-card">
                <span className="mono text-xs text-muted">SCHOLAR'S SUBMISSION CODE &amp; NOTES:</span>
                <p className="submission-text-view">{gradingSubmission.submission_content}</p>
                {gradingSubmission.submission_url && (
                  <a
                    href={gradingSubmission.submission_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mono text-xs text-primary"
                  >
                    🔗 Open Submitted Repository: {gradingSubmission.submission_url}
                  </a>
                )}
              </div>

              <form onSubmit={handleSaveGrade} className="grade-form">
                <div className="form-group">
                  <label className="mono text-xs">SCORE / MARKS (OUT OF 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">INSTRUCTOR RUBRIC FEEDBACK</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide constructive feedback, praise clean code patterns, or suggest performance fixes..."
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                  />
                </div>

                <div className="submit-actions-row">
                  <button type="button" className="cyber-btn cyber-btn--secondary" onClick={() => setGradingSubmission(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="cyber-btn cyber-btn--primary" disabled={gradingLoading}>
                    {gradingLoading ? "Recording Grade…" : "✓ Save Grade & Notify Scholar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. AI COURSE CONTENT GENERATOR MODAL */}
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