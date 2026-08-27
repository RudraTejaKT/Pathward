import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";
import { openRazorpayCheckout } from "../lib/razorpay";
import "./SubscriptionModal.css";

export default function SubscriptionModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("backlox_pro"); // "backlox_pro" | "backlox_pro_annual"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Synchronize internal state with prop OR global event listener
  useEffect(() => {
    if (typeof propIsOpen === "boolean") {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  useEffect(() => {
    function handleOpenEvent(e) {
      setError(null);
      setSuccessMsg(null);
      if (e.detail?.plan) setSelectedPlan(e.detail.plan);
      setIsOpen(true);
    }
    window.addEventListener("backlox:open-subscription", handleOpenEvent);
    return () => window.removeEventListener("backlox:open-subscription", handleOpenEvent);
  }, []);

  function handleClose() {
    setIsOpen(false);
    setError(null);
    setSuccessMsg(null);
    if (propOnClose) propOnClose();
  }

  // Handle Real Razorpay Checkout
  async function handleRazorpaySubscribe() {
    if (!user) {
      handleClose();
      navigate("/login?redirect=subscribe");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const order = await api.createPaymentOrder(selectedPlan);

      // 2. Open Razorpay widget
      const result = await openRazorpayCheckout(order, user, {
        name: "Backlox Career Universe",
        description: selectedPlan === "backlox_pro_annual" ? "Backlox Pro — 1 Year Access" : "Backlox Pro — Lifetime Access",
        themeColor: "#6366f1",
      });

      // 3. Verify signature on backend
      await api.verifyPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });

      await refreshUser();
      setSuccessMsg("🎉 Welcome to Backlox Pro! All universes, practice gyms, and roadmaps are now unlocked.");
      window.dispatchEvent(new CustomEvent("backlox:subscribed"));
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Instant Sandbox Activation (Zero-hassle test unlock)
  async function handleInstantSubscribe() {
    if (!user) {
      handleClose();
      navigate("/login?redirect=subscribe");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.instantSubscribe(selectedPlan);
      await refreshUser();
      setSuccessMsg("⚡ Pro Membership Activated (Instant Unlock)! Full access granted.");
      window.dispatchEvent(new CustomEvent("backlox:subscribed"));
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not activate test subscription.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const isSubscribed = user && (user.isPremium || user.role === "instructor" || user.role === "admin");

  return (
    <div className="subscription-modal-backdrop" onClick={handleClose}>
      <div className="subscription-modal-panel glass-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="subscription-modal-close" onClick={handleClose} aria-label="Close modal">
          ✕
        </button>

        {/* Header Header */}
        <div className="subscription-modal-header text-center">
          <div className="pro-sparkle-badge mono">
            <span>✨</span> BACKLOX PRO ACCESS
          </div>
          <h2 className="subscription-modal-title gradient-text">
            Unlock the Full Career Universe
          </h2>
          <p className="subscription-modal-subtitle">
            Free branch orientation videos are open for everyone. Upgrade to <strong>Backlox Pro</strong> to unlock multi-year interactive roadmaps, full course libraries, practice gym, and AI mentorship.
          </p>
        </div>

        {/* Already Subscribed State */}
        {isSubscribed ? (
          <div className="already-subscribed-box glass-card">
            <span className="material-symbols-outlined check-icon">verified</span>
            <h3>You are already an Active Pro Scholar!</h3>
            <p>Your subscription is active with full access to all engineering and medical learning hubs.</p>
            <button type="button" className="cyber-btn cyber-btn--primary mt-2" onClick={handleClose}>
              Continue Exploring →
            </button>
          </div>
        ) : (
          <>
            {/* Plan Selector Grid */}
            <div className="subscription-plans-grid">
              {/* Lifetime Plan */}
              <div
                className={`plan-card ${selectedPlan === "backlox_pro" ? "plan-card--active" : ""}`}
                onClick={() => setSelectedPlan("backlox_pro")}
              >
                <div className="plan-tag mono">MOST POPULAR · BEST VALUE</div>
                <div className="plan-card__header">
                  <h3>Lifetime Mastery</h3>
                  <div className="plan-price">
                    <span className="currency">₹</span>
                    <span className="amount">499</span>
                    <span className="term">/ one-time</span>
                  </div>
                </div>
                <p className="plan-desc">Single investment. Permanent access to all present and future engineering & medical streams.</p>
                <div className="plan-radio-marker">
                  <input
                    type="radio"
                    name="plan_choice"
                    checked={selectedPlan === "backlox_pro"}
                    onChange={() => setSelectedPlan("backlox_pro")}
                  />
                  <span>Select Lifetime Plan</span>
                </div>
              </div>

              {/* Annual Plan */}
              <div
                className={`plan-card ${selectedPlan === "backlox_pro_annual" ? "plan-card--active" : ""}`}
                onClick={() => setSelectedPlan("backlox_pro_annual")}
              >
                <div className="plan-tag mono">1 YEAR PASS</div>
                <div className="plan-card__header">
                  <h3>Annual Scholar</h3>
                  <div className="plan-price">
                    <span className="currency">₹</span>
                    <span className="amount">299</span>
                    <span className="term">/ year</span>
                  </div>
                </div>
                <p className="plan-desc">12 months access to full syllabus roadmaps, MCQ test batteries, and lecture flashcards.</p>
                <div className="plan-radio-marker">
                  <input
                    type="radio"
                    name="plan_choice"
                    checked={selectedPlan === "backlox_pro_annual"}
                    onChange={() => setSelectedPlan("backlox_pro_annual")}
                  />
                  <span>Select Annual Plan</span>
                </div>
              </div>
            </div>

            {/* Feature Comparison List */}
            <div className="subscription-comparison-box">
              <div className="comparison-col comparison-col--free">
                <span className="col-title mono">FREE GUEST PREVIEW</span>
                <ul>
                  <li><span className="check">✓</span> Landing Page & Universe Catalogs</li>
                  <li><span className="check">✓</span> <strong>Free Branch Orientation Videos (All Streams)</strong></li>
                  <li><span className="check">✓</span> Basic Salary & Demand Telemetry</li>
                  <li className="disabled"><span className="cross">✕</span> Interactive Roadmap Progress Checkpoints</li>
                  <li className="disabled"><span className="cross">✕</span> Full MCQ Lab & Practice Gym</li>
                  <li className="disabled"><span className="cross">✕</span> AI Custom Roadmap Synthesizer</li>
                </ul>
              </div>

              <div className="comparison-col comparison-col--pro">
                <span className="col-title mono text-primary">⭐ BACKLOX PRO INCLUDES</span>
                <ul>
                  <li><span className="check-pro">✓</span> <strong>Everything in Free +</strong></li>
                  <li><span className="check-pro">✓</span> Complete 4-Year Syllabus Checkpoints & Progress Tracking</li>
                  <li><span className="check-pro">✓</span> Unlimited MCQ Practice Gym with Step-by-Step Solutions</li>
                  <li><span className="check-pro">✓</span> Full HD Course Masterclasses & Lecture Notes</li>
                  <li><span className="check-pro">✓</span> ✨ AI Syllabus Architect & Custom Roadmap Generator</li>
                  <li><span className="check-pro">✓</span> Direct Student Dashboard Telemetry & Streaks</li>
                </ul>
              </div>
            </div>

            {/* Alerts & Messages */}
            {error && (
              <div className="subscription-alert subscription-alert--error mono">
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="subscription-alert subscription-alert--success mono">
                {successMsg}
              </div>
            )}

            {/* Actions */}
            <div className="subscription-actions-row">
              {!user ? (
                <div className="guest-prompt-block">
                  <p className="mono text-xs text-muted mb-2">Create a free scholar account or sign in to complete your Pro upgrade:</p>
                  <div className="guest-btns">
                    <Link to="/signup" className="cyber-btn cyber-btn--primary" onClick={handleClose}>
                      Sign Up &amp; Subscribe →
                    </Link>
                    <Link to="/login" className="cyber-btn cyber-btn--secondary" onClick={handleClose}>
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="cyber-btn cyber-btn--primary subscribe-cta-btn"
                    onClick={handleRazorpaySubscribe}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Processing Gateway…</span>
                    ) : (
                      <span>⚡ Pay ₹{selectedPlan === "backlox_pro_annual" ? "299" : "499"} via Razorpay</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="instant-unlock-btn mono text-xs"
                    onClick={handleInstantSubscribe}
                    disabled={loading}
                    title="Simulate instant subscription without external Razorpay popup"
                  >
                    🧪 Instant Test Mode Unlock (Sandbox)
                  </button>
                </>
              )}
            </div>

            <div className="security-badges-strip mono text-xs text-muted">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>⚡ Razorpay Certified Gateway</span>
              <span>•</span>
              <span>🔄 Instant Cloud Sync</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
