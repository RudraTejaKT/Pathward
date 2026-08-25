import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import "./AssessmentQuiz.css";

const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 1,
    category: "Interest & Activity",
    question: "When you have a free weekend to explore a self-driven project, which activity excites you most?",
    icon: "💡",
    options: [
      { id: "a", label: "Building an app, coding a script, or setting up a smart gadget / game" },
      { id: "b", label: "Reading about human health, medical breakthroughs, or biology & neurosciences" },
      { id: "c", label: "Analyzing stocks, startup business models, or planning an e-commerce venture" },
      { id: "d", label: "Designing 3D models, digital artwork, UI layouts, or sketching architectural plans" },
      { id: "e", label: "Writing essays, debating current affairs, studying legal cases or sociology" },
      { id: "f", label: "Tinkering with physical machines, DIY electronics, engines, or practical tools" },
    ],
  },
  {
    id: 2,
    category: "Problem Solving Style",
    question: "How do you prefer to tackle and solve complex challenges?",
    icon: "🧩",
    options: [
      { id: "a", label: "Breaking down problems into logical steps, algorithms, and math formulas" },
      { id: "b", label: "Observing symptoms/evidence, formulating scientific hypotheses, and clinical research" },
      { id: "c", label: "Evaluating financial risks, profit-loss trade-offs, and negotiating team strategy" },
      { id: "d", label: "Brainstorming creative visual metaphors, aesthetics, and user-centric prototypes" },
      { id: "e", label: "Analyzing ethical implications, historical precedents, and arguing legal perspectives" },
    ],
  },
  {
    id: 3,
    category: "Work Environment",
    question: "In what type of professional environment do you see yourself flourishing?",
    icon: "🏢",
    options: [
      { id: "a", label: "Tech hubs, software engineering campuses, or high-performance remote teams" },
      { id: "b", label: "Hospitals, medical research labs, emergency triage, or clinical centers" },
      { id: "c", label: "Investment banks, corporate boardrooms, equity trading floors, or FinTech startups" },
      { id: "d", label: "Creative design studios, architectural firms, or media production houses" },
      { id: "e", label: "Courts of law, public policy think-tanks, international diplomatic missions" },
    ],
  },
];

