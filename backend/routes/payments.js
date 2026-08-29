require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { sendProUpgradeEmail } = require("../lib/email");

const router = express.Router();

// Defined membership and mentorship plans
const PLANS = {
  backlox_pro: { amountPaise: 49900, currency: "INR", label: "Backlox Pro — Lifetime Membership" },
  backlox_pro_annual: { amountPaise: 29900, currency: "INR", label: "Backlox Pro — 1 Year Access" },
  mentorship_session: { amountPaise: 19900, currency: "INR", label: "1-on-1 Career Mentorship & Portfolio Review" },
};

// Recognized catalog courses with their INR pricing (in paise)
const CATALOG_COURSES = {
  "feat-1": { title: "Advanced Machine Learning Algorithms", amountPaise: 149900, currency: "INR" },
  "feat-2": { title: "UX/UI Foundations for Scale", amountPaise: 99900, currency: "INR" },
  "feat-3": { title: "Clinical Medicine & Diagnostic Reasoning", amountPaise: 129900, currency: "INR" },
  "feat-4": { title: "Distributed Systems & Cloud Architecture", amountPaise: 179900, currency: "INR" },
  "trend-1": { title: "Growth Marketing 101", amountPaise: 49900, currency: "INR" },
  "trend-2": { title: "Product Management & Roadmaps", amountPaise: 69900, currency: "INR" },
  "trend-3": { title: "Full-Stack Architecture (MERN + GraphQL)", amountPaise: 89900, currency: "INR" },
  "trend-4": { title: "Financial Modeling & Valuation (DCF / LBO)", amountPaise: 79900, currency: "INR" },
  "trend-5": { title: "Human Anatomy & Histopathology Lab", amountPaise: 99900, currency: "INR" },
  "default": { title: "Specialized Career Mastery Course", amountPaise: 99900, currency: "INR" },
};

let razorpay = null;
function getClient() {
  if (razorpay) return razorpay;
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env."
    );
  }
  razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return razorpay;
}

// --- GET /api/payments/plans ---
// Publicly accessible so visitors can view plan pricing
router.get("/plans", (req, res) => {
  res.json({ success: true, data: { plans: PLANS, catalog: CATALOG_COURSES } });
});

// Require login for payment order creation, verification, and history
router.use(requireAuth);

// --- POST /api/payments/create-order ---
// Body: { amount, currency, receipt } OR { plan: 'backlox_pro' } OR { courseId: 'feat-1' }
router.post("/create-order", async (req, res) => {
  const { plan, courseId, amount, currency: reqCurrency, receipt: reqReceipt } = req.body || {};
  let targetPlan = plan || "custom_order";
  let amountPaise = 0;
  let currency = reqCurrency || "INR";
  let itemLabel = "Backlox Platform Access";

  if (amount !== undefined && amount !== null) {
    amountPaise = Number(amount);
    if (isNaN(amountPaise) || amountPaise < 100) {
      return res.status(400).json({ success: false, message: "Amount must be at least 100 paise (₹1.00)" });
    }
  } else if (plan && PLANS[plan]) {
    const planDef = PLANS[plan];
    amountPaise = planDef.amountPaise;
    currency = planDef.currency;
    itemLabel = planDef.label;
  } else if (courseId || (plan && plan.startsWith("course_"))) {
    const cid = courseId || plan.replace(/^course_/, "");
    targetPlan = `course_${cid}`;

    // Check catalog first
    if (CATALOG_COURSES[cid]) {
      const c = CATALOG_COURSES[cid];
      amountPaise = c.amountPaise;
      currency = c.currency;
      itemLabel = c.title;
    } else {
      // Check database courses
      const dbCourse = db.prepare("SELECT * FROM courses WHERE id = ?").get(cid);
      if (dbCourse) {
        amountPaise = dbCourse.price_paise > 0 ? dbCourse.price_paise : 49900;
        itemLabel = dbCourse.title;
      } else {
        // Fallback default course price
        amountPaise = CATALOG_COURSES["default"].amountPaise;
        itemLabel = CATALOG_COURSES["default"].title;
      }
    }
  } else {
    return res.status(400).json({ success: false, message: "Invalid payment request: amount, plan, or courseId is required" });
  }

  if (amountPaise < 100) {
    return res.status(400).json({ success: false, message: "Amount must be at least 100 paise (₹1.00)" });
  }

  const receipt = (reqReceipt || `pw_${req.user.id}_${Date.now()}`).slice(0, 40);

  try {
    const client = getClient();
    const order = await client.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes: {
        userId: String(req.user.id),
        userEmail: req.user.email || "",
        plan: targetPlan,
        itemLabel,
      },
    });

    db.prepare(
      `INSERT INTO payments (user_id, plan, amount_paise, currency, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, ?, 'created')`
    ).run(req.user.id, targetPlan, amountPaise, currency, order.id);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        keyId: process.env.RAZORPAY_KEY_ID,
        itemLabel,
      },
    });
  } catch (err) {
    console.error("Razorpay API order error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: err.message,
    });
  }
});

