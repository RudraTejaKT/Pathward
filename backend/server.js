require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { streams, branches, roadmaps, projects, jobs } = require("./data");
const authRoutes = require("./routes/auth");
const traineeRoutes = require("./routes/trainee");
const paymentRoutes = require("./routes/payments");
const learningRoutes = require("./routes/learning");
const assessmentRoutes = require("./routes/assessment");
const aiRoutes = require("./routes/ai");
const assignmentsRoutes = require("./routes/assignments");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// --- Auth (signup / login / me) ---
app.use("/api/auth", authRoutes);

// --- Trainee progress (requires login) ---
app.use("/api/trainee", traineeRoutes);

// --- Payments (requires login) ---
app.use("/api/payments", paymentRoutes);

// --- Extended learning platform ---
app.use("/api/learning", learningRoutes.router);

// --- Career Aptitude & Stream Assessment ---
app.use("/api/assessment", assessmentRoutes);

// --- AI Course & Curriculum Generation ---
app.use("/api/ai", aiRoutes);

// --- Assignments & Grading ---
app.use("/api/assignments", assignmentsRoutes);

// Small helper so every route returns a consistent shape
const ok = (res, data) => res.json({ success: true, data });
const notFound = (res, message) => res.status(404).json({ success: false, message });

// --- Streams (what to choose after 12th) ---
app.get("/api/streams", (req, res) => {
  ok(res, streams);
});

// --- Branches (filter by stream e.g. /api/branches?stream=medical or /api/branches?stream=engineering) ---
app.get("/api/branches", (req, res) => {
  const { stream } = req.query;
  if (stream) {
    const filtered = branches.filter((b) => b.streamId === stream);
    return ok(res, filtered);
  }
  ok(res, branches);
});

app.get("/api/branches/:branchId", (req, res) => {
  const branch = branches.find((b) => b.id === req.params.branchId);
  if (!branch) return notFound(res, "Branch not found");
  ok(res, branch);
});

// --- Roadmap (courses/subjects to learn) for a branch ---
app.get("/api/roadmap/:branchId", (req, res) => {
  const roadmap = roadmaps[req.params.branchId];
  if (!roadmap) return notFound(res, "Roadmap not found for this branch");
  ok(res, roadmap);
});

// --- Project recommendations for a branch ---
app.get("/api/projects/:branchId", (req, res) => {
  const branchProjects = projects[req.params.branchId];
  if (!branchProjects) return notFound(res, "No projects found for this branch");
  ok(res, branchProjects);
});

// --- Trending job roles for a branch ---
app.get("/api/jobs/:branchId", (req, res) => {
  const branchJobs = jobs[req.params.branchId];
  if (!branchJobs) return notFound(res, "No job data found for this branch");
  ok(res, branchJobs);
});

// --- Combined endpoint: everything needed for one branch in a single call ---
app.get("/api/branch-details/:branchId", (req, res) => {
  const { branchId } = req.params;
  const branch = branches.find((b) => b.id === branchId);
  if (!branch) return notFound(res, "Branch not found");

  ok(res, {
    branch,
    roadmap: roadmaps[branchId] || [],
    projects: projects[branchId] || [],
    jobs: jobs[branchId] || [],
  });
});

const { supabase, supabaseUrl, isConfigured } = require("./lib/supabase");

app.get("/api/supabase/status", async (req, res) => {
  try {
    let authCheck = "untested";
    if (supabase) {
      const { data, error } = await supabase.auth.getSession();
      authCheck = error ? `error: ${error.message}` : "connected";
    }
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        supabaseUrl,
        publishableKeyConfigured: !!process.env.SUPABASE_PUBLISHABLE_KEY,
        secretKeyConfigured: !!process.env.SUPABASE_SECRET_KEY,
        status: "active",
        authCheck,
      },
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        supabaseUrl,
        status: "configured",
        note: err.message,
      },
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), supabase: isConfigured ? "ready" : "disabled" });
});

// --- Static Frontend Serving in Production ---
const path = require("path");
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const fs = require("fs");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// --- 404 JSON fallback for unmatched API routes ---
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// General 404 fallback if static files aren't available
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// --- Fallback error handler (bad JSON bodies, unexpected route errors) ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Career Guide API running on http://localhost:${PORT}`);
  });
}

module.exports = app;

