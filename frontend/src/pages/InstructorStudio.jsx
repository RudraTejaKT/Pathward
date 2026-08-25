import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import "./InstructorStudio.css";

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
      setCourses(await api.getInstructorCourses());
    } catch (err) {
      setMsg(err.message || "Failed to add module.");
      setMsgType("error");
    } finally {
      setAddingModule(false);
    }
  }

  if (!user) {
    return (
      <div className="instructor-root">
        <div className="container instructor-gate">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>ACCESS RESTRICTED</span>
          </div>
          <h1 className="gradient-text">Instructor Creator Console</h1>
          <p className="subtext">
            Please sign in with an Instructor / Creator account to publish courses and monetize your curriculum via Razorpay.
          </p>
          <div className="gate-actions">
            <Link to="/login" className="cyber-btn cyber-btn--primary">
              Sign In as Instructor →
            </Link>
            <Link to="/signup?role=instructor" className="cyber-btn cyber-btn--secondary">
              Create Instructor Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!["instructor", "admin"].includes(user.role)) {
    return (
      <div className="instructor-root">
        <div className="container instructor-gate">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>STUDENT ACCOUNT DETECTED</span>
          </div>
          <h1 className="gradient-text">Want to teach on Pathward?</h1>
          <p className="subtext">
            You are currently logged in as a <strong>Student</strong> ({user.email}). To publish courses and sell modules, create or switch to an <strong>Instructor</strong> account.
          </p>
          <div className="gate-actions">
            <Link to="/signup?role=instructor" className="cyber-btn cyber-btn--primary">
              Register as Instructor →
            </Link>
            <Link to="/dashboard" className="cyber-btn cyber-btn--secondary">
              Back to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate instructor metrics
  const totalCourses = courses.length;
  const totalModules = courses.reduce((acc, c) => acc + (c.module_count || 0), 0);
  const estTotalRevenue = courses.reduce(
    (acc, c) => acc + (c.price_paise ? (c.price_paise / 100) * 12 : 0),
    0
  );

  return (
    <div className="instructor-root">
      {/* Background Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      <header className="instructor-header">
        <div className="container">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>CREATOR COMMAND STUDIO · INSTRUCTOR CONSOLE</span>
          </div>
          <h1 className="instructor-title gradient-text">Creator Studio</h1>
          <p className="instructor-sub">
            Author high-impact stream curriculum, configure Indian Rupee pricing (₹), embed high-definition video lectures, and distribute directly to scholars.
          </p>

          {/* Instructor Telemetry Strip */}
          <div className="instructor-telemetry-strip">
            <div className="inst-stat">
              <span className="stat-value mono">{totalCourses}</span>
              <span className="stat-label">Published Courses</span>
            </div>
            <div className="inst-divider" />
            <div className="inst-stat">
              <span className="stat-value mono">{totalModules}</span>
              <span className="stat-label">Total Modules &amp; Videos</span>
            </div>
            <div className="inst-divider" />
            <div className="inst-stat">
              <span className="stat-value mono">₹{estTotalRevenue.toLocaleString("en-IN")}</span>
              <span className="stat-label">Gross Revenue (INR)</span>
            </div>
            <div className="inst-divider" />
            <div className="inst-stat">
              <span className="stat-value mono text-emerald">Active</span>
              <span className="stat-label">Razorpay Merchant Status</span>
            </div>
          </div>
        </div>
      </header>

      <main className="instructor-main">
        <div className="container">
          {msg && (
            <div className={`studio-alert-msg ${msgType === "error" ? "error" : "success"}`}>
              {msgType === "error" ? "⚠️ " : "✅ "}
              {msg}
            </div>
          )}

          <div className="studio-forms-grid">
            {/* Create Course Form */}
            <form className="studio-glass-card glass-card" onSubmit={handleCreateCourse}>
              <div className="card-header-bar">
                <div className="command-dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--purple" />
                  <span className="dot dot--cyan" />
                </div>
                <span className="card-tag mono">NEW COURSE</span>
              </div>
              <h2 className="studio-card-title">Publish New Course</h2>
              <p className="studio-card-sub">
                Target an engineering branch or 12th stream with pricing in INR.
              </p>

              <div className="form-field">
                <label>Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Full-Stack Cloud Architecture (IIT Spec)"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Course Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe key learning outcomes, prerequisites, and industry projects included..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-field">
                  <label>Category / Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. AI & Data Science"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Target Stream</label>
                  <select
                    value={courseForm.stream_id}
                    onChange={(e) => setCourseForm({ ...courseForm, stream_id: e.target.value })}
                  >
                    <option value="">All Streams</option>
                    {streams.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Price in INR (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 499"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                  required
                />
              </div>

              <button className="cyber-btn cyber-btn--primary studio-submit-btn" disabled={creatingCourse}>
                {creatingCourse ? "Deploying Course…" : "🚀 Publish Course to Catalog"}
              </button>
            </form>

            {/* Add Module & Video Lecture Form */}
            <form className="studio-glass-card glass-card" onSubmit={handleAddModule}>
              <div className="card-header-bar">
                <div className="command-dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--purple" />
                  <span className="dot dot--cyan" />
                </div>
                <span className="card-tag mono">MODULE ATTACHMENT</span>
              </div>
              <h2 className="studio-card-title">Add Lecture &amp; Video Module</h2>
              <p className="studio-card-sub">
                Upload video lectures, set preview permissions, and attach project blueprints.
              </p>

              <div className="form-field">
                <label>Select Course</label>
                <select
                  value={moduleForm.courseId}
                  onChange={(e) => setModuleForm({ ...moduleForm, courseId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Module Title</label>
                <input
                  type="text"
                  placeholder="e.g. Module 1: Distributed Microservices & Docker"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Module Description</label>
                <textarea
                  rows={2}
                  placeholder="Lecture notes, core takeaways, and practice exercises..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>HD Video Lecture URL (MP4 / Stream / YouTube Embed)</label>
                <input
                  type="url"
                  placeholder="e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  value={moduleForm.videoUrl}
                  onChange={(e) => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-field">
                  <label>Position Index (Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleForm.position}
                    onChange={(e) => setModuleForm({ ...moduleForm, position: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Resource / Slide Deck PDF</label>
                  <input
                    type="file"
                    className="file-input"
                    onChange={(e) => setModuleForm({ ...moduleForm, file: e.target.files?.[0] || null })}
                  />
                </div>
              </div>

              <button className="cyber-btn cyber-btn--secondary studio-submit-btn" disabled={addingModule}>
                {addingModule ? "Uploading Module…" : "➕ Attach Module & Video"}
              </button>
            </form>
          </div>

          {/* Active Course Management Section */}
          <section className="courses-management-section">
            <div className="section-title-row">
              <h2 className="section-heading">Your Active Course Catalog</h2>
              <span className="mono text-muted">{courses.length} courses online</span>
            </div>

            {loading ? (
              <p className="mono text-muted">Retrieving instructor courses…</p>
            ) : courses.length === 0 ? (
              <div className="empty-courses-box glass-card">
                <p>No courses published yet. Use the creation console above to publish your first course.</p>
              </div>
            ) : (
              <div className="courses-inventory-grid">
                {courses.map((course) => (
                  <article className="course-inventory-card glass-card" key={course.id}>
                    <div className="inventory-card-top">
                      <span className="inst-badge mono">{course.stream_id || "All Streams"}</span>
                      <span className="inst-price mono">₹{(course.price_paise / 100).toFixed(0)}</span>
                    </div>

                    <h3 className="inventory-title">{course.title}</h3>
                    <p className="inventory-desc">{course.description}</p>

                    <div className="inventory-meta-row">
                      <span className="mono text-xs">📚 {course.module_count} Modules Published</span>
                      <span className="mono text-xs text-primary">Status: Live</span>
                    </div>

                    <div className="inventory-card-footer">
                      <Link to={`/courses/${course.id}`} className="inventory-view-btn">
                        Preview Course Viewport →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}