// --- POST /api/payments/verify & /api/payments/verify-payment ---
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } OR { order_id, payment_id, signature }
const handlePaymentVerification = (req, res) => {
  const body = req.body || {};
  const orderId = body.razorpay_order_id || body.order_id;
  const paymentId = body.razorpay_payment_id || body.payment_id;
  const signature = body.razorpay_signature || body.signature;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification fields: order_id, payment_id, and signature are required" });
  }

  const payment = db
    .prepare("SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?")
    .get(orderId, req.user.id);

  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = expectedSignature === signature;

  if (payment) {
    db.prepare(
      `UPDATE payments SET status = ?, razorpay_payment_id = ?, razorpay_signature = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(isValid ? "paid" : "failed", paymentId, signature, payment.id);
  }

  if (!isValid) {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  // If user bought Pro membership, unlock premium
  if (payment && (payment.plan === "backlox_pro" || payment.plan === "backlox_pro_annual")) {
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(req.user.id);
    const userRow = db.prepare("SELECT name, email FROM users WHERE id = ?").get(req.user.id);
    if (userRow) {
      sendProUpgradeEmail({
        name: userRow.name,
        email: userRow.email,
        planName: payment.plan === "backlox_pro_annual" ? "Backlox Pro (Annual)" : "Backlox Pro (Lifetime)",
        amount: `₹${(payment.amount_paise / 100).toFixed(0)}`,
        orderId: orderId,
      });
    }
  }

  // If user bought a course, enroll user if it's a numeric course ID
  if (payment && payment.plan && payment.plan.startsWith("course_")) {
    const courseIdNum = Number(payment.plan.replace(/^course_/, ""));
    if (Number.isInteger(courseIdNum) && courseIdNum > 0) {
      try {
        db.prepare(
          `INSERT OR IGNORE INTO course_enrollments (course_id, user_id, status) VALUES (?, ?, 'active')`
        ).run(courseIdNum, req.user.id);
      } catch (e) {
        console.warn("Could not insert enrollment:", e.message);
      }
    }
  }

  res.json({
    success: true,
    data: {
      plan: payment.plan,
      status: "paid",
      amountPaise: payment.amount_paise,
      paymentId: paymentId,
      orderId: orderId,
    },
  });
};

router.post("/verify", handlePaymentVerification);
router.post("/verify-payment", handlePaymentVerification);

// --- POST /api/payments/instant-subscribe ---
// Direct test/sandbox instant unlock for immediate platform access
router.post("/instant-subscribe", (req, res) => {
  const { plan = "backlox_pro" } = req.body || {};
  const orderId = `pw_instant_${req.user.id}_${Date.now()}`;
  const paymentId = `pay_instant_${Date.now()}`;
  const amountPaise = plan === "backlox_pro_annual" ? 29900 : 49900;

  try {
    db.prepare(
      `INSERT INTO payments (user_id, plan, amount_paise, currency, razorpay_order_id, razorpay_payment_id, status)
       VALUES (?, ?, ?, 'INR', ?, ?, 'paid')`
    ).run(req.user.id, plan, amountPaise, orderId, paymentId);

    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(req.user.id);

    const userRow = db.prepare("SELECT name, email FROM users WHERE id = ?").get(req.user.id);
    if (userRow) {
      sendProUpgradeEmail({
        name: userRow.name,
        email: userRow.email,
        planName: plan === "backlox_pro_annual" ? "Backlox Pro (Annual)" : "Backlox Pro (Lifetime)",
        amount: `₹${(amountPaise / 100).toFixed(0)}`,
        orderId,
      });
    }

    res.json({
      success: true,
      message: "Backlox Pro subscription successfully activated!",
      data: {
        plan,
        status: "paid",
        paymentId,
        orderId,
        isPremium: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to activate instant subscription" });
  }
});

// --- GET /api/payments/history ---
router.get("/history", (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, plan, amount_paise, currency, razorpay_order_id, razorpay_payment_id, status, created_at
       FROM payments
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(req.user.id);
  res.json({ success: true, data: rows });
});

module.exports = router;

