require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { streams, branches, roadmaps, projects, jobs } = require("./data");
const authRoutes = require("./routes/auth");
const traineeRoutes = require("./routes/trainee");
const paymentRoutes = require("./routes/payments");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Auth (signup / login / me) ---
app.use("/api/auth", authRoutes);

// --- Trainee progress (requires login) ---
app.use("/api/trainee", traineeRoutes);

// --- Payments (requires login) ---
app.use("/api/payments", paymentRoutes);

// Small helper so every route returns a consistent shape
const ok = (res, data) => res.json({ success: true, data });
const notFound = (res, message) => res.status(404).json({ success: false, message });

// --- Streams (what to choose after 12th) ---
app.get("/api/streams", (req, res) => {
  ok(res, streams);
});

// --- Engineering branches ---
app.get("/api/branches", (req, res) => {
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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Fallback error handler (bad JSON bodies, unexpected route errors) ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Career Guide API running on http://localhost:${PORT}`);
});
