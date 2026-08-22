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
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const completedCount = progress?.reduce((sum, branch) => sum + branch.completed, 0) || 0;
  const totalCount = progress?.reduce((sum, branch) => sum + branch.total, 0) || 0;
  const overallPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    api
      .getProgressOverview()
      .then(setProgress)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setPayError(null);
    setPaying(true);
    try {
      const order = await api.createOrder("pathward_pro");
      const result = await openRazorpayCheckout(order, user, {
        description: "Pathward Pro — lifetime unlock",
      });
      await api.verifyPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });
      await refreshUser();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="dashboard">
      <section className="dashboard__hero">
        <div className="container">
          <p className="mono dashboard__eyebrow">PATHWARD / YOUR SPACE</p>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="dashboard__intro">Keep building the skills that move you toward your first IT role.</p>
        </div>
      </section>

      <div className="container dashboard__content">
        <div className="dashboard__summary">
          <div><span className="mono">PATHWAYS STARTED</span><strong>{progress?.length || 0}</strong></div>
          <div><span className="mono">MILESTONES COMPLETE</span><strong>{completedCount}/{totalCount || "—"}</strong></div>
          <div><span className="mono">OVERALL PROGRESS</span><strong>{progress ? `${overallPercent}%` : "—"}</strong></div>
        </div>

        {user.isPremium ? (
          <p className="dashboard__premium-badge mono">★ Pathward Pro / unlocked</p>
        ) : (
          <div className="dashboard__upgrade">
            <div>
              <p className="mono dashboard__upgrade-label">PATHWARD PRO</p>
              <h3>Go further with your roadmap</h3>
              <p>Unlock mentor-reviewed project briefs and extended job-role data. One-time access, ₹499.</p>
            </div>
            <button onClick={handleUpgrade} disabled={paying}>
              {paying ? "Opening checkout…" : "Unlock Pathward Pro ↗"}
            </button>
          </div>
        )}
        {payError && <p className="auth-error">{payError}</p>}

        <div className="dashboard__section-heading">
          <div>
            <p className="mono dashboard__eyebrow">CONTINUE LEARNING</p>
            <h2 className="dashboard__section-title">Your engineering pathways</h2>
          </div>
          <Link to="/engineering" className="dashboard__browse">Browse all branches ↗</Link>
        </div>

        {loading && <p className="mono">Loading progress…</p>}
        {error && <p className="auth-error">{error}</p>}

        {progress && (
          <div className="dashboard__grid">
            {progress.map((p) => (
              <Link key={p.branchId} to={`/engineering/${p.branchId}`} className="dashboard__card">
                <div className="dashboard__card-top">
                  <span className="dashboard__card-code mono">{p.branchId.toUpperCase()}</span>
                  <span className="dashboard__card-arrow" aria-hidden="true">↗</span>
                </div>
                <h3>{BRANCH_NAMES[p.branchId] || p.branchId}</h3>
                <div className="dashboard__bar">
                  <div className="dashboard__bar-fill" style={{ width: `${p.percent}%` }} />
                </div>
                <p className="mono dashboard__stat">
                  {p.completed}/{p.total} complete <span>{p.percent}%</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
