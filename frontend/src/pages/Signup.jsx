import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

const STUDENT_INTERESTS_OPTIONS = [
  { id: "ai", label: "🤖 AI & Machine Learning" },
  { id: "medicine", label: "🩺 Clinical Medicine & Surgery" },
  { id: "programming", label: "💻 Problem Solving & Algorithms" },
  { id: "fintech", label: "📈 FinTech & Stock Markets" },
  { id: "robotics", label: "🦾 Robotics & Embedded IoT" },
  { id: "upsc", label: "🏛️ UPSC & Public Policy" },
  { id: "design", label: "🎨 UI/UX & Product Design" },
  { id: "law", label: "⚖️ Corporate Law & Litigation" },
  { id: "security", label: "🔒 Cybersecurity & Defense" },
  { id: "biotech", label: "🧬 Genetic Engineering & Biotech" },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role: 'trainee' | 'instructor'
  const [role, setRole] = useState("trainee");

  // Core Auth Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");

  // Student Profile Fields
  const [education, setEducation] = useState("Undergraduate (B.Tech / MBBS / B.Com / B.Sc)");
  const [institution, setInstitution] = useState("");
  const [targetStream, setTargetStream] = useState("Computer Science & AI");
  const [selectedInterests, setSelectedInterests] = useState(["ai", "programming"]);

  // Instructor Profile Fields
  const [qualification, setQualification] = useState("Master's Degree (M.Tech / MD / MS / MBA)");
  const [instructorOrg, setInstructorOrg] = useState("");
  const [expertise, setExpertise] = useState("Computer Science & Machine Learning");
  const [experience, setExperience] = useState("3–5 Years");
  const [bio, setBio] = useState("");

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "instructor") {
      setRole("instructor");
    }
  }, [searchParams]);

  function toggleInterest(id) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        phone,
        password,
        gender,
        role,
        education: role === "instructor" ? qualification : education,
        institution: role === "instructor" ? instructorOrg : institution,
        interests: role === "instructor" ? [expertise] : selectedInterests,
        experience: role === "instructor" ? experience : targetStream,
        expertise: role === "instructor" ? expertise : targetStream,
        bio: role === "instructor" ? bio : `Target Stream: ${targetStream}`,
      };

      const user = await signup(payload);
      if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Could not complete registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Main Registration Area */}
      <main className="login-main">
        <div className="login-card-container login-card-container--wide">
          <div className="login-heading-group">
            <div className="cyber-pill mb-3">
              <span className="pulsing-dot" />
              <span>{role === "instructor" ? "CREATOR & FACULTY PORTAL" : "COMPREHENSIVE SCHOLAR ONBOARDING"}</span>
            </div>
            <h1 className="login-title gradient-text">
              {role === "instructor" ? "Become a Backlox Faculty" : "Build Your Scholar Profile"}
            </h1>
            <p className="login-sub">
              {role === "instructor"
                ? "Publish stream-aligned video masterclasses, create assignments, and monetize course revenue."
                : "Personalized syllabus roadmaps, competitive aptitude gym, and verified career match telemetry."}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${role === "trainee" ? "active" : ""}`}
              onClick={() => setRole("trainee")}
            >
              <span className="material-symbols-outlined">school</span>
              <span>Student / Scholar</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${role === "instructor" ? "active" : ""}`}
              onClick={() => setRole("instructor")}
            >
              <span className="material-symbols-outlined">co_present</span>
              <span>Instructor / Faculty</span>
            </button>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form className="login-form glass-card" onSubmit={handleSubmit}>
            {/* Section 1: Core Personal & Contact Details */}
            <div className="form-section-title mono text-xs text-primary">
              1. PERSONAL &amp; CONTACT CREDENTIALS
            </div>

            <div className="form-grid-2col">
              <div className="form-field">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder={role === "instructor" ? "Dr. / Prof. Aryan Sharma" : "Aryan Sharma"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={role === "instructor" ? "instructor@backlox.edu" : "student@university.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-field">
                <label htmlFor="phone">Phone Number (+91) *</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Create Secure Password *</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters with numbers & symbols"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Section 2: Role-Specific Professional / Academic Details */}
            {role === "trainee" && (
              <>
                <div className="form-section-title mono text-xs text-secondary mt-3">
                  2. ACADEMIC BACKGROUND &amp; CAREER ASPIRATIONS
                </div>

                <div className="form-grid-2col">
                  <div className="form-field">
                    <label htmlFor="education">Current Education Level *</label>
                    <select
                      id="education"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      required
                    >
                      <option value="Class 10th (Secondary)">Class 10th (Secondary)</option>
                      <option value="Class 11th (Junior College)">Class 11th (Junior College)</option>
                      <option value="Class 12th (MPC / PCMB / MEC / BiPC)">Class 12th (MPC / PCMB / MEC / BiPC)</option>
                      <option value="Undergraduate (B.Tech / MBBS / B.Com / B.Sc / BA)">
                        Undergraduate (B.Tech / MBBS / B.Com / B.Sc / BA)
                      </option>
                      <option value="Postgraduate (M.Tech / MD / MS / MBA)">Postgraduate (M.Tech / MD / MS / MBA)</option>
                      <option value="Working Professional / Upskilling">Working Professional / Upskilling</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="institution">School / College / University *</label>
                    <input
                      id="institution"
                      type="text"
                      placeholder="e.g. IIT Bombay / AIIMS Delhi / BITS Pilani"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="targetStream">Primary Academic Stream of Interest *</label>
                  <select
                    id="targetStream"
                    value={targetStream}
                    onChange={(e) => setTargetStream(e.target.value)}
                    required
                  >
                    <option value="Computer Science & AI">Computer Science &amp; Artificial Intelligence</option>
                    <option value="Electronics & Embedded Systems">Electronics &amp; Embedded Systems (VLSI)</option>
                    <option value="Mechanical & Mechatronics">Mechanical Engineering &amp; Robotics</option>
                    <option value="Civil Infrastructure & BIM">Civil Infrastructure &amp; Smart Cities</option>
                    <option value="MBBS & Clinical Medicine">MBBS &amp; Clinical Surgery</option>
                    <option value="Dental & Allied Health">Dental Sciences &amp; Physiotherapy</option>
                    <option value="Commerce & FinTech">Commerce, Banking &amp; FinTech</option>
                    <option value="Corporate Law & Policy">Corporate Law &amp; Judicial Services</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Likes &amp; Career Interests (Select All That Apply):</label>
                  <div className="interests-badges-grid">
                    {STUDENT_INTERESTS_OPTIONS.map((item) => {
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`interest-chip mono text-xs ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleInterest(item.id)}
                        >
                          <span>{item.label}</span>
                          {isSelected && <span className="material-symbols-outlined check-icon">check</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Section 2 (Instructor): Faculty Credentials */}
            {role === "instructor" && (
              <>
                <div className="form-section-title mono text-xs text-amber mt-3">
                  2. FACULTY CREDENTIALS &amp; DOMAIN EXPERTISE
                </div>

                <div className="form-grid-2col">
                  <div className="form-field">
                    <label htmlFor="qualification">Highest Educational Qualification *</label>
                    <select
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      required
                    >
                      <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                      <option value="Master's Degree (M.Tech / MD / MS / MBA)">Master's Degree (M.Tech / MD / MS / MBA)</option>
                      <option value="Bachelor's Degree (B.Tech / MBBS)">Bachelor's Degree (B.Tech / MBBS)</option>
                      <option value="Industry Fellow / Certified Lead Architect">Industry Fellow / Certified Lead Architect</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="instructorOrg">Organization / University / Institute *</label>
                    <input
                      id="instructorOrg"
                      type="text"
                      placeholder="e.g. Stanford / AIIMS / Microsoft Research"
                      value={instructorOrg}
                      onChange={(e) => setInstructorOrg(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-field">
                    <label htmlFor="expertise">Primary Domain of Expertise *</label>
                    <input
                      id="expertise"
                      type="text"
                      placeholder="e.g. Distributed Systems & Generative AI"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="experience">Years of Experience *</label>
                    <select
                      id="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    >
                      <option value="1–3 Years">1–3 Years</option>
                      <option value="3–5 Years">3–5 Years</option>
                      <option value="5–10 Years">5–10 Years</option>
                      <option value="10+ Years / Lead Faculty">10+ Years / Lead Faculty</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="bio">Professional Bio &amp; Profile Link (LinkedIn / Scholar)</label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Briefly describe your background, industry experience, and published work or certifications..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting
                ? "Creating Verified Profile…"
                : role === "instructor"
                ? "Launch Instructor Studio →"
                : "Create Verified Student Account →"}
            </button>
          </form>

          <div className="auth-switch">
            <span>Already registered? </span>
            <Link to="/login" className="auth-link">
              Sign in to Backlox
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
