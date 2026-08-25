import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import "./Dashboard.css";

const BRANCH_NAMES = {
  cse: "Computer Science & Engineering",
  it: "Information Technology",
  aids: "AI & Data Science",
  ece: "Electronics & Communication",
  mech: "Mechanical Engineering",
  civil: "Civil Engineering",
  mbbs: "MBBS — Medicine & Surgery",
  bds: "BDS — Dental Surgery",
  ayush: "AYUSH (Ayurveda, Homeopathy)",
  pharm: "B.Pharm & Pharm.D",
  nursing: "B.Sc Nursing & Clinical Care",
  allied: "Allied Health Sciences",
  "medical-pg": "Medical PG (MD/MS/DNB)",
};

const PLAN_OPTIONS = [
  {
    id: "pathward_pro",
    name: "Pathward Pro — Lifetime",
    price: 499,
    tag: "BEST VALUE",
    desc: "One-time payment. Lifetime access to all roadmap blueprints, clinical case audits, and premium job role frameworks.",
  },
  {
    id: "pathward_pro_annual",
    name: "Pathward Pro — 1 Year",
    price: 299,
    tag: "POPULAR",
    desc: "12 months full platform access for entrance prep, branch roadmaps and MCQ labs.",
  },
  {
    id: "mentorship_session",
    name: "1-on-1 Career Mentorship",
    price: 199,
    tag: "SESSION",
    desc: "Personalized portfolio & career roadmap review session with an industry/clinical mentor.",
  },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingPlan, setPayingPlan] = useState(null);
  const [payError, setPayError] = useState(null);
  const [paySuccessMessage, setPaySuccessMessage] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.getProgressOverview(),
      api.getLatestAssessment(),
      api.getPaymentHistory(),
    ])
      .then(([progressRes, assessmentRes, paymentRes]) => {
        if (progressRes.status === "fulfilled") {
          setProgress(progressRes.value);
        } else {
          setError(progressRes.reason.message);
        }

        if (assessmentRes.status === "fulfilled") {
          setAssessment(assessmentRes.value);
        }

        if (paymentRes.status === "fulfilled" && Array.isArray(paymentRes.value)) {
          setPayments(paymentRes.value);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(planId = "pathward_pro", planName = "Pathward Pro") {
    setPayError(null);
    setPaySuccessMessage(null);
    setPayingPlan(planId);

    try {
      // 1. Create order on backend with selected plan
      const order = await api.createOrder(planId);

      // 2. Open Razorpay Checkout Dialog
      const result = await openRazorpayCheckout(order, user, {
        name: "Pathward Universe",
        description: `${planName} Upgrade`,
        notes: {
          plan: planId,
          userId: user.id,
        },
      });

      // 3. Verify server-side HMAC signature
      const verifyRes = await api.verifyPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      // 4. Update user state & payment history
      setPaySuccessMessage(`🎉 Payment verified successfully! ${planName} is now active.`);
      if (refreshUser) {
        await refreshUser();
      }

      // Refresh payment history
      try {
        const freshHistory = await api.getPaymentHistory();
        setPayments(freshHistory);
      } catch {
        // ignore
      }
    } catch (err) {
      if (err.message !== "Payment was cancelled by user.") {
        setPayError(err.message || "Payment process could not be completed.");
      }
    } finally {
      setPayingPlan(null);
    }
  }

  return (
    <main className="container dashboard">
      <div className="dashboard__header-row">
        <div>
          <p className="mono branch-detail__eyebrow">TRAINEE DASHBOARD</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Scholar"} 👋</h1>
        </div>
        <div className="dashboard__header-badges">
          <div className="supabase-status-pill mono">
            <span className="pulsing-dot-green" />
            <span>Supabase Cloud Connected</span>
          </div>
          {user?.isPremium && (
            <div className="dashboard__premium-pill mono">
              <span className="star-icon">★</span> Pathward Pro Active
            </div>
          )}
        </div>
      </div>

      {paySuccessMessage && (
        <div className="dashboard__alert dashboard__alert--success">
          {paySuccessMessage}
        </div>
      )}
      {payError && (
        <div className="dashboard__alert dashboard__alert--error">
          ⚠️ {payError}
        </div>
      )}

      {/* Pro Membership & Upgrade Section */}
      {!user?.isPremium ? (
        <section className="dashboard__pricing-section">
          <div className="dashboard__pricing-header">
            <span className="mono dashboard__tag">⚡ UNLOCK YOUR CAREER POTENTIAL</span>
            <h2>Upgrade to Pathward Pro</h2>
            <p>
              Get unlimited access to verified industry &amp; clinical project briefs, mentor review sessions, and advanced salary insights.
            </p>
          </div>

          <div className="dashboard__plans-grid">
            {PLAN_OPTIONS.map((p) => {
              const isProcessing = payingPlan === p.id;
              return (
                <div key={p.id} className={`plan-card ${p.id === "pathward_pro" ? "plan-card--featured" : ""}`}>
                  <div className="plan-card__top">
                    <span className="plan-tag mono">{p.tag}</span>
                    <span className="plan-price">₹{p.price}</span>
                  </div>
                  <h3 className="plan-title">{p.name}</h3>
                  <p className="plan-desc">{p.desc}</p>
                  <button
                    className="plan-cta-btn"
                    onClick={() => handleUpgrade(p.id, p.name)}
                    disabled={isProcessing || payingPlan !== null}
                  >
                    {isProcessing ? "Opening Razorpay..." : `Pay ₹${p.price} via Razorpay`}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="dashboard__rzp-trust">
            <span className="material-symbols-outlined trust-icon">verified_user</span>
            <span>Payments securely processed by Razorpay (UPI, Credit/Debit Cards, NetBanking, Paytm, GooglePay)</span>
          </div>
        </section>
      ) : (
        <div className="dashboard__pro-banner">
          <div className="pro-banner__text">
            <h3>★ You have Pathward Pro Lifetime Access</h3>
            <p>All roadmaps, project blueprints, case audits and MCQ test modules are fully unlocked for your account.</p>
          </div>
          <Link to="/learn" className="pro-banner__btn">
            Explore Learning Hub →
          </Link>
        </div>
      )}

      {/* Career Assessment Card */}
      <section className="dashboard__assessment-section">
        {assessment ? (
          <div className="dashboard__assessment-card">
            <div className="dashboard__assessment-header">
              <div>
                <span className="mono dashboard__tag">🎯 YOUR CAREER MATCH REPORT</span>
                <h2>
                  {assessment.topStream?.icon} {assessment.topStream?.name}
                </h2>
                <p className="dashboard__match-rate">
                  <strong>{assessment.topStream?.matchPercentage}% Aptitude Match</strong>
                  {assessment.topBranch && ` · Best Branch: ${assessment.topBranch.name}`}
                </p>
              </div>
              <div className="dashboard__assessment-actions">
                <Link to="/quiz" className="dashboard__quiz-link">
                  🔄 Retake Assessment
                </Link>
              </div>
            </div>

            {assessment.studentTraits && assessment.studentTraits.length > 0 && (
              <div className="dashboard__traits-row">
                {assessment.studentTraits.map((trait) => (
                  <span key={trait} className="dashboard__trait-pill">
                    ✨ {trait}
                  </span>
                ))}
              </div>
            )}

            <div className="dashboard__assessment-footer">
              {assessment.topBranch ? (
                <Link to={assessment.topBranch.route} className="dashboard__cta-btn">
                  Open {assessment.topBranch.id.toUpperCase()} Roadmap →
                </Link>
              ) : (
                <Link to={assessment.topStream?.learnPath || "/learn"} className="dashboard__cta-btn">
                  Explore Learning Pathway →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard__assessment-prompt">
            <div className="dashboard__assessment-prompt-text">
              <span className="mono dashboard__tag">CAREER ALIGNMENT</span>
              <h3>Have not taken your Career Aptitude Quiz yet?</h3>
              <p>Discover your highest-fit stream and engineering branch in just 3 minutes.</p>
            </div>
            <Link to="/quiz" className="dashboard__start-quiz-btn">
              Take Career Quiz 🎯
            </Link>
          </div>
        )}
      </section>

      {/* Roadmap Progress Section */}
      <section className="dashboard__progress-section">
        <h2 className="dashboard__section-title">Your Pathway Progress</h2>

        {loading && <p className="mono">Loading roadmap progress…</p>}
        {error && <p className="auth-error">{error}</p>}

        {progress && (
          <div className="dashboard__grid">
            {progress.map((p) => (
              <Link
                key={p.branchId}
                to={
                  ["mbbs", "bds", "ayush", "pharm", "nursing", "allied", "medical-pg"].includes(p.branchId)
                    ? `/medical/${p.branchId}`
                    : `/engineering/${p.branchId}`
                }
                className="dashboard__card"
              >
                <h3>{BRANCH_NAMES[p.branchId] || p.branchId.toUpperCase()}</h3>
                <div className="dashboard__bar">
                  <div className="dashboard__bar-fill" style={{ width: `${p.percent}%` }} />
                </div>
                <p className="mono dashboard__stat">
                  {p.completed}/{p.total} complete · {p.percent}%
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Payment Transactions & Receipts Section */}
      {payments && payments.length > 0 && (
        <section className="dashboard__transactions-section">
          <div className="transactions-header">
            <h2 className="dashboard__section-title">Razorpay Transaction History</h2>
            <span className="mono text-muted">{payments.length} transaction{payments.length > 1 ? "s" : ""}</span>
          </div>

          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Payment ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((tx) => (
                  <tr key={tx.id || tx.razorpay_order_id}>
                    <td className="mono">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>
                      <strong>
                        {tx.plan === "pathward_pro"
                          ? "Pathward Pro Lifetime"
                          : tx.plan === "pathward_pro_annual"
                          ? "Pathward Pro Annual"
                          : tx.plan === "mentorship_session"
                          ? "1-on-1 Mentorship"
                          : tx.plan?.replace(/^course_/, "Course: ")}
                      </strong>
                    </td>
                    <td className="mono text-muted">{tx.razorpay_payment_id || tx.razorpay_order_id}</td>
                    <td>₹{(tx.amount_paise / 100).toFixed(0)}</td>
                    <td>
                      <span className={`status-badge status-badge--${tx.status}`}>
                        {tx.status === "paid" ? "✓ Paid" : tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
