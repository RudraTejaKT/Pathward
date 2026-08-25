import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import VideoPlayer from "../components/VideoPlayer.jsx";
import "./CourseDetail.css";

const COURSE_DATABASE = {
  "feat-1": {
    id: "feat-1",
    title: "Advanced Machine Learning & Neural Transformers",
    category: "Software & AI",
    streamId: "science",
    branchId: "cse",
    level: "Advanced",
    instructor: "Dr. Eleanor Vance (Ex-DeepMind)",
    rating: 4.9,
    reviewsCount: "1,420",
    studentsCount: "9.2k",
    price: 1499,
    originalPrice: 2999,
    videoDuration: "3:40 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    description: "Master modern deep learning, transformer architectures, reinforcement learning, and production MLOps pipelines.",
    outcomes: [
      "Implement transformer architectures & attention mechanisms from scratch in PyTorch.",
      "Deploy scalable inference endpoints on AWS/GCP with Docker and FastAPI.",
      "Fine-tune Large Language Models (LLMs) using LoRA and QLoRA quantization."
    ],
    curriculumSummary: "3 modules • 14h 20m",
    curriculum: [
      {
        id: "mod-1",
        title: "Module 1: Foundations of Deep Learning & PyTorch",
        isFreePreview: true,
        lessonsCount: "3 lessons",
        duration: "1h 40m",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        lessons: [
          { id: "l-1", title: "Backpropagation & Computational Graphs", duration: "25:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-2", title: "Custom Loss Functions & Optimizers (AdamW)", duration: "30:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-3", title: "PyTorch Tensor Operations & GPU Acceleration", duration: "45:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Transformer Architectures & Self-Attention",
        isFreePreview: false,
        lessonsCount: "3 lessons",
        duration: "2h 30m",
        videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w",
        lessons: [
          { id: "l-4", title: "Scaled Dot-Product & Multi-Head Attention", duration: "35:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w" },
          { id: "l-5", title: "Positional Encodings & BERT vs GPT Decoders", duration: "40:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w" },
          { id: "l-6", title: "Building a Mini-Transformer from Scratch", duration: "75:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w" }
        ]
      },
      {
        id: "mod-3",
        title: "Module 3: MLOps, Containerization & API Deployment",
        isFreePreview: false,
        lessonsCount: "2 lessons",
        duration: "2h 10m",
        videoUrl: "https://www.youtube.com/embed/bXb9dJ2bOls",
        lessons: [
          { id: "l-7", title: "Model Export to ONNX & TensorRT", duration: "30:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/bXb9dJ2bOls" },
          { id: "l-8", title: "FastAPI Async Serving with Docker & Kubernetes", duration: "60:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/bXb9dJ2bOls" }
        ]
      }
    ]
  },
  "feat-2": {
    id: "feat-2",
    title: "UX/UI Foundations & Scalable Design Systems",
    category: "Design & Product",
    streamId: "arts",
    branchId: "it",
    level: "Intermediate",
    instructor: "Marcus Thorne (Lead UX Architect)",
    rating: 4.8,
    reviewsCount: "1,204",
    studentsCount: "8.5k",
    price: 999,
    originalPrice: 1999,
    videoDuration: "2:14 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
    trailerImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    description: "Design systems, typography grids, accessibility, and high-fidelity interactive prototyping for modern scale.",
    outcomes: [
      "Conduct effective user interviews and usability tests without observer bias.",
      "Analyze qualitative data using affinity mapping, thematic analysis, and user journeys.",
      "Translate research findings into actionable design tokens and component systems."
    ],
    curriculumSummary: "3 modules • 6h 30m",
    curriculum: [
      {
        id: "mod-1",
        title: "Module 1: Introduction to UX Design Tokens",
        isFreePreview: true,
        lessonsCount: "3 lessons",
        duration: "45m",
        videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
        lessons: [
          { id: "l-1", title: "Design Tokens & Micro-Interactions", duration: "15:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU" },
          { id: "l-2", title: "Information Architecture & Card Sorting", duration: "15:30", isPreview: true, videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU" },
          { id: "l-3", title: "Accessibility (WCAG AAA Standards)", duration: "14:30", isPreview: true, videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU" }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Advanced Design System Scaling",
        isFreePreview: false,
        lessonsCount: "2 lessons",
        duration: "1h 30m",
        videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
        lessons: [
          { id: "l-4", title: "Component Variants & Auto-Layout 4.0", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU" },
          { id: "l-5", title: "Design System Documentation & Storybook Sync", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/c9Wg6Cb_YlU" }
        ]
      }
    ]
  },
  "feat-3": {
    id: "feat-3",
    title: "Clinical Medicine & Diagnostic Reasoning",
    category: "Medical & Health",
    streamId: "medical",
    branchId: "mbbs",
    level: "Intermediate / PG Prep",
    instructor: "Dr. Arvind Swaminathan (MD, DNB Cardiology)",
    rating: 4.95,
    reviewsCount: "2,350",
    studentsCount: "11.4k",
    price: 1299,
    originalPrice: 2499,
    videoDuration: "4:10 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk",
    trailerImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    description: "Master bedside clinical examination, 12-lead ECG interpretation, emergency casualty triage, and case study audits.",
    outcomes: [
      "Systematic 12-lead ECG analysis and cardiac rhythm diagnosis.",
      "Emergency ABCDE triage protocols in acute casualty scenarios.",
      "Differential diagnosis formulation using the Bayes clinical theorem approach."
    ],
    curriculumSummary: "3 modules • 11h 45m",
    curriculum: [
      {
        id: "mod-1",
        title: "Module 1: Bedside Cardiovascular & Chest Examination",
        isFreePreview: true,
        lessonsCount: "2 lessons",
        duration: "1h 00m",
        videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk",
        lessons: [
          { id: "l-1", title: "Cardiovascular Bedside Auscultation & Heart Murmurs", duration: "25:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk" },
          { id: "l-2", title: "Cranial Nerve Neurological Reflex Testing", duration: "35:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk" }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: 12-Lead ECG Advanced Diagnostic Masterclass",
        isFreePreview: false,
        lessonsCount: "2 lessons",
        duration: "1h 30m",
        videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk",
        lessons: [
          { id: "l-3", title: "ST-Elevation STEMI Localisation & Mimics", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk" },
          { id: "l-4", title: "Arrhythmias, Heart Blocks & Electrolyte Imbalances", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/F_KjW0nI8Hk" }
        ]
      }
    ]
  },
  "feat-4": {
    id: "feat-4",
    title: "Distributed Systems & Cloud Architecture",
    category: "Engineering & Cloud",
    streamId: "science",
    branchId: "cse",
    level: "Advanced",
    instructor: "Vikram Malhotra (Principal Cloud Architect)",
    rating: 4.9,
    reviewsCount: "1,890",
    studentsCount: "14.2k",
    price: 1799,
    originalPrice: 3499,
    videoDuration: "3:15 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E",
    trailerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    description: "Scale applications across Kubernetes, microservices, Kafka event streaming, and multi-region cloud systems.",
    outcomes: [
      "Design fault-tolerant distributed consensus with Raft/Paxos.",
      "Build high-throughput Kafka streaming topologies.",
      "Architect zero-downtime multi-region Kubernetes clusters."
    ],
    curriculumSummary: "3 modules • 18h 00m",
    curriculum: [
      {
        id: "mod-1",
        title: "Module 1: Consensus & Distributed Replication",
        isFreePreview: true,
        lessonsCount: "2 lessons",
        duration: "1h 15m",
        videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E",
        lessons: [
          { id: "l-1", title: "CAP Theorem vs PACELC Theorem in Practice", duration: "30:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E" },
          { id: "l-2", title: "Vector Clocks & Two-Phase Commit Protocols", duration: "45:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E" }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: High-Throughput Event-Driven Systems (Kafka)",
        isFreePreview: false,
        lessonsCount: "2 lessons",
        duration: "1h 45m",
        videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E",
        lessons: [
          { id: "l-3", title: "Kafka Partitions, Consumer Groups & Offsets", duration: "50:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E" },
          { id: "l-4", title: "Exactly-Once Semantics & Distributed Caching", duration: "55:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/Y6Ev8GIsS3E" }
        ]
      }
    ]
  },
  default: {
    id: "default",
    title: "Advanced Machine Learning & Cloud Systems",
    category: "Software & AI",
    streamId: "science",
    branchId: "cse",
    level: "Intermediate",
    instructor: "Dr. Eleanor Vance",
    rating: 4.8,
    reviewsCount: "1,204",
    studentsCount: "8.5k",
    price: 999,
    originalPrice: 1999,
    videoDuration: "2:14 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    description: "Master foundational and advanced engineering principles to design high-throughput scalable applications.",
    outcomes: [
      "Understand end-to-end system architecture from database to UI.",
      "Analyze data models and optimize distributed consensus.",
      "Deploy production-grade code with automated CI/CD."
    ],
    curriculumSummary: "2 modules • 4h 30m",
    curriculum: [
      {
        id: "mod-1",
        title: "Module 1: Architecture Foundations",
        isFreePreview: true,
        lessonsCount: "2 lessons",
        duration: "45m",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        lessons: [
          { id: "l-1", title: "Core System Principles", duration: "15:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-2", title: "High-Throughput Design Patterns", duration: "30:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" }
        ]
      }
    ]
  }
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const course = COURSE_DATABASE[courseId] || COURSE_DATABASE["default"];

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(course.trailerVideoUrl);
  const [activeLessonTitle, setActiveLessonTitle] = useState("Course Trailer & Architecture Overview");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    // Check if user already enrolled
    const enrolledMap = JSON.parse(localStorage.getItem("pathward_enrolled_courses") || "{}");
    if (enrolledMap[course.id] || (user && user.isPremium)) {
      setIsEnrolled(true);
    }
  }, [course.id, user]);

  function handlePlayLesson(module, lesson) {
    const isUnlocked = module.isFreePreview || isEnrolled || (user && user.isPremium);
    if (!isUnlocked) {
      setIsCheckoutOpen(true);
      return;
    }

    const targetUrl = lesson?.videoUrl || module?.videoUrl || course.trailerVideoUrl;
    setCurrentVideoUrl(targetUrl);
    setActiveLessonTitle(`${module.title} — ${lesson.title}`);
    setIsPlayingVideo(true);
  }

  function handlePlayTrailer() {
    setCurrentVideoUrl(course.trailerVideoUrl);
    setActiveLessonTitle("Course Trailer & Architecture Overview");
    setIsPlayingVideo(true);
  }

  async function handleRazorpayPayment() {
    if (!user) {
      navigate(`/login?redirect=/courses/${course.id}`);
      return;
    }

    setPayError(null);
    setPaying(true);

    try {
      // 1. Create order on backend
      const order = await api.createOrder({
        courseId: course.id,
        plan: `course_${course.id}`,
      });

      // 2. Open Razorpay Checkout Dialog
      const paymentResult = await openRazorpayCheckout(order, user, {
        name: "Pathward Universe",
        description: `Enrollment: ${course.title}`,
        notes: {
          courseId: course.id,
          category: course.category,
        },
      });

      // 3. Verify server-side HMAC signature
      await api.verifyPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      // 4. Mark enrolled
      const enrolledMap = JSON.parse(localStorage.getItem("pathward_enrolled_courses") || "{}");
      enrolledMap[course.id] = true;
      localStorage.setItem("pathward_enrolled_courses", JSON.stringify(enrolledMap));

      setIsEnrolled(true);
      setReceiptData({
        paymentId: paymentResult.razorpay_payment_id,
        orderId: paymentResult.razorpay_order_id,
        amount: course.price,
      });
      setShowSuccessModal(true);
      setIsCheckoutOpen(false);

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      if (err.message !== "Payment was cancelled by user.") {
        setPayError(err.message || "Payment process could not be completed.");
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="course-detail-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Top Header */}
      <header className="course-detail-header">
        <div className="container course-detail-header__inner">
          <button
            type="button"
            className="course-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back</span>
          </button>
          <div className="course-header-title-wrap">
            <span className="course-header-title gradient-text">{course.title}</span>
          </div>
          <Link to={user ? "/dashboard" : "/login"} className="course-header-profile">
            {user?.name ? (
              <div className="course-header-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                account_circle
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="course-detail-main">
        <div className="container">
          {/* Working Video Player Component */}
          <div className="course-video-section">
            {isPlayingVideo ? (
              <VideoPlayer
                videoUrl={currentVideoUrl}
                posterImage={course.trailerImage}
                title={activeLessonTitle}
                courseId={course.id}
                onClose={() => setIsPlayingVideo(false)}
              />
            ) : (
              <div className="trailer-preview-box glass-card">
                <img
                  src={course.trailerImage}
                  alt={course.title}
                  className="course-video-thumb"
                />
                <div className="course-video-overlay">
                  <button
                    type="button"
                    className="course-play-btn"
                    onClick={handlePlayTrailer}
                    aria-label="Play course trailer"
                  >
                    <span className="material-symbols-outlined play-icon">play_arrow</span>
                  </button>
                  <span className="play-hint-text">Click to Play 1080p HD Video Lecture</span>
                </div>
                <div className="course-video-badge mono">{course.videoDuration}</div>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="course-content-grid">
            {/* Left Column: Details & Curriculum */}
            <div className="course-left-col">
              <section className="course-info-section glass-card">
                <div className="course-pills-row">
                  <span className="course-pill course-pill--primary mono">{course.category}</span>
                  <span className="course-pill course-pill--secondary mono">{course.level}</span>
                  {isEnrolled ? (
                    <span className="course-pill course-pill--enrolled mono">✓ Enrolled with Pro</span>
                  ) : (
                    <span className="course-pill course-pill--limited mono">Module 1 Free Preview</span>
                  )}
                </div>

                <h1 className="course-main-title gradient-text">{course.title}</h1>
                <p className="course-desc-text">{course.description}</p>

                <div className="course-instructor-row">
                  <span className="material-symbols-outlined inst-icon">co_present</span>
                  <span>Taught by <strong>{course.instructor}</strong></span>
                </div>

                <div className="course-stats-row">
                  <div className="course-stat-item">
                    <span className="material-symbols-outlined star-icon">star</span>
                    <span className="stat-rating font-bold">{course.rating}</span>
                    <span className="stat-reviews">({course.reviewsCount} reviews)</span>
                  </div>
                  <div className="course-stat-item">
                    <span className="material-symbols-outlined group-icon">group</span>
                    <span className="stat-students">{course.studentsCount} scholars enrolled</span>
                  </div>
                </div>

                <div className="course-outcomes-box">
                  <h3>What you'll master:</h3>
                  <ul className="outcomes-list">
                    {course.outcomes.map((item, idx) => (
                      <li key={idx}>
                        <span className="material-symbols-outlined check-icon">check_circle</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Extracted Curriculum Modules Section */}
              <section className="course-curriculum-section glass-card">
                <div className="curriculum-header-row">
                  <div>
                    <h2 className="curriculum-title">Course Modules &amp; Video Lectures</h2>
                    <p className="curriculum-sub mono text-xs">
                      {course.curriculumSummary} · {isEnrolled ? "All modules unlocked" : "Module 1 free / Modules 2+ pro"}
                    </p>
                  </div>
                </div>

                <div className="curriculum-modules-stack">
                  {course.curriculum.map((mod, mIdx) => {
                    const isUnlocked = mod.isFreePreview || isEnrolled || (user && user.isPremium);

                    return (
                      <div className={`module-accordion-card ${isUnlocked ? "unlocked" : "locked"}`} key={mod.id || mIdx}>
                        <div className="module-header-bar">
                          <div className="module-title-group">
                            <span className="material-symbols-outlined mod-status-icon">
                              {isUnlocked ? "play_circle" : "lock"}
                            </span>
                            <div>
                              <h3 className="mod-title-text">{mod.title}</h3>
                              <span className="mod-meta-sub mono text-xs">
                                {mod.lessonsCount} · {mod.duration}
                              </span>
                            </div>
                          </div>

                          <div className="module-badge-status">
                            {mod.isFreePreview ? (
                              <span className="preview-badge mono">Free Preview</span>
                            ) : isUnlocked ? (
                              <span className="unlocked-badge mono">Unlocked</span>
                            ) : (
                              <button
                                className="unlock-pro-btn mono"
                                onClick={() => setIsCheckoutOpen(true)}
                              >
                                Unlock Pro 🔒
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Lessons List */}
                        <div className="lessons-list">
                          {mod.lessons.map((lesson, lIdx) => (
                            <div
                              className={`lesson-row ${isUnlocked ? "playable" : "disabled"}`}
                              key={lesson.id || lIdx}
                              onClick={() => handlePlayLesson(mod, lesson)}
                            >
                              <div className="lesson-left">
                                <span className="material-symbols-outlined lesson-play-icon">
                                  {isUnlocked ? "play_arrow" : "lock"}
                                </span>
                                <span className="lesson-name">{lesson.title}</span>
                              </div>
                              <div className="lesson-right mono text-xs">
                                <span>{lesson.duration}</span>
                                {isUnlocked && <span className="play-action-tag">▶ Play</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Pricing & Enrollment Action Card */}
            <div className="course-right-col">
              <div className="course-enroll-card glass-card">
                <div className="enroll-card-top">
                  <span className="mono text-xs text-secondary">LIFETIME ACCESS INCL. UPDATES</span>
                  <div className="pricing-box">
                    <span className="current-price mono">₹{course.price}</span>
                    <span className="original-price mono">₹{course.originalPrice}</span>
                    <span className="discount-tag mono">50% OFF</span>
                  </div>
                </div>

                <div className="enroll-features-list">
                  <div className="feat-line">
                    <span className="material-symbols-outlined">ondemand_video</span>
                    <span>1080p Video Lectures &amp; Source Code</span>
                  </div>
                  <div className="feat-line">
                    <span className="material-symbols-outlined">verified</span>
                    <span>Accredited Pathward Certificate</span>
                  </div>
                  <div className="feat-line">
                    <span className="material-symbols-outlined">support_agent</span>
                    <span>Direct Instructor Q&amp;A Blueprints</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <button className="cyber-btn cyber-btn--primary w-full" onClick={handlePlayTrailer}>
                    ▶ Continue Learning
                  </button>
                ) : (
                  <button
                    className="cyber-btn cyber-btn--primary w-full"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    ⚡ Enroll with Razorpay (₹{course.price})
                  </button>
                )}

                <div className="trust-seals-box">
                  <span className="mono text-xs text-muted">SECURED BY RAZORPAY · UPI, CARDS, NETBANKING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Drawer Modal */}
      {isCheckoutOpen && (
        <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-drawer glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Confirm Enrollment</h2>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="order-summary-box">
                <span className="order-course-title">{course.title}</span>
                <div className="order-total-row">
                  <span>Total Payable:</span>
                  <strong className="mono text-lg text-primary">₹{course.price} INR</strong>
                </div>
              </div>

              {payError && <div className="auth-error">⚠️ {payError}</div>}

              <button
                className="cyber-btn cyber-btn--primary w-full"
                onClick={handleRazorpayPayment}
                disabled={paying}
              >
                {paying ? "Opening Razorpay Gateway…" : `Pay ₹${course.price} & Unlock All Modules`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Celebration Modal */}
      {showSuccessModal && (
        <div className="modal-backdrop">
          <div className="celebration-modal glass-card">
            <div className="success-icon-wrap">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2>Enrollment Confirmed!</h2>
            <p className="subtext">
              You now have full unrestricted access to all modules, video lectures, and project blueprints.
            </p>
            {receiptData && (
              <div className="receipt-box mono text-xs">
                <div>Payment ID: {receiptData.paymentId}</div>
                <div>Amount Paid: ₹{receiptData.amount} INR</div>
              </div>
            )}
            <button
              className="cyber-btn cyber-btn--primary w-full"
              onClick={() => {
                setShowSuccessModal(false);
                handlePlayTrailer();
              }}
            >
              Start Module 1 Now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
