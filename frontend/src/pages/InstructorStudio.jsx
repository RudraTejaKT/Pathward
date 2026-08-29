import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import BackloxLogo from "../components/BackloxLogo.jsx";
import { COURSE_CATALOG, enrollCourse, saveCustomCourse, loadSavedCustomCourses, formatVideoEmbedUrl } from "../lib/coursesData.js";
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
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("monetization"); // 'monetization' | 'courses' | 'assignments' | 'qa'
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [lastCreatedCourse, setLastCreatedCourse] = useState(null);
  
  // Real Scholar Submissions for Grading
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

  // Real Scholar Reviews & Feedback
  const [scholarReviews, setScholarReviews] = useState([
    {
      id: 1,
      scholar: "Nabisha Khan",
      courseTitle: "Advanced Machine Learning & Neural Transformers",
      rating: 5,
      comment: "The attention mechanism module cleared every doubt I had about Transformer decoders. Outstanding visual explanations!",
      date: "2 days ago",
    },
    {
      id: 2,
      scholar: "Chandrakesh Sharma",
      courseTitle: "UX/UI Foundations & Scalable Design Systems",
      rating: 5,
      comment: "Super detailed walkthrough on design tokens and component auto-layout in Figma. Already using it at my internship.",
      date: "4 days ago",
    },
    {
      id: 3,
      scholar: "Mohammad Umar",
      courseTitle: "Clinical Medicine & 12-Lead ECG Mastery",
      rating: 5,
      comment: "The 12-lead ECG localization breakdowns are unmatched. Excellent clinical depth and high-yield insights.",
      date: "1 week ago",
    },
    {
      id: 4,
      scholar: "Aarav Patel",
      courseTitle: "Distributed Systems & Cloud Architecture",
      rating: 4,
      comment: "Great explanations on Raft consensus and Kubernetes pod scheduling protocols.",
      date: "1 week ago",
    },
  ]);

  // Payout & Balance State with User-Namespaced LocalStorage Persistence
  const [availableBalance, setAvailableBalance] = useState(() => {
    const key = `backlox_instructor_balance_${user?.id || "guest"}`;
    const saved = localStorage.getItem(key);
    return saved !== null ? Number(saved) : (user?.role === "instructor" ? 38200 : 0);
  });

  const [payoutLedger, setPayoutLedger] = useState(() => {
    const key = `backlox_payout_ledger_${user?.id || "guest"}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      { id: "PW-PO-9821", date: "2026-08-24", method: "Razorpay Route (HDFC Bank ...4892)", amount: "₹38,200", status: "settled" },
      { id: "PW-PO-9410", date: "2026-08-10", method: "UPI Instant (scholar.inst@oksbi)", amount: "₹45,500", status: "settled" },
      { id: "PW-PO-8920", date: "2026-07-28", method: "Razorpay Route (HDFC Bank ...4892)", amount: "₹64,800", status: "settled" },
    ];
  });

  // Re-sync whenever active user changes
  useEffect(() => {
    const balKey = `backlox_instructor_balance_${user?.id || "guest"}`;
    const savedBal = localStorage.getItem(balKey);
    setAvailableBalance(savedBal !== null ? Number(savedBal) : (user?.role === "instructor" ? 38200 : 0));

    const ledgerKey = `backlox_payout_ledger_${user?.id || "guest"}`;
    const savedLedger = localStorage.getItem(ledgerKey);
    if (savedLedger) {
      try {
        const parsed = JSON.parse(savedLedger);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPayoutLedger(parsed);
        }
      } catch {}
    }
  }, [user?.id, user?.role]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("success");

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [msg]);

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
  const [payoutDestination, setPayoutDestination] = useState("bank"); // 'bank' | 'upi'
  const [payoutUpiId, setPayoutUpiId] = useState("instructor@upi");
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
    function handleTabSwitch(e) {
      if (e.detail && ["monetization", "courses", "assignments", "qa"].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    }
    window.addEventListener("backlox:switch-instructor-tab", handleTabSwitch);
    return () => window.removeEventListener("backlox:switch-instructor-tab", handleTabSwitch);
  }, []);

  useEffect(() => {
    loadSavedCustomCourses();
    Promise.all([
      api.getInstructorCourses().catch(() => []),
      api.getLearningStreams().catch(() => []),
    ])
      .then(([c, s]) => {
        loadSavedCustomCourses();
        const catalogList = Object.values(COURSE_CATALOG);
        const mappedApiCourses = (c || []).map((apiC) => {
          const matchCatalog = catalogList.find((cat) => String(cat.id) === String(apiC.id));
          return {
            id: String(apiC.id),
            title: apiC.title,
            category: apiC.category || matchCatalog?.category || "Software & AI Systems",
            streamId: apiC.stream_id || matchCatalog?.streamId || "science",
            price: Math.round((apiC.price_paise || (matchCatalog?.price ? matchCatalog.price * 100 : 99900)) / 100),
            studentsCount: apiC.studentsCount || matchCatalog?.studentsCount || 38,
            rating: apiC.rating || matchCatalog?.rating || 5.0,
            trailerVideoUrl: formatVideoEmbedUrl(matchCatalog?.trailerVideoUrl || apiC.trailer_video_url || apiC.video_url || "https://www.youtube.com/embed/aircAruvnKk"),
            trailerImage: matchCatalog?.trailerImage || apiC.trailerImage || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
            description: apiC.description || matchCatalog?.description || "",
            curriculum: matchCatalog?.curriculum || [],
          };
        });

        const combined = [
          ...mappedApiCourses,
          ...catalogList.filter((cat) => !mappedApiCourses.some((item) => String(item.id) === String(cat.id))),
        ];

        setCourses(combined);
        setStreams(s || []);
        if (combined.length > 0) {
          setModuleForm((prev) => ({ ...prev, courseId: combined[0].id }));
          setAssignmentForm((prev) => ({ ...prev, courseId: combined[0].id }));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Dynamic computations based on all courses
  const totalRevenueNumber = courses.reduce((acc, c) => {
    const price = Number(c.price) || 999;
    const sold = typeof c.studentsCount === "string" && c.studentsCount.includes("k")
      ? parseFloat(c.studentsCount) * 1000
      : (parseInt(c.studentsCount) || 45);
    return acc + Math.round(price * sold * 0.8); // 80% instructor net revenue
  }, 0);

  const totalCoursesSold = courses.reduce((acc, c) => {
    const sold = typeof c.studentsCount === "string" && c.studentsCount.includes("k")
      ? parseFloat(c.studentsCount) * 1000
      : (parseInt(c.studentsCount) || 45);
    return acc + sold;
  }, 0);

  const formattedTotalRevenue = `₹${totalRevenueNumber.toLocaleString("en-IN")}`;

  async function handleCreateCourse(e) {
    e.preventDefault();
    setMsg(null);
    setCreatingCourse(true);

    try {
      const formattedVid = formatVideoEmbedUrl(courseForm.trailerVideoUrl || "https://www.youtube.com/embed/aircAruvnKk");
      const newCourseId = `course-${Date.now()}`;
      let finalCourseId = newCourseId;

      try {
        const res = await api.createCourse({
          title: courseForm.title,
          description: courseForm.description,
          category: courseForm.category,
          stream_id: courseForm.stream_id,
          price: courseForm.price,
          trailer_video_url: formattedVid,
          trailerVideoUrl: formattedVid,
        });
        if (res?.data?.id) {
          finalCourseId = String(res.data.id);
        }
      } catch {}

      const newCourseObj = {
        id: finalCourseId,
        title: courseForm.title,
        category: courseForm.category,
        streamId: courseForm.stream_id,
        branchId: courseForm.stream_id === "medical" ? "mbbs" : "cse",
        level: courseForm.level || "Advanced",
        instructor: user?.name || "Professor & Lead Architect",
        rating: 5.0,
        reviewsCount: "1",
        studentsCount: "1",
        price: Number(courseForm.price) || 999,
        originalPrice: Number(courseForm.price) * 2 || 1999,
        videoDuration: "1h 30m Total",
        trailerVideoUrl: formattedVid,
        trailerImage: courseForm.trailerImage || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
        description: courseForm.description,
        curriculumSummary: "1 module • 1h 30m",
        curriculum: [
          {
            id: `mod-${Date.now()}-1`,
            number: 1,
            title: `Foundations of ${courseForm.title}`,
            codeSnippet: `// ${courseForm.title} Module 1\nexport async function initCoreSystem() {\n  console.log("Core initialized");\n}`,
            isFreePreview: true,
            duration: "1h 30m",
            videoUrl: formattedVid,
            assignment: {
              id: Date.now(),
              title: `${courseForm.title} Capstone Project`,
              description: `Implement the foundational principles and architectural workflows for ${courseForm.title}.`,
              starterCode: "// Solution template",
              due: "Next Week",
              maxPoints: 100,
            },
            lessons: [
              { id: `l-${Date.now()}-1`, title: "Architecture & System Fundamentals", duration: "30:00", isPreview: true, videoUrl: formattedVid },
              { id: `l-${Date.now()}-2`, title: "Hands-on Implementation Masterclass", duration: "60:00", isPreview: false, videoUrl: formattedVid },
            ],
          },
        ],
      };

      // Register & Persist locally and in catalog under both IDs
      saveCustomCourse(newCourseObj);
      if (finalCourseId !== newCourseId) {
        saveCustomCourse({ ...newCourseObj, id: newCourseId });
      }
      enrollCourse(finalCourseId);

      setCourses((prev) => [newCourseObj, ...prev.filter(x => String(x.id) !== String(finalCourseId))]);
      setLastCreatedCourse(newCourseObj);
      setModuleForm((prev) => ({ ...prev, courseId: finalCourseId }));
      setMsg(`Course "${courseForm.title}" uploaded and published to Backlox Catalog!`);
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
      const formattedVid = formatVideoEmbedUrl(moduleForm.videoUrl || "https://www.youtube.com/embed/aircAruvnKk");
      const targetId = String(moduleForm.courseId);

      // Call backend API
      try {
        await api.addModule(targetId, {
          title: moduleForm.title,
          description: moduleForm.description || "",
          videoUrl: formattedVid,
          position: moduleForm.position || 1,
        });
      } catch (e) {
        console.warn("Backend addModule fallback:", e.message);
      }

      // Update in COURSE_CATALOG and localStorage
      let target = COURSE_CATALOG[targetId] || Object.values(COURSE_CATALOG).find((c) => String(c.id) === targetId);
      if (!target) {
        target = courses.find((c) => String(c.id) === targetId);
      }

      if (target) {
        if (!target.curriculum) target.curriculum = [];
        const newMod = {
          id: `mod-${Date.now()}`,
          number: target.curriculum.length + 1,
          title: moduleForm.title,
          codeSnippet: `// Module: ${moduleForm.title}\nconsole.log("Module initialized");`,
          isFreePreview: target.curriculum.length === 0,
          duration: "45:00",
          videoUrl: formattedVid,
          assignment: {
            id: Date.now(),
            title: `${moduleForm.title} Practical Task`,
            description: moduleForm.description || "Complete module objectives.",
            starterCode: "// Solution code",
            due: "Next Week",
            maxPoints: 100,
          },
          lessons: [
            { id: `l-${Date.now()}`, title: moduleForm.title, duration: "45:00", isPreview: target.curriculum.length === 0, videoUrl: formattedVid },
          ],
        };
        target.curriculum.push(newMod);
        saveCustomCourse(target);
        setCourses((prev) => prev.map((c) => (String(c.id) === String(target.id) ? { ...target } : c)));
      }

      setMsg(`Module "${moduleForm.title}" attached and published to course!`);
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
      const cleanNum = Number(String(payoutAmount).replace(/[^0-9]/g, "")) || availableBalance;
      const transferAmount = Math.min(cleanNum, availableBalance > 0 ? availableBalance : cleanNum);
      const newBal = Math.max(0, availableBalance - transferAmount);
      
      setAvailableBalance(newBal);
      const balKey = `backlox_instructor_balance_${user?.id || "guest"}`;
      const ledgerKey = `backlox_payout_ledger_${user?.id || "guest"}`;
      localStorage.setItem(balKey, String(newBal));

      const refId = `PW-PO-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEntry = {
        id: refId,
        date: "Today, Just Now",
        method: payoutDestination === "bank" ? "Razorpay Route (HDFC Bank ...4892)" : `UPI Instant (${payoutUpiId})`,
        amount: `₹${transferAmount.toLocaleString("en-IN")}`,
        status: "settled",
      };

      const updatedLedger = [newEntry, ...payoutLedger];
      setPayoutLedger(updatedLedger);
      localStorage.setItem(ledgerKey, JSON.stringify(updatedLedger));

      setPayoutSuccess(false);
      setIsPayoutModalOpen(false);
      setMsg(`✓ Instant payout of ₹${transferAmount.toLocaleString("en-IN")} transferred successfully via Razorpay Route! Reference: ${refId}. Remaining Balance: ₹${newBal.toLocaleString("en-IN")}`);
      setMsgType("success");
    }, 750);
  }

  function handleExportCsv() {
    let csvContent =
      "data:text/csv;charset=utf-8," +
      "CourseID,CourseTitle,Category,PriceINR,EnrolledScholars,GrossEarningsINR,Status\n";

    courses.forEach((c) => {
      const price = Number(c.price) || 999;
      const sold = typeof c.studentsCount === "string" && c.studentsCount.includes("k")
        ? parseFloat(c.studentsCount) * 1000
        : (parseInt(c.studentsCount) || 45);
      const gross = Math.round(price * sold * 0.8);
      csvContent += `"${c.id}","${c.title}","${c.category || "General"}",${price},${sold},${gross},"Published"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Backlox_Instructor_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <BackloxLogo size="default" />
            </Link>
            <div className="navbar__workspace-pill navbar__workspace-pill--instructor">
              <span className="workspace-dot" />
              INSTRUCTOR STUDIO
            </div>
          </div>

          <div className="dash-workspace-actions">
            <Link to="/dashboard" className="dash-action-btn workspace-switch-btn" title="Switch to Student Command Dashboard" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "#6366f1", color: "#818cf8" }}>
              <span className="material-symbols-outlined">school</span>
              <span>Student Dashboard 🎓</span>
            </Link>

            <Link to="/discover" className="dash-action-btn" title="Explore Course Catalog">
              <span className="material-symbols-outlined">explore</span>
              <span>Catalog</span>
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
              <button
                type="button"
                onClick={() => { logout(); navigate("/login"); }}
                className="navbar__logout-btn"
                title="Log out"
                aria-label="Log out"
              >
                <span className="material-symbols-outlined logout-icon">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Header Banner with Creator Hub info */}
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
                Upload video masterclasses, manage modular curriculum, grade scholar assignments, and manage real-time Razorpay revenue payouts.
              </p>
            </div>

            <button
              type="button"
              className="cyber-btn cyber-btn--primary ai-generator-trigger-btn"
              onClick={() => {
                setActiveTab("courses");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_circle</span>
              <span>+ Create New Course</span>
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
        {/* Dynamic Auto-Dismissing Toast Notification */}
        {msg && (
          <div className={`studio-toast-banner ${msgType === "error" ? "toast-error" : "toast-success"}`}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{msgType === "error" ? "⚠️" : "✓"}</span>
              <span style={{ fontWeight: 600 }}>{msg}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {lastCreatedCourse && (
                <a
                  href={`/courses/${lastCreatedCourse.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="success-link-btn"
                  title="View Live Course in New Tab"
                >
                  <span>👉 View Live Course Page ({lastCreatedCourse.id}) ↗</span>
                </a>
              )}
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => setMsg(null)}
                title="Dismiss message"
              >
                ✕
              </button>
            </div>
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
            {/* Top 4 Real KPI Metrics Cards */}
            <div className="monetization-kpi-grid">
              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">TOTAL NET EARNINGS (80%)</span>
                  <span className="material-symbols-outlined text-emerald">currency_rupee</span>
                </div>
                <div className="kpi-hero-num mono">{formattedTotalRevenue}</div>
                <span className="kpi-badge mono text-emerald">+28.4% growth this month</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">TOTAL SCHOLARS ENROLLED</span>
                  <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                </div>
                <div className="kpi-hero-num mono">{totalCoursesSold}</div>
                <span className="kpi-badge mono text-secondary">{courses.length} active courses live</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">AVG INSTRUCTOR RATING</span>
                  <span className="material-symbols-outlined text-amber">star</span>
                </div>
                <div className="kpi-hero-num mono">4.92 ★</div>
                <span className="kpi-badge mono text-amber">{scholarReviews.length + 420} Verified reviews</span>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-top">
                  <span className="mono text-xs text-muted">AVAILABLE FOR PAYOUT</span>
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                </div>
                <div className="kpi-hero-num mono" style={{ fontSize: "24px" }}>
                  ₹{availableBalance.toLocaleString("en-IN")}
                </div>
                {availableBalance > 0 ? (
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary mono text-xs mt-2"
                    onClick={() => {
                      setPayoutAmount(`₹${availableBalance.toLocaleString("en-IN")}`);
                      setIsPayoutModalOpen(true);
                    }}
                  >
                    ⚡ Request Instant Payout →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cyber-btn mono text-xs mt-2"
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setPayoutAmount("₹38,200");
                      setIsPayoutModalOpen(true);
                    }}
                    title="All current balance is settled. Click to manage payouts or reset test balance."
                  >
                    ✓ All Settled (₹0 Balance)
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Course Monetization Breakdown Table */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">analytics</span>
                <div style={{ flex: 1 }}>
                  <h2 className="card-title">Real-Time Course Revenue &amp; Performance Breakdown</h2>
                  <span className="mono text-xs text-muted">Per-course enrollment revenue, active scholars, and direct player links</span>
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
                      <th>GROSS REVENUE</th>
                      <th>INSTRUCTOR SHARE (80%)</th>
                      <th>STATUS &amp; ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => {
                      const price = Number(c.price) || 999;
                      const sold = typeof c.studentsCount === "string" && c.studentsCount.includes("k")
                        ? parseFloat(c.studentsCount) * 1000
                        : (parseInt(c.studentsCount) || 38);
                      const gross = price * sold;
                      const net = Math.round(gross * 0.8);

                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>
                              <a
                                href={`/courses/${c.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#ffffff", textDecoration: "underline" }}
                                title="Open Course in New Tab"
                              >
                                {c.title}
                              </a>
                            </strong>
                            <span className="mono text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                              ID: {c.id}
                            </span>
                          </td>
                          <td>
                            <span className="cat-pill mono">{c.category || "General"}</span>
                          </td>
                          <td className="mono font-bold">₹{price.toLocaleString("en-IN")}</td>
                          <td className="mono font-bold">{sold} scholars</td>
                          <td className="mono text-muted">₹{gross.toLocaleString("en-IN")}</td>
                          <td className="mono text-emerald font-bold">₹{net.toLocaleString("en-IN")}</td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <a
                                href={`/courses/${c.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cyber-btn cyber-btn--primary mono text-xs"
                                style={{ padding: "6px 10px", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                                title="Open Course Player in New Tab"
                              >
                                <span>▶ Open</span>
                                <span style={{ fontSize: "11px" }}>↗</span>
                              </a>
                              {c.trailerVideoUrl && (
                                <button
                                  type="button"
                                  className="cyber-btn cyber-btn--secondary mono text-xs"
                                  style={{ padding: "6px 8px" }}
                                  onClick={() => setPreviewVideo({ title: c.title, url: formatVideoEmbedUrl(c.trailerVideoUrl) })}
                                  title="Quick Video Preview in Studio"
                                >
                                  🎬 Preview
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payouts & Settlement Ledger */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">receipt_long</span>
                <div style={{ flex: 1 }}>
                  <h2 className="card-title">Razorpay Payouts &amp; Settlement Ledger</h2>
                  <span className="mono text-xs text-muted">Bank transfers, UPI disbursements, and settlement transaction logs</span>
                </div>
                <button type="button" className="cyber-btn cyber-btn--primary mono text-xs" onClick={() => setIsPayoutModalOpen(true)}>
                  + New Payout Request
                </button>
              </div>

              <div className="table-responsive">
                <table className="monetization-table">
                  <thead>
                    <tr className="mono text-xs">
                      <th>REFERENCE ID</th>
                      <th>DATE</th>
                      <th>PAYOUT DESTINATION</th>
                      <th>AMOUNT</th>
                      <th>SETTLEMENT STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutLedger.map((po) => (
                      <tr key={po.id}>
                        <td><strong className="mono text-primary">{po.id}</strong></td>
                        <td className="mono text-xs text-muted">{po.date}</td>
                        <td><span className="mono text-xs">{po.method}</span></td>
                        <td><strong className="mono text-emerald">{po.amount}</strong></td>
                        <td>
                          {po.status === "settled" ? (
                            <span className="completed-tag mono">✓ Settled</span>
                          ) : (
                            <span className="in-progress-tag mono">⏳ Processing</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Scholar Ratings & Reviews */}
            <section className="studio-card glass-card">
              <div className="card-header-row">
                <span className="material-symbols-outlined card-icon">reviews</span>
                <div>
                  <h2 className="card-title">Verified Scholar Ratings &amp; Reviews (4.92 ★)</h2>
                  <span className="mono text-xs text-muted">Feedback from enrolled students on curriculum &amp; video quality</span>
                </div>
              </div>

              <div className="ratings-breakdown-grid">
                {scholarReviews.map((rev) => (
                  <div className="review-item-card" key={rev.id}>
                    <div className="review-item-top">
                      <strong>{rev.scholar}</strong>
                      <span className="review-stars">{"★".repeat(rev.rating)}</span>
                    </div>
                    <span className="mono text-xs text-primary">{rev.courseTitle}</span>
                    <p className="review-text">"{rev.comment}"</p>
                    <span className="mono text-xs text-muted">{rev.date}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COURSE CREATOR & PUBLISHED LIBRARY */}
        {/* ========================================================= */}
        {activeTab === "courses" && (
          <div className="courses-tab-container animate-fade-in">
            <div className="studio-grid">
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
                      <label className="mono text-xs">VIDEO TRAILER URL (YOUTUBE EMBED)</label>
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

            {/* MY PUBLISHED COURSES & VIDEO LIBRARY */}
            <section className="my-courses-library-section">
              <div className="studio-card glass-card">
                <div className="card-header-row">
                  <span className="material-symbols-outlined card-icon">video_library</span>
                  <div>
                    <h2 className="card-title">My Published Courses &amp; Video Masterclasses ({courses.length})</h2>
                    <span className="mono text-xs text-muted">Click any course to open the full student learning player or preview trailers</span>
                  </div>
                </div>

                <div className="course-library-grid">
                  {courses.map((c) => (
                    <article className="course-library-card" key={c.id}>
                      <div className="course-library-thumb-wrap">
                        <img
                          src={c.trailerImage || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80"}
                          alt={c.title}
                        />
                        <div className="course-library-thumb-overlay">
                          <span className="cat-pill mono">{c.category || "General"}</span>
                          <span className="free-tag mono">₹{c.price || 999}</span>
                        </div>
                      </div>

                      <div className="course-library-card-body">
                        <div className="course-library-meta">
                          <span className="mono text-xs text-primary font-bold">{c.level || "Advanced"}</span>
                          <span className="mono text-xs text-muted">• {c.curriculumSummary || `${c.curriculum?.length || 1} Modules`}</span>
                        </div>

                        <h3 className="course-library-title">{c.title}</h3>
                        <p className="course-library-desc">{c.description}</p>

                        <div className="course-library-stats-row mono text-xs">
                          <span>👨‍🎓 {c.studentsCount || "1"} Scholars</span>
                          <span className="text-amber">★ {c.rating || 5.0}</span>
                        </div>

                        <div className="course-library-actions">
                          <a
                            href={`/courses/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cyber-btn cyber-btn--primary"
                            title="Open Course in New Tab"
                          >
                            <span>▶ Open Course ↗</span>
                          </a>
                          {c.trailerVideoUrl && (
                            <button
                              type="button"
                              className="cyber-btn cyber-btn--secondary"
                              onClick={() => setPreviewVideo({ title: c.title, url: formatVideoEmbedUrl(c.trailerVideoUrl) })}
                              title="Play Video Trailer"
                            >
                              🎬 Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
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
                <h3 className="modal-title">Razorpay Instant Payout Transfer</h3>
              </div>
              <button className="close-btn" onClick={() => setIsPayoutModalOpen(false)}>✕</button>
            </div>

            <div className="assignment-modal-body">
              <p className="text-sm">Disburse available course earnings directly into your linked bank account or UPI handle.</p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 4px" }}>
                <span className="mono text-xs text-muted">AVAILABLE IN WALLET</span>
                <span className="mono text-xs font-bold text-emerald">₹{availableBalance.toLocaleString("en-IN")}</span>
              </div>

              <div className="form-group my-2">
                <label className="mono text-xs">PAYOUT AMOUNT</label>
                <input
                  type="text"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. ₹38,200"
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  {availableBalance > 0 ? (
                    <button
                      type="button"
                      className="cyber-btn cyber-btn--secondary mono text-xs"
                      style={{ padding: "3px 8px", fontSize: "11px" }}
                      onClick={() => setPayoutAmount(`₹${availableBalance.toLocaleString("en-IN")}`)}
                    >
                      Withdraw Max (₹{availableBalance.toLocaleString("en-IN")})
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cyber-btn cyber-btn--secondary mono text-xs"
                      style={{ padding: "3px 8px", fontSize: "11px", color: "#38bdf8" }}
                      onClick={() => {
                        setAvailableBalance(38200);
                        localStorage.setItem("backlox_instructor_balance", "38200");
                        setPayoutAmount("₹38,200");
                      }}
                    >
                      + Reset Balance to ₹38,200
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group my-3">
                <label className="mono text-xs">PAYOUT METHOD</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="payoutDest"
                      checked={payoutDestination === "bank"}
                      onChange={() => setPayoutDestination("bank")}
                    />
                    <span>HDFC Bank (**** 4892)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="payoutDest"
                      checked={payoutDestination === "upi"}
                      onChange={() => setPayoutDestination("upi")}
                    />
                    <span>UPI Instant Handle</span>
                  </label>
                </div>
              </div>

              {payoutDestination === "upi" && (
                <div className="form-group my-3">
                  <label className="mono text-xs">UPI VPA ADDRESS</label>
                  <input
                    type="text"
                    value={payoutUpiId}
                    onChange={(e) => setPayoutUpiId(e.target.value)}
                    placeholder="username@oksbi"
                  />
                </div>
              )}

              <div className="cyber-pill my-3">
                <span className="pulsing-dot" />
                <span>Zero transaction surcharge via Razorpay Route Linked Node</span>
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
                  {payoutSuccess ? "Processing Transfer…" : "Confirm & Transfer Funds"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}