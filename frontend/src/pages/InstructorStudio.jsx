import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import PathwardLogo from "../components/PathwardLogo.jsx";
import { COURSE_CATALOG, enrollCourse } from "../lib/coursesData.js";
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
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("monetization"); // 'monetization' | 'courses' | 'assignments' | 'qa'
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      student_name: "Nabisha Khan",
      assignment_title: "Using Spreadsheet Like An Expert",
      submitted_at: "2 hours ago",
      submission_url: "https://github.com/nabisha/pandas-etl-pipeline",
      status: "graded",
      score: 96,
      feedback: "Exceptional transformation pipeline with clean seaborn charts.",
    },
    {
      id: 2,
      student_name: "Chandrakesh Sharma",
      assignment_title: "PyTorch Attention Matrix & Scaled Softmax",
      submitted_at: "5 hours ago",
      submission_url: "https://github.com/chandrakesh/transformer-attention-pytorch",
      status: "pending",
      score: null,
      feedback: null,
    },
    {
      id: 3,
      student_name: "Mohammad Umar",
      assignment_title: "Kafka Consumer Offset & Exactly-Once Pipeline",
      submitted_at: "Yesterday",
      submission_url: "https://github.com/umar/kafka-idempotent-worker",
      status: "pending",
      score: null,
      feedback: null,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  // Create Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Software & AI Systems",
    stream_id: "science",
    level: "Advanced",
    price: 1499,
    trailerVideoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  });
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Add Module Form State
  const [moduleForm, setModuleForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    resourceUrl: "",
    position: 1,
    file: null,
  });
  const [addingModule, setAddingModule] = useState(false);

  // Assignment Creation Form State
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
  const [gradeScore, setGradeScore] = useState(95);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("₹38,200");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Q&A Discussion State
  const [qaThreads, setQaThreads] = useState([
    {
      id: 1,
      scholar: "Nabisha Khan",
      course: "Advanced Machine Learning",
      question: "How do we prevent numerical instability when calculating Softmax(QK^T / sqrt(d_k)) with float16 precision?",
      time: "3 hours ago",
      replies: [
        { author: "Dr. Eleanor Vance", text: "Subtract the maximum logit before exponentiation: x - max(x). PyTorch's F.scaled_dot_product_attention does this automatically with FlashAttention." },
      ],
    },
    {
      id: 2,
      scholar: "Chandrakesh Sharma",
      course: "Distributed Systems & Cloud",
      question: "Is Raft consensus leader election guaranteed to terminate if network partitions occur intermittently?",
      time: "1 day ago",
      replies: [],
    },
  ]);
  const [replyTextMap, setReplyTextMap] = useState({});

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
    Promise.all([
      api.getInstructorCourses().catch(() => []),
      api.getLearningStreams().catch(() => []),
    ])
      .then(([c, s]) => {
        const combined = c && c.length > 0 ? c : Object.values(COURSE_CATALOG);
        setCourses(combined);
        setStreams(s || []);
        if (combined.length > 0) {
          setModuleForm((prev) => ({ ...prev, courseId: combined[0].id }));
          setAssignmentForm((prev) => ({ ...prev, courseId: combined[0].id }));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreateCourse(e) {
    e.preventDefault();
    setMsg(null);
    setCreatingCourse(true);

    try {
      const newCourseId = `inst-${Date.now()}`;
      const newCourseObj = {
        id: newCourseId,
        title: courseForm.title,
        category: courseForm.category,
        streamId: courseForm.stream_id,
        branchId: "cse",
        level: courseForm.level || "Advanced",
        instructor: user?.name || "Professor & Lead Architect",
        rating: 5.0,
        reviewsCount: "1",
        studentsCount: "1",
        price: Number(courseForm.price) || 999,
        originalPrice: Number(courseForm.price) * 2 || 1999,
        videoDuration: "10h 30m Total",
        trailerVideoUrl: courseForm.trailerVideoUrl,
        trailerImage: courseForm.trailerImage,
        description: courseForm.description,
        curriculumSummary: "2 modules • 6h 30m",
        curriculum: [
          {
            id: "mod-1",
            number: 1,
            title: `Foundations of ${courseForm.title}`,
            codeSnippet: `// ${courseForm.title} Module 1\nexport async function initCoreSystem() {\n  console.log("Core initialized");\n}`,
            isFreePreview: true,
            duration: "1h 30m",
            videoUrl: courseForm.trailerVideoUrl,
            assignment: {
              id: Date.now(),
              title: `${courseForm.title} Capstone 1`,
              description: `Implement the foundational principles and architectural pipelines for ${courseForm.title}.`,
              starterCode: "// Solution template",
              due: "Next Week",
              maxPoints: 100,
            },
            lessons: [
              { id: "l-1", title: "Architecture & System Fundamentals", duration: "30:00", isPreview: true, videoUrl: courseForm.trailerVideoUrl },
              { id: "l-2", title: "Hands-on Implementation Masterclass", duration: "60:00", isPreview: false, videoUrl: courseForm.trailerVideoUrl },
            ],
          },
        ],
      };

      // Register in COURSE_CATALOG so it's instantly discoverable & selectable
      COURSE_CATALOG[newCourseId] = newCourseObj;
      enrollCourse(newCourseId);

      try {
        await api.createCourse(courseForm);
      } catch {}

      setCourses((prev) => [newCourseObj, ...prev]);
      setMsg(`Course "${courseForm.title}" uploaded and published to Pathward Catalog!`);
      setMsgType("success");

      setCourseForm({
        title: "",
        description: "",
        category: "Software & AI Systems",
        stream_id: "science",
        level: "Advanced",
        price: 1499,
        trailerVideoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
      });
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
      const target = COURSE_CATALOG[moduleForm.courseId];
      if (target && target.curriculum) {
        const newMod = {
          id: `mod-${Date.now()}`,
          number: target.curriculum.length + 1,
          title: moduleForm.title,
          codeSnippet: `// Module: ${moduleForm.title}\nconsole.log("Module initialized");`,
          isFreePreview: false,
          duration: "1h 45m",
          videoUrl: moduleForm.videoUrl,
          assignment: {
            id: Date.now(),
            title: `${moduleForm.title} Case Study`,
            description: moduleForm.description || "Complete module project criteria.",
            starterCode: "// Starter code",
            due: "Two Weeks",
            maxPoints: 100,
          },
          lessons: [
            { id: `l-${Date.now()}`, title: moduleForm.title, duration: "45:00", isPreview: false, videoUrl: moduleForm.videoUrl },
          ],
        };
        target.curriculum.push(newMod);
      }

      setMsg(`Module "${moduleForm.title}" attached and published.`);
      setMsgType("success");
      setModuleForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        file: null,
      }));
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
      const newSub = {
        id: Date.now(),
        student_name: "Awaiting Submissions",
        assignment_title: assignmentForm.title,
        submitted_at: "Just Now",
        submission_url: null,
        status: "pending",
        score: null,
        feedback: null,
      };

      setSubmissions((prev) => [newSub, ...prev]);
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
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === gradingSubmission.id
            ? { ...sub, status: "graded", score: gradeScore, feedback: gradeFeedback }
            : sub
        )
      );

      setMsg(`Grade and feedback recorded for ${gradingSubmission.student_name}!`);
      setMsgType("success");
      setGradingSubmission(null);
    } catch (err) {
      setMsg(err.message || "Failed to record grade.");
      setMsgType("error");
    } finally {
      setGradingLoading(false);
    }
  }

  function handleRequestPayout() {
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setIsPayoutModalOpen(false);
      setMsg("✓ Payout of ₹38,200 initiated via Razorpay Route! Reference ID: PW-PAYOUT-9821");
      setMsgType("success");
    }, 1200);
  }

  function handleExportCsv() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "TransactionID,ScholarName,CourseTitle,Amount,InstructorNetPayout,Date\n" +
      "TXN-8812,Nabisha Khan,Advanced Machine Learning,1499,1199,2026-08-20\n" +
      "TXN-8813,Chandrakesh Sharma,UX/UI Foundations,999,799,2026-08-21\n" +
      "TXN-8814,Mohammad Umar,Clinical Medicine,1299,1039,2026-08-22\n" +
      "TXN-8815,Aarav Patel,Distributed Cloud Architecture,1799,1439,2026-08-24\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Pathward_Instructor_Sales_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMsg("✓ Instructor Sales & Revenue CSV report downloaded successfully.");
    setMsgType("success");
  }

  function handlePostQaReply(threadId) {
    const text = replyTextMap[threadId];
    if (!text || !text.trim()) return;

    setQaThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              replies: [
                ...th.replies,
                { author: user?.name || "Instructor", text: text.trim() },
              ],
            }
          : th
      )
    );

    setReplyTextMap((prev) => ({ ...prev, [threadId]: "" }));
    setMsg("✓ Reply posted to scholar discussion thread.");
    setMsgType("success");
  }

  return (
    <div className="instructor-studio-root">
      {/* Background Cosmic Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Integrated Workspace Header */}
      <header className="dash-workspace-header">
        <div className="dash-workspace-header__inner">
          <div className="dash-workspace-brand">
            <Link to="/" className="dash-brand-link" title="Return to Platform Home">
              <PathwardLogo size="default" />
            </Link>
            <div className="navbar__workspace-pill navbar__workspace-pill--instructor">
              <span className="workspace-dot" />
              INSTRUCTOR STUDIO
            </div>
          </div>

          <div className="dash-workspace-actions">
            <Link to="/discover" className="dash-action-btn" title="Explore Platform">
              <span className="material-symbols-outlined">explore</span>
              <span>Platform</span>
            </Link>

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Clean Light Theme" : "Switch to Dark Cosmic Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <svg
                  className="half-moon-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg
                  className="half-moon-icon sun"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <div className="dash-user-group">
              <div className="navbar__avatar">{user?.name ? user.name.charAt(0).toUpperCase() : "I"}</div>
              <span className="dash-username mono">{user?.name ? user.name.split(" ")[0] : "Instructor"}</span>
              <button type="button" onClick={() => { logout(); navigate("/login"); }} className="navbar__logout-btn mono" title="Log out">
                <span className="material-symbols-outlined logout-icon">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Header Banner with AI Generator Callout */}
      <header className="studio-header">
        <div className="container studio-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>CREATOR HUB &amp; ACADEMIC STUDIO</span>
          </div>

          <div className="studio-header-title-row">
            <div>
              <h1 className="studio-title gradient-text">Instructor Studio &amp; Monetization</h1>
              <p className="studio-sub">
                Upload courses, manage assignments, grade scholar submissions, and synthesize AI courses with direct Razorpay payouts.
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
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
              <span>AI Course Generator</span>
            </button>
          </div>

          {/* Instructor Navigation Tabs */}
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
              className={`inst-tab-btn ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              <span className="material-symbols-outlined">video_library</span>
              <span>Upload &amp; My Courses ({courses.length})</span>
            </button>

            <button
              type="button"
              className={`inst-tab-btn ${activeTab === "assignments" ? "active" : ""}`}
              onClick={() => setActiveTab("assignments")}
            >
              <span className="material-symbols-outlined">assignment_turned_in</span>
              <span>Coursework &amp; Grading ({submissions.length})</span>
            </button>

            <button
              type="button"
              className={`inst-tab-btn ${activeTab === "qa" ? "active" : ""}`}
              onClick={() => setActiveTab("qa")}
            >
              <span className="material-symbols-outlined">forum</span>
              <span>Scholar Q&amp;A ({qaThreads.length})</span>
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
        {/* TAB 1: REVENUE & MONETIZATION */}
        {/* ========================================================= */}
        {activeTab === "monetization" && (
          <div className="monetization-tab-view animate-fade-in">
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
                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary mono text-xs mt-2"
                  onClick={() => setIsPayoutModalOpen(true)}
                >
                  Request Payout (₹38,200)
                </button>
              </div>
            </div>

            {/* Course Monetization Breakdown Table */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">analytics</span>
                <div style={{ flex: 1 }}>
                  <h2 className="card-title">Course Monetization &amp; Performance Breakdown</h2>
                  <span className="mono text-xs text-muted">Per-course revenue, conversion rates, and completion statistics</span>
                </div>
                <button type="button" className="cyber-btn cyber-btn--secondary mono text-xs" onClick={handleExportCsv}>
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>download</span>
                  <span>Export Sales CSV</span>
                </button>
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
                      <td><strong>Advanced Machine Learning &amp; Transformers</strong></td>
                      <td><span className="cat-pill mono">Software &amp; AI</span></td>
                      <td className="mono">₹1,499</td>
                      <td className="mono font-bold">142</td>
                      <td className="mono text-emerald font-bold">₹2,12,858</td>
                      <td><span className="mono text-xs font-bold text-secondary">88%</span></td>
                    </tr>
                    <tr>
                      <td><strong>UX/UI Foundations &amp; Scalable Design Systems</strong></td>
                      <td><span className="cat-pill mono">Design &amp; Product</span></td>
                      <td className="mono">₹999</td>
                      <td className="mono font-bold">98</td>
                      <td className="mono text-emerald font-bold">₹97,902</td>
                      <td><span className="mono text-xs font-bold text-secondary">92%</span></td>
                    </tr>
                    <tr>
                      <td><strong>Clinical Medicine &amp; 12-Lead ECG Mastery</strong></td>
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
        {/* TAB 2: COURSE CREATOR & MODULE UPLOAD */}
        {/* ========================================================= */}
        {activeTab === "courses" && (
          <div className="studio-grid animate-fade-in">
            <div className="studio-col-left">
              <section className="studio-card glass-card">
                <div className="card-header-row">
                  <span className="material-symbols-outlined card-icon">cloud_upload</span>
                  <div>
                    <h2 className="card-title">1. Upload &amp; Publish New Course</h2>
                    <span className="mono text-xs text-muted">Set title, stream mapping, video trailer &amp; pricing</span>
                  </div>
                </div>

                <form onSubmit={handleCreateCourse} className="studio-form">
                  <div className="form-group">
                    <label className="mono text-xs">COURSE TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Consensus & Cloud Storage"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="mono text-xs">ACADEMIC STREAM</label>
                      <select
                        value={courseForm.stream_id}
                        onChange={(e) => setCourseForm({ ...courseForm, stream_id: e.target.value })}
                      >
                        <option value="science">Engineering &amp; Technology</option>
                        <option value="medical">Medical &amp; Healthcare</option>
                        <option value="commerce">Commerce &amp; Finance</option>
                        <option value="arts">Humanities &amp; Law</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="mono text-xs">ENROLLMENT PRICE (₹ INR)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="1499"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">VIDEO TRAILER URL (YOUTUBE / MP4)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/aircAruvnKk"
                      value={courseForm.trailerVideoUrl}
                      onChange={(e) => setCourseForm({ ...courseForm, trailerVideoUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">DESCRIPTION &amp; OBJECTIVES</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Summarize course outcomes and target prerequisites..."
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="cyber-btn cyber-btn--primary" disabled={creatingCourse}>
                    {creatingCourse ? "Uploading & Publishing…" : "⚡ Upload & Publish Course"}
                  </button>
                </form>
              </section>
            </div>

            <div className="studio-col-right">
              {/* Attach Modules */}
              <section className="studio-card glass-card">
                <div className="card-header-row">
                  <span className="material-symbols-outlined card-icon">playlist_add</span>
                  <div>
                    <h2 className="card-title">2. Attach Lesson Modules</h2>
                    <span className="mono text-xs text-muted">Upload video lectures and starter code</span>
                  </div>
                </div>

                <form onSubmit={handleAddModule} className="studio-form">
                  <div className="form-group">
                    <label className="mono text-xs">TARGET COURSE</label>
                    <select
                      value={moduleForm.courseId}
                      onChange={(e) => setModuleForm({ ...moduleForm, courseId: e.target.value })}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">MODULE / LESSON TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Module 3: Scaled Multi-Head Attention"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">LECTURE VIDEO URL</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/aircAruvnKk"
                      value={moduleForm.videoUrl}
                      onChange={(e) => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="cyber-btn cyber-btn--primary" disabled={addingModule}>
                    {addingModule ? "Attaching Module…" : "Attach Module to Course"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ASSIGNMENTS & GRADING */}
        {/* ========================================================= */}
        {activeTab === "assignments" && (
          <div className="assignments-tab-view animate-fade-in">
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">post_add</span>
                <div>
                  <h2 className="card-title">Create &amp; Assign Coursework</h2>
                  <span className="mono text-xs text-muted">Publish problem statements, starter code &amp; rubrics</span>
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
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="mono text-xs">DUE DATE</label>
                    <input
                      type="text"
                      placeholder="e.g. August 10, 2026"
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
                    placeholder="e.g. PyTorch Attention Matrix & Scaled Softmax"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="mono text-xs">INSTRUCTIONS &amp; CRITERIA</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe specific unit test criteria, performance constraints, and deliverables..."
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="cyber-btn cyber-btn--primary" disabled={creatingAssignment}>
                  {creatingAssignment ? "Publishing Assignment…" : "⚡ Publish Assignment to Students"}
                </button>
              </form>
            </section>

            {/* Submissions Table */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">checklist_rtl</span>
                <div>
                  <h2 className="card-title">Scholar Submissions for Grading ({submissions.length})</h2>
                  <span className="mono text-xs text-muted">Review solutions and assign rubric grades</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="monetization-table">
                  <thead>
                    <tr className="mono text-xs">
                      <th>SCHOLAR</th>
                      <th>ASSIGNMENT</th>
                      <th>SUBMISSION DATE</th>
                      <th>REPO / CODE</th>
                      <th>STATUS</th>
                      <th>GRADE ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td><strong>{sub.student_name}</strong></td>
                        <td><span className="mono text-xs">{sub.assignment_title}</span></td>
                        <td className="mono text-xs text-muted">{sub.submitted_at}</td>
                        <td>
                          {sub.submission_url ? (
                            <a href={sub.submission_url} target="_blank" rel="noreferrer" className="mono text-xs text-primary">
                              🔗 View Repo
                            </a>
                          ) : (
                            <span className="mono text-xs text-muted">In-Platform Code</span>
                          )}
                        </td>
                        <td>
                          {sub.status === "graded" ? (
                            <span className="completed-tag mono">✓ Graded ({sub.score}/100)</span>
                          ) : (
                            <span className="in-progress-tag mono">● Pending Review</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="cyber-btn cyber-btn--secondary mono text-xs"
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeScore(sub.score || 95);
                              setGradeFeedback(sub.feedback || "Approved with distinction. Clean structure.");
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
        {/* TAB 4: SCHOLAR Q&A THREADS */}
        {/* ========================================================= */}
        {activeTab === "qa" && (
          <div className="qa-tab-view animate-fade-in">
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">forum</span>
                <div>
                  <h2 className="card-title">Scholar Q&amp;A &amp; Discussion Threads</h2>
                  <span className="mono text-xs text-muted">Answer student doubts and clarify code implementations</span>
                </div>
              </div>

              <div className="qa-threads-stack">
                {qaThreads.map((th) => (
                  <article className="qa-thread-card glass-card" key={th.id}>
                    <div className="qa-thread-top">
                      <div>
                        <strong>{th.scholar}</strong>
                        <span className="mono text-xs text-primary" style={{ marginLeft: "8px" }}>in {th.course}</span>
                      </div>
                      <span className="mono text-xs text-muted">{th.time}</span>
                    </div>

                    <p className="qa-question-text">{th.question}</p>

                    {th.replies.length > 0 && (
                      <div className="qa-replies-list">
                        {th.replies.map((rep, idx) => (
                          <div className="qa-reply-item glass-card" key={idx}>
                            <span className="mono text-xs font-bold text-emerald">Instructor ({rep.author}):</span>
                            <p className="qa-reply-text text-sm">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="qa-reply-input-row">
                      <input
                        type="text"
                        placeholder="Write your expert explanation or code snippet…"
                        value={replyTextMap[th.id] || ""}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [th.id]: e.target.value })}
                      />
                      <button
                        type="button"
                        className="cyber-btn cyber-btn--primary mono text-xs"
                        onClick={() => handlePostQaReply(th.id)}
                      >
                        Reply
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* GRADING SUBMISSION MODAL */}
      {/* ========================================================= */}
      {gradingSubmission && (
        <div className="modal-backdrop" onClick={() => setGradingSubmission(null)}>
          <div className="assignment-modal-card glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-primary">grading</span>
                <h3 className="modal-title">Grade Submission: {gradingSubmission.student_name}</h3>
              </div>
              <button className="close-btn" onClick={() => setGradingSubmission(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveGrade} className="assignment-modal-body">
              <div className="form-group">
                <label className="mono text-xs">GRADE SCORE (OUT OF 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="mono text-xs">INSTRUCTOR RUBRIC FEEDBACK</label>
                <textarea
                  rows={4}
                  required
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                />
              </div>

              <div className="submit-actions-row">
                <button type="button" className="cyber-btn cyber-btn--secondary" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </button>
                <button type="submit" className="cyber-btn cyber-btn--primary" disabled={gradingLoading}>
                  {gradingLoading ? "Saving Grade…" : "✓ Confirm & Publish Grade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAYOUT REQUEST MODAL */}
      {/* ========================================================= */}
      {isPayoutModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPayoutModalOpen(false)}>
          <div className="assignment-modal-card glass-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-swipe-handle" />
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <span className="material-symbols-outlined text-emerald">account_balance</span>
                <h3 className="modal-title">Razorpay Instant Payout</h3>
              </div>
              <button className="close-btn" onClick={() => setIsPayoutModalOpen(false)}>✕</button>
            </div>

            <div className="assignment-modal-body">
              <p className="text-sm">Transfer your available course revenue to your linked HDFC bank account (**** 4892).</p>
              <div className="kpi-hero-num mono text-emerald" style={{ fontSize: "28px" }}>{payoutAmount}</div>
              <div className="cyber-pill my-2">
                <span className="pulsing-dot" />
                <span>Zero transaction surcharge via Razorpay Route</span>
              </div>

              <div className="submit-actions-row">
                <button type="button" className="cyber-btn cyber-btn--secondary" onClick={() => setIsPayoutModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="cyber-btn cyber-btn--primary"
                  onClick={handleRequestPayout}
                  disabled={payoutSuccess}
                >
                  {payoutSuccess ? "Transferring Funds…" : "Confirm Instant Transfer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}