import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./McqLab.css";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function McqLab() {
  const [streams, setStreams] = useState([]);
  const [exams, setExams] = useState([]);
  const [stream, setStream] = useState("science");
  const [exam, setExam] = useState("neet");
  const [count, setCount] = useState(20);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    Promise.all([api.getLearningStreams(), api.getExams()])
      .then(([s, e]) => {
        setStreams(s || []);
        setExams(e || []);
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setAnswers({});
    try {
      const res = await api.getMcqs(stream, exam, count);
      setQuiz(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(qIndex, optIndex) {
    if (answers[qIndex] !== undefined) return; // Prevent changing after answered
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));
  }

  // Calculate user telemetry score
  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = quiz
    ? Object.entries(answers).filter(([qIdx, ansIdx]) => quiz.questions[qIdx]?.answer === ansIdx).length
    : 0;
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="mcq-page-root">
      {/* Ambient Cosmic Background Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      <header className="mcq-header">
        <div className="container mcq-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>EXAM SIMULATOR · HARD &amp; ADVANCED DIFFICULTY</span>
          </div>

          <h1 className="mcq-title gradient-text">Competitive MCQ Testing Lab</h1>
          <p className="mcq-sub">
            Unlimited, randomized high-difficulty question sets mapped to JEE Advanced, NEET-PG/NEXT, GATE, CAT, and UPSC. Every option is dynamically shuffled for rigorous test integrity.
          </p>

          {/* Controls Bar */}
          <div className="mcq-control-bar glass-card">
            <div className="control-group">
              <label className="mono text-xs">ACADEMIC STREAM</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)}>
                {streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="mono text-xs">TARGET ENTRANCE</label>
              <select value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="">General National Standard</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="mono text-xs">BATCH SIZE</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} Questions
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="cyber-btn cyber-btn--primary mcq-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating Set…" : "⚡ Generate Hard Test"}
            </button>
          </div>

          {/* Live Score & Telemetry Dashboard */}
          {quiz && (
            <div className="mcq-stats-strip glass-card">
              <div className="score-stat">
                <span className="stat-num mono">{quiz.questions.length}</span>
                <span className="stat-lbl mono">TOTAL QUESTIONS</span>
              </div>
              <div className="stat-divider" />
              <div className="score-stat">
                <span className="stat-num mono">{totalAnswered}</span>
                <span className="stat-lbl mono">COMPLETED</span>
              </div>
              <div className="stat-divider" />
              <div className="score-stat">
                <span className="stat-num mono text-emerald">{totalCorrect}</span>
                <span className="stat-lbl mono">CORRECT</span>
              </div>
              <div className="stat-divider" />
              <div className="score-stat">
                <span className="stat-num mono text-primary">{accuracyPct}%</span>
                <span className="stat-lbl mono">ACCURACY RATE</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mcq-main">
        <div className="container">
          {!quiz && (
            <div className="mcq-placeholder glass-card">
              <span className="material-symbols-outlined placeholder-icon">psychology_alt</span>
              <h2>Ready to test your mastery?</h2>
              <p>Configure your target exam and question count above, then click Generate to begin.</p>
            </div>
          )}

          {quiz && (
            <div className="mcq-questions-stack">
              {quiz.questions.map((q, i) => {
                const isAnswered = answers[i] !== undefined;
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.answer;

                return (
                  <article className="question-card glass-card" key={i}>
                    <div className="q-card-top">
                      <div className="q-badge-row">
                        <span className="q-number-badge mono">Q{i + 1}</span>
                        {q.subject && <span className="q-subject-pill mono">{q.subject}</span>}
                        {q.difficulty && (
                          <span className="q-difficulty-pill mono">
                            ⚡ {q.difficulty}
                          </span>
                        )}
                      </div>

                      {isAnswered && (
                        <span className={`status-pill mono ${isCorrect ? "correct" : "wrong"}`}>
                          {isCorrect ? "✓ Correct (+4)" : "✗ Incorrect (-1)"}
                        </span>
                      )}
                    </div>

                    <h3 className="q-statement">{q.question}</h3>

                    <div className="q-options-grid">
                      {q.options.map((opt, j) => {
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

                        return (
                          <button
                            type="button"
                            key={j}
                            className={btnClass}
                            onClick={() => handleSelectOption(i, j)}
                            disabled={isAnswered}
                          >
                            <span className="option-letter mono">{OPTION_LETTERS[j]}</span>
                            <span className="option-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className={`explanation-box ${isCorrect ? "correct" : "wrong"}`}>
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
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}