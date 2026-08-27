import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import VideoPlayer from "../components/VideoPlayer.jsx";
import {
  COURSE_CATALOG,
  enrollCourse,
  setActiveCourse,
  toggleLessonCompletion,
  saveCustomCourse,
  loadSavedCustomCourses,
  formatVideoEmbedUrl,
} from "../lib/coursesData.js";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [course, setCourse] = useState(() => {
    loadSavedCustomCourses();
    const match = COURSE_CATALOG[courseId] || Object.values(COURSE_CATALOG).find(c => String(c.id) === String(courseId));
    return match || COURSE_CATALOG["feat-1"];
  });

  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(() => {
    return formatVideoEmbedUrl(course.trailerVideoUrl || course.curriculum?.[0]?.videoUrl);
  });
  const [activeLessonTitle, setActiveLessonTitle] = useState("Course Trailer & Video Lecture");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    loadSavedCustomCourses();
    const localMatch = COURSE_CATALOG[courseId] || Object.values(COURSE_CATALOG).find(c => String(c.id) === String(courseId));
    if (localMatch) {
      setCourse(localMatch);
      const vid = formatVideoEmbedUrl(localMatch.trailerVideoUrl || localMatch.curriculum?.[0]?.videoUrl);
      setCurrentVideoUrl(vid);
    }

    // Also sync from backend API to load modules and DB courses
    api.getCourse(courseId)
      .then((res) => {
        if (res && res.course) {
          const c = res.course;
          const mods = res.modules || [];
          const primaryVid = formatVideoEmbedUrl(c.trailer_video_url || mods[0]?.video_url || "https://www.youtube.com/embed/aircAruvnKk");
          
          const unifiedCourse = {
            id: String(c.id),
            title: c.title,
            category: c.category || "Software & AI",
            streamId: c.stream_id || "science",
            branchId: "cse",
            level: "Advanced",
            instructor: c.instructor_name || "Course Instructor",
            rating: 5.0,
            reviewsCount: "1",
            studentsCount: "12",
            price: Math.round((c.price_paise || 99900) / 100),
            originalPrice: Math.round((c.price_paise || 99900) / 100) * 2,
            videoDuration: "1h 30m Total",
            trailerVideoUrl: primaryVid,
            trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
            description: c.description || "",
            curriculumSummary: `${mods.length || 1} modules • 1h 30m`,
            curriculum: mods.length > 0
              ? mods.map((m, idx) => ({
                  id: String(m.id || idx + 1),
                  number: m.position || idx + 1,
                  title: m.title,
                  codeSnippet: `// Module: ${m.title}\nconsole.log("Module initialized");`,
                  isFreePreview: idx === 0,
                  duration: "45:00",
                  videoUrl: formatVideoEmbedUrl(m.video_url || primaryVid),
                  assignment: {
                    id: m.id || idx + 1,
                    title: `${m.title} Practical Task`,
                    description: m.description || "Complete module objectives.",
                    starterCode: "// Solution code",
                    due: "Next Week",
                    maxPoints: 100,
                  },
                  lessons: [
                    {
                      id: `l-${m.id || idx + 1}`,
                      title: m.title,
                      duration: "45:00",
                      isPreview: idx === 0,
                      videoUrl: formatVideoEmbedUrl(m.video_url || primaryVid)
                    }
                  ]
                }))
              : [
                  {
                    id: "mod-1",
                    number: 1,
                    title: `Foundations of ${c.title}`,
                    codeSnippet: `// ${c.title} Module 1\nconsole.log("Started");`,
                    isFreePreview: true,
                    duration: "1h 30m",
                    videoUrl: primaryVid,
                    assignment: {
                      id: 1,
                      title: `${c.title} Capstone`,
                      description: c.description || "Course capstone project.",
                      starterCode: "// Solution code",
                      due: "Next Week",
                      maxPoints: 100,
                    },
                    lessons: [
                      {
                        id: "l-1",
                        title: "Full Video Masterclass Lecture",
                        duration: "45:00",
                        isPreview: true,
                        videoUrl: primaryVid
                      }
                    ]
                  }
                ]
          };
          setCourse(unifiedCourse);
          saveCustomCourse(unifiedCourse);
          setCurrentVideoUrl(primaryVid);
        }
      })
      .catch(() => {});
  }, [courseId]);

  useEffect(() => {
    // Check if user already enrolled or is Pro/instructor
    const enrolledMap = JSON.parse(localStorage.getItem("pathward_enrolled_courses") || "{}");
    if (enrolledMap[course.id] || (user && (user.isPremium || user.role === "instructor" || user.role === "admin"))) {
      setIsEnrolled(true);
    }
  }, [course.id, user]);

  function handlePlayLesson(module, lesson) {
    const isUnlocked = module.isFreePreview || isEnrolled || (user && (user.isPremium || user.role === "instructor" || user.role === "admin"));
    if (!isUnlocked) {
      setIsCheckoutOpen(true);
      return;
    }

    if (lesson && lesson.id) {
      toggleLessonCompletion(course.id, lesson.id, true);
    }
    setActiveCourse(course.id);

    const targetUrl = formatVideoEmbedUrl(lesson?.videoUrl || module?.videoUrl || course.trailerVideoUrl);
    setCurrentVideoUrl(targetUrl);
    setActiveLessonTitle(`${module.title} — ${lesson.title}`);
    setIsPlayingVideo(true);
  }

  function handlePlayTrailer() {
    setCurrentVideoUrl(formatVideoEmbedUrl(course.trailerVideoUrl));
    setActiveLessonTitle("Course Trailer & Video Lecture");
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
        name: "Backlox",
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
      enrollCourse(course.id);
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
            <div className="modal-swipe-handle" />
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
            <div className="modal-swipe-handle" />
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
