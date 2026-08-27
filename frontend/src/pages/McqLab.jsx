import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { APTITUDE_CATEGORIES, MASTER_APTITUDE_BANK } from "../lib/aptitudeDatabase";
import "./McqLab.css";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function McqLab() {
  const { user } = useAuth();
  const isSubscribed = user && (user.isPremium || user.role === "instructor" || user.role === "admin");

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [batchSize, setBatchSize] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hintsRevealed, setHintsRevealed] = useState({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [streakCount, setStreakCount] = useState(4);

  const timerRef = useRef(null);

  // Initialize questions on mount & filter change
  useEffect(() => {
    handleGenerateQuestions();
  }, [selectedCategory, selectedDifficulty, batchSize]);

  // Stopwatch timer for Speed Challenge
  useEffect(() => {
    if (timerActive && isSubscribed) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isSubscribed]);

  function handleGenerateQuestions() {
    setAnswers({});
    setHintsRevealed({});
    setTimerSeconds(0);
    setTimerActive(true);

    let filtered = Array.isArray(MASTER_APTITUDE_BANK) ? [...MASTER_APTITUDE_BANK] : [];
    if (selectedCategory !== "all") {
      const catFiltered = filtered.filter((q) => q.category === selectedCategory);
      if (catFiltered.length > 0) filtered = catFiltered;
    }
    if (selectedDifficulty !== "all") {
      const diffFiltered = filtered.filter((q) =>
        q.difficulty && q.difficulty.toLowerCase().includes(selectedDifficulty.toLowerCase())
      );
      if (diffFiltered.length > 0) filtered = diffFiltered;
    }

    if (filtered.length === 0 && MASTER_APTITUDE_BANK && MASTER_APTITUDE_BANK.length > 0) {
      filtered = [...MASTER_APTITUDE_BANK];
    }

    // Shuffle and pick requested batch size
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(batchSize, shuffled.length));

    // Format & shuffle options
    const formatted = chosen.map((q) => {
      const originalOptions = Array.isArray(q.options) ? [...q.options] : ["Option A", "Option B", "Option C", "Option D"];
      const correctOptionText = originalOptions[q.answer] || originalOptions[0];
      const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
      const newAnswerIndex = Math.max(0, shuffledOptions.indexOf(correctOptionText));

      return {
        ...q,
        options: shuffledOptions,
        answer: newAnswerIndex,
      };
    });

    setQuestions(formatted);
  }

  function handleSelectOption(qIndex, optIndex) {
    if (!isSubscribed) {
      window.dispatchEvent(
        new CustomEvent("backlox:open-subscription", {
          detail: { plan: "backlox_pro" },
        })
      );
      return;
    }

    if (answers[qIndex] !== undefined) return;
    const isCorrect = questions[qIndex]?.answer === optIndex;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));

    if (isCorrect) {
      setStreakCount((prev) => prev + 1);
    }
  }

  function toggleHint(qIndex) {
    if (!isSubscribed) {
      window.dispatchEvent(
        new CustomEvent("backlox:open-subscription", {
          detail: { plan: "backlox_pro" },
        })
      );
      return;
    }

    setHintsRevealed((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex],
    }));
  }

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = questions.length > 0
    ? Object.entries(answers).filter(([qIdx, ansIdx]) => questions[qIdx]?.answer === ansIdx).length
    : 0;
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Format timer MM:SS
  const formattedTime = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="mcq-page-root">
      {/* Ambient Cosmic Background Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Main Header */}
      <header className="mcq-header">
        <div className="container mcq-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>BACKLOX NATIONAL PRACTICE GYM &amp; APTITUDE MATRIX</span>
          </div>

          <div className="gym-title-row">
            <div>
              <h1 className="mcq-title gradient-text">Competitive Aptitude Practice Gym</h1>
              <p className="mcq-sub">
                Practice high-yield quantitative, logical, verbal, technical, clinical, and commerce aptitude questions sourced from TCS NQT, CAT, GATE, Bank PO, UPSC CSAT, and NEET.
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mcq-control-bar glass-card">
            <div className="control-group">
              <label className="mono text-xs">APTITUDE DOMAIN</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {APTITUDE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="mono text-xs">DIFFICULTY TIER</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulty Tiers</option>
                <option value="Standard">Standard (Placement / CAT / Bank)</option>
                <option value="Competitive">Competitive (GATE / JEE / Olympiad)</option>
                <option value="Expert">Expert (Clinical / Specialized)</option>
              </select>
            </div>

            <div className="control-group">
              <label className="mono text-xs">BATCH SIZE</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
              >
                {[5, 10, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} Questions
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="cyber-btn cyber-btn--primary mcq-generate-btn"
              onClick={handleGenerateQuestions}
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>Shuffle New Batch</span>
            </button>
          </div>

          {/* Live Telemetry & Speed Challenge Strip */}
          <div className="mcq-stats-strip glass-card">
            <div className="score-stat">
              <span className="stat-num mono">{questions.length}</span>
              <span className="stat-lbl mono">TOTAL QUESTIONS</span>
            </div>
            <div className="stat-divider" />
            <div className="score-stat">
              <span className="stat-num mono">{totalAnswered}</span>
              <span className="stat-lbl mono">ANSWERED</span>
            </div>
            <div className="stat-divider" />
            <div className="score-stat">
              <span className="stat-num mono text-emerald">{totalCorrect}</span>
              <span className="stat-lbl mono">CORRECT</span>
            </div>
            <div className="stat-divider" />
            <div className="score-stat">
              <span className="stat-num mono text-primary">{accuracyPct}%</span>
              <span className="stat-lbl mono">ACCURACY</span>
            </div>
            <div className="stat-divider" />
            <div className="score-stat">
              <span className="stat-num mono text-amber">{streakCount} Days</span>
              <span className="stat-lbl mono">STUDY STREAK</span>
            </div>
            <div className="stat-divider" />
            <div className="score-stat">
              <span className="stat-num mono text-cyan">{formattedTime}</span>
              <span className="stat-lbl mono">ELAPSED TIME</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Questions Workspace */}
      <main className="mcq-main">
        <div className="container">
          {/* Subscription Paywall Gate Banner */}
          {!isSubscribed && (
            <div className="mcq-pro-gate-banner glass-card animate-slide-up">
              <div className="mcq-pro-gate-content">
                <span className="material-symbols-outlined mcq-pro-gate-icon">lock</span>
                <div>
                  <div className="mcq-pro-badge mono">💎 BACKLOX PRO EXCLUSIVE</div>
                  <h3>MCQ Practice Batteries &amp; Solutions are Gated</h3>
                  <p>
                    You are browsing question previews in the Practice Gym. Subscribe to <strong>Backlox Pro (₹499 Lifetime)</strong> to solve interactive MCQs, unlock step-by-step mathematical solutions, formulas, and track placement exam readiness.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cyber-btn cyber-btn--primary mcq-upgrade-btn"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("backlox:open-subscription", {
                      detail: { plan: "backlox_pro" },
                    })
                  )
                }
              >
                ⭐ Unlock All 500+ MCQs (₹499) →
              </button>
            </div>
          )}

          <div className="mcq-questions-stack">
            {questions.length === 0 ? (
              <div className="question-card glass-card text-center" style={{ padding: "40px 20px" }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "48px", marginBottom: "12px" }}>
                  auto_awesome
                </span>
                <h3>Generating Questions...</h3>
                <p className="text-muted text-sm my-2">Loading high-yield aptitude problems for you.</p>
                <button type="button" className="cyber-btn cyber-btn--primary" onClick={handleGenerateQuestions} style={{ marginTop: "12px" }}>
                  Shuffle Practice Batch
                </button>
              </div>
            ) : (
              questions.map((q, i) => {
                const isAnswered = answers[i] !== undefined;
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.answer;
                const isHintOpen = hintsRevealed[i];

                return (
                  <article className="question-card glass-card animate-fade-in" key={q.id || i}>
                    <div className="q-card-top">
                      <div className="q-badge-row">
                        <span className="q-number-badge mono">Q{i + 1}</span>
                        {q.subject && <span className="q-subject-pill mono">{q.subject}</span>}
                        {q.difficulty && (
                          <span className="q-difficulty-pill mono">
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="q-actions-right">
                        {q.formula && (
                          <button
                            type="button"
                            className="formula-hint-btn mono text-xs"
                            onClick={() => toggleHint(i)}
                            title={!isSubscribed ? "Subscribe to Pro to view formula hint" : "Peek formula / derivation hint"}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                              {isSubscribed ? "lightbulb" : "lock"}
                            </span>
                            <span>{isHintOpen ? "Hide Hint" : "Formula Hint"}</span>
                          </button>
                        )}

                        {isAnswered && (
                          <span className={`status-pill mono ${isCorrect ? "correct" : "wrong"}`}>
                            {isCorrect ? "✓ Correct (+4)" : "✗ Incorrect (-1)"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isHintOpen && q.formula && (
                      <div className="formula-hint-box mono text-xs animate-slide-up">
                        <strong>Formula Reference:</strong> <code>{q.formula}</code>
                      </div>
                    )}

                    <h3 className="q-statement">{q.question}</h3>

                    <div className="q-options-grid">
                      {(q.options || []).map((opt, j) => {
                        let btnClass = "option-btn";
                        if (isAnswered) {
                          if (j === q.answer) {
                            btnClass += " correct";
                          } else if (j === userAnswer) {
                            btnClass += " wrong";
                          } else {
                            btnClass += " dimmed";
                          }
                        }
                        if (!isSubscribed) {
                          btnClass += " option-btn--locked";
                        }

                        return (
                          <button
                            type="button"
                            key={j}
                            className={btnClass}
                            onClick={() => handleSelectOption(i, j)}
                            disabled={isAnswered}
                            title={!isSubscribed ? "Subscribe to Backlox Pro to solve MCQs" : ""}
                          >
                            <span className="option-letter mono">{OPTION_LETTERS[j]}</span>
                            <span className="option-text">{opt}</span>
                            {!isSubscribed && (
                              <span className="material-symbols-outlined option-lock-badge">lock</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className={`explanation-box ${isCorrect ? "correct" : "wrong"} animate-slide-up`}>
                        <div className="explanation-header">
                          <span className="material-symbols-outlined">
                            {isCorrect ? "verified" : "help_center"}
                          </span>
                          <strong className="mono">
                            {isCorrect ? "Solution & Theoretical Rationale:" : "Detailed Solution Breakdown:"}
                          </strong>
                        </div>
                        <p className="explanation-text">{q.explanation}</p>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}