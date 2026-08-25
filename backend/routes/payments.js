require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Defined membership and mentorship plans
const PLANS = {
  pathward_pro: { amountPaise: 49900, currency: "INR", label: "Pathward Pro — Lifetime Membership" },
  pathward_pro_annual: { amountPaise: 29900, currency: "INR", label: "Pathward Pro — 1 Year Access" },
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
router.get("/plans", (req, res) => {
  res.json({ success: true, data: { plans: PLANS, catalog: CATALOG_COURSES } });
});

// --- POST /api/payments/create-order ---
// Body: { plan: 'pathward_pro' } OR { courseId: 'feat-1' } OR { plan: 'course_feat-1' }
router.post("/create-order", async (req, res) => {
  const { plan, courseId } = req.body || {};
  let targetPlan = plan;
  let amountPaise = 0;
  let currency = "INR";
  let itemLabel = "";

  if (plan && PLANS[plan]) {
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
    return res.status(400).json({ success: false, message: "Invalid plan or course requested" });
  }

  try {
    const client = getClient();
    const order = await client.orders.create({
      amount: amountPaise,
      currency,
      receipt: `pw_${req.user.id}_${Date.now()}`.slice(0, 40),
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
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        itemLabel,
      },
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(502).json({ success: false, message: err.message || "Could not create Razorpay payment order" });
  }
});

// --- POST /api/payments/verify ---
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification fields" });
  }

  const payment = db
    .prepare("SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?")
    .get(razorpay_order_id, req.user.id);

  if (!payment) {
    return res.status(404).json({ success: false, message: "No matching order found for this user" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  db.prepare(
    `UPDATE payments SET status = ?, razorpay_payment_id = ?, razorpay_signature = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(isValid ? "paid" : "failed", razorpay_payment_id, razorpay_signature, payment.id);

  if (!isValid) {
    return res.status(400).json({ success: false, message: "Payment signature verification failed" });
  }

  // If user bought Pro membership, unlock premium
  if (payment.plan === "pathward_pro" || payment.plan === "pathward_pro_annual") {
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(req.user.id);
  }

  // If user bought a course, enroll user if it's a numeric course ID
  if (payment.plan && payment.plan.startsWith("course_")) {
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
      currency: payment.currency,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    },
  });
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
