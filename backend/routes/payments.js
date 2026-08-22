const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// One paid plan for now: unlocks premium content (e.g. mentor-reviewed
// project briefs, extended job-role data) across every branch.
const PLANS = {
  pathward_pro: { amountPaise: 49900, currency: "INR", label: "Pathward Pro — lifetime unlock" },
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
  res.json({ success: true, data: PLANS });
});

// --- POST /api/payments/create-order ---
// Body: { plan: 'pathward_pro' }
// Creates a Razorpay order server-side (amount is never trusted from the
// client) and records it as 'created' so we can reconcile later even if
// the browser tab closes before payment completes.
router.post("/create-order", async (req, res) => {
  const { plan } = req.body || {};
  const planDef = PLANS[plan];
  if (!planDef) {
    return res.status(400).json({ success: false, message: "Unknown plan" });
  }

  try {
    const client = getClient();
    const order = await client.orders.create({
      amount: planDef.amountPaise,
      currency: planDef.currency,
      receipt: `pathward_${req.user.id}_${Date.now()}`,
      notes: { userId: String(req.user.id), plan },
    });

    db.prepare(
      `INSERT INTO payments (user_id, plan, amount_paise, currency, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, ?, 'created')`
    ).run(req.user.id, plan, planDef.amountPaise, planDef.currency, order.id);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    res.status(502).json({ success: false, message: err.message || "Could not create payment order" });
  }
});

// --- POST /api/payments/verify ---
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// This is what actually unlocks premium — verified via HMAC signature
// against the key secret, per Razorpay's documented flow. The client
// telling us "payment succeeded" is never trusted on its own.
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification fields" });
  }

  const payment = db
    .prepare("SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?")
    .get(razorpay_order_id, req.user.id);

  if (!payment) {
    return res.status(404).json({ success: false, message: "No matching order for this user" });
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

  db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(req.user.id);

  res.json({ success: true, data: { plan: payment.plan, status: "paid" } });
});

// --- GET /api/payments/history ---
router.get("/history", (req, res) => {
  const rows = db
    .prepare(
      `SELECT plan, amount_paise, currency, status, created_at FROM payments
       WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);
  res.json({ success: true, data: rows });
});

module.exports = router;
