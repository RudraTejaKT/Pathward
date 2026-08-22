const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isPremium: !!row.is_premium,
    createdAt: row.created_at,
  };
}

// --- POST /api/auth/signup ---
// Body: { name, email, password }
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email is required" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const info = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), email.toLowerCase(), passwordHash);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = signToken(user);

  res.status(201).json({ success: true, data: { token, user: publicUser(user) } });
});

// --- POST /api/auth/login ---
// Body: { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ success: true, data: { token, user: publicUser(user) } });
});

// --- GET /api/auth/me ---
// Returns the current user based on the Bearer token. Also used by the
// frontend on load to validate a stored token and refresh premium status.
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: publicUser(user) });
});

module.exports = router;
