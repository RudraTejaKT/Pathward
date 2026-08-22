const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Fail loudly at boot rather than silently signing tokens with "undefined".
  throw new Error("JWT_SECRET is not set. Add it to backend/.env (see .env.example).");
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