export default function AssessmentQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(DEFAULT_QUIZ_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [resultTab, setResultTab] = useState("overview");

  useEffect(() => {
    api
      .getAssessmentQuestions()
      .then((res) => {
        if (res && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      })
      .catch(() => {
        // Default questions are already mounted
      });
  }, []);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQ ? Math.round(((currentIndex + 1) / totalQ) * 100) : 0;

  function handleSelectOption(optionId) {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  }

  function handleNext() {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    if (answeredCount < totalQ) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQ} questions. Do you want to calculate your career match now? Unanswered questions won't contribute to the score.`
      );
      if (!confirmSubmit) return;
    }

    setEvaluating(true);
    setError(null);
    try {
      const res = await api.evaluateAssessment(answers);
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to evaluate assessment results");
    } finally {
      setEvaluating(false);
    }
  }

  function handleRetake() {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setResultTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="quiz-theme-root">
        <div className="quiz-loading-wrap">
          <p className="quiz-loading-text">LOADING CAREER ASSESSMENT...</p>
          <div className="quiz-spinner-elem" />
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="quiz-theme-root">
        <div className="quiz-error-card">
          <h2>Could not start assessment</h2>
          <p>{error}</p>
          <button className="quiz-primary-action-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- RESULT REPORT SCREEN ---
  if (result) {
    const { topStream, topBranch, streamMatches, branchMatches, studentTraits, recommendedExams, recommendedDegrees } = result;

    return (
      <div className="quiz-theme-root">
        <header className="quiz-theme-header">
          <div className="quiz-header-content-box">
            <div className="quiz-header-brand-row">
              <div className="quiz-brand-badge">
                <div className="quiz-brand-dot" />
                <span className="quiz-brand-name">Pathward</span>
              </div>
              <span className="quiz-header-tag">REPORT</span>
            </div>

            <div className="quiz-header-meta-group">
              <p className="quiz-step-indicator">
                CAREER ASSESSMENT COMPLETE
              </p>
              <h1 className="quiz-title-text">Your Career Match Report</h1>
            </div>
          </div>
        </header>

        <main className="quiz-theme-main">
          <div className="quiz-report-container">
            {/* Top Match Banner */}
            <div className="quiz-top-match-card">
              <div className="quiz-top-match-header">
                <span className="top-match-pill">
                  TOP MATCH: {topStream.matchPercentage}% ALIGNMENT
                </span>
                <h2 className="top-match-name">
                  {topStream.icon} {topStream.name}
                </h2>
                <p className="top-match-desc">{topStream.description}</p>
              </div>

              {topBranch && (
                <div className="top-branch-box">
                  <span className="top-branch-label">RECOMMENDED ENGINEERING BRANCH:</span>
                  <h3>{topBranch.name}</h3>
                  <div className="top-branch-keywords">
                    {topBranch.matchKeywords.map((kw) => (
                      <span key={kw} className="top-keyword-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="top-traits-section">
                <span className="top-traits-label">CORE STRENGTHS IDENTIFIED:</span>
                <div className="top-traits-pills">
                  {studentTraits.map((t) => (
                    <span key={t} className="top-trait-pill">
                      ✨ {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="quiz-report-tabs">
              <button
                className={`report-tab-btn ${resultTab === "overview" ? "active" : ""}`}
                onClick={() => setResultTab("overview")}
              >
                📊 All Streams
              </button>
              {topStream.streamKey === "engineering_tech" && (
                <button
                  className={`report-tab-btn ${resultTab === "branches" ? "active" : ""}`}
                  onClick={() => setResultTab("branches")}
                >
                  ⚙️ Branches
                </button>
              )}
              <button
                className={`report-tab-btn ${resultTab === "next_steps" ? "active" : ""}`}
                onClick={() => setResultTab("next_steps")}
              >
                🚀 Action Plan
              </button>
            </div>

            {resultTab === "overview" && (
              <div className="quiz-tab-content">
                <div className="stream-bars-list">
                  {streamMatches.map((sm, idx) => (
                    <div className="stream-bar-card" key={sm.streamKey}>
                      <div className="stream-bar-head">
                        <div className="stream-bar-title">
                          <span>{sm.icon}</span>
                          <strong>{sm.name}</strong>
                        </div>
                        <span className="stream-bar-score">{sm.matchPercentage}%</span>
                      </div>
                      <div className="stream-progress-track">
                        <div
                          className="stream-progress-bar"
                          style={{
                            width: `${sm.matchPercentage}%`,
                            backgroundColor: idx === 0 ? "#2563eb" : "#64748b",
                          }}
                        />
                      </div>
                      <p className="stream-bar-desc">{sm.description}</p>
                      <Link to={sm.learnPath} className="stream-link-action">
                        Explore this pathway →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultTab === "branches" && topStream.streamKey === "engineering_tech" && (
              <div className="quiz-tab-content">
                <div className="branch-cards-list">
                  {branchMatches.map((bm, idx) => (
                    <div className="branch-match-box" key={bm.branchId}>
                      <div className="branch-match-box-head">
                        <h3>{bm.name}</h3>
                        <span className="branch-match-score">{bm.matchPercentage}% match</span>
                      </div>
                      <Link to={bm.route} className="branch-view-link">
                        View Semester Roadmap &amp; Projects →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultTab === "next_steps" && (
              <div className="quiz-tab-content">
                <div className="action-plan-boxes">
                  <div className="action-plan-card">
                    <h4>Target Entrance Exams</h4>
                    <div className="exam-pills-row">
                      {recommendedExams.map((e) => (
                        <span key={e} className="exam-pill">
                          📝 {e}
                        </span>
                      ))}
                    </div>
                    <Link to="/mcq" className="action-plan-link">
                      Practice in MCQ Lab →
                    </Link>
                  </div>

                  <div className="action-plan-card">
                    <h4>Recommended Degrees</h4>
                    <ul className="degrees-list">
                      {recommendedDegrees.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="quiz-report-footer">
              <button type="button" className="quiz-retake-btn" onClick={handleRetake}>
                🔄 Retake Assessment
              </button>
              <button
                type="button"
                className="quiz-save-dash-btn"
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
              >
                {user ? "View in Dashboard →" : "Save to Account →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- QUESTION SCREEN ---
  return (
    <div className="quiz-theme-root">
      {/* Header Section */}
      <header className="quiz-theme-header">
        <div className="quiz-header-content-box">
          <div className="quiz-header-brand-row">
            <div className="quiz-brand-badge">
              <div className="quiz-brand-dot" />
              <span className="quiz-brand-name">Pathward</span>
            </div>
            <span className="quiz-q-counter-pill">
              {answeredCount}/{totalQ} Done
            </span>
          </div>

          <div className="quiz-header-meta-group">
            <p className="quiz-step-indicator">
              Question {currentIndex + 1} of {totalQ} · {currentQ.category}
            </p>
            <h1 className="quiz-title-text">Career Aptitude Assessment</h1>

            {/* Progress Bar */}
            <div className="quiz-progress-row">
              <div className="quiz-progress-track">
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="quiz-progress-text">
                {currentIndex + 1}/{totalQ}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="quiz-theme-main">
        <div className="quiz-card-content">
          {/* Question Text */}
          <section className="quiz-q-section">
            <div className="quiz-q-row">
              <span className="quiz-lightbulb-icon" role="img" aria-label="lightbulb">
                {currentQ.icon || "💡"}
              </span>
              <h2 className="quiz-question-heading">{currentQ.question}</h2>
            </div>
          </section>

          {/* Options List */}
          <section className="quiz-options-wrapper">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === opt.id;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <label
                  key={opt.id}
                  className={`quiz-option-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectOption(opt.id)}
                >
                  <input
                    type="radio"
                    name={`q-${currentQ.id}`}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleSelectOption(opt.id)}
                    className="quiz-radio-hidden"
                  />
                  <div className={`option-letter-badge ${isSelected ? "selected" : ""}`}>
                    {optionLetter}
                  </div>
                  <span className="option-text-label">{opt.label}</span>
                </label>
              );
            })}
          </section>
        </div>
      </main>

      {/* Sticky Bottom Action Area */}
      <footer className="quiz-sticky-footer">
        <div className="quiz-footer-inner">
          <div className="quiz-nav-row">
            <button
              type="button"
              className="quiz-prev-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0 || evaluating}
            >
              ← Prev
            </button>

            <div className="quiz-dots-cluster">
              {questions.map((q, idx) => {
                const isAns = answers[q.id] !== undefined;
                const isCurr = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    title={`Question ${idx + 1}`}
                    className={`quiz-dot-item ${isAns ? "answered" : ""} ${isCurr ? "active" : ""}`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                );
              })}
            </div>

            <button
              type="button"
              className="quiz-next-action-btn"
              onClick={handleNext}
              disabled={evaluating}
            >
              {evaluating
                ? "Evaluating..."
                : currentIndex < totalQ - 1
                ? "Next Question →"
                : "Calculate Career Match →"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
