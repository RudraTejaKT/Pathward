const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "pathward-universe-production-jwt-secret-key-2026";

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET is not explicitly set in environment variables. Using secure default secret.");
}

// Attaches req.user = { id, email, role, isPremium } if a valid Bearer token
// is present; otherwise 401s. Use on any route that requires login.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Missing or malformed Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, isPremium: !!user.is_premium },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAuth, signToken, JWT_SECRET };
