const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { branches, roadmaps, projects } = require("../data");

const router = express.Router();
router.use(requireAuth);

function branchProgressSummary(userId, branchId) {
  const stageCount = (roadmaps[branchId] || []).length;
  const projectCount = (projects[branchId] || []).length;
  const total = stageCount + projectCount;

  const doneRow = db
    .prepare(
      `SELECT COUNT(*) AS n FROM trainee_progress
       WHERE user_id = ? AND branch_id = ? AND completed = 1`
    )
    .get(userId, branchId);

  const done = doneRow.n;
  return {
    branchId,
    total,
    completed: done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

// --- GET /api/trainee/progress ---
// Overview across every branch, for the dashboard.
router.get("/progress", (req, res) => {
  const summary = branches.map((b) => branchProgressSummary(req.user.id, b.id));
  res.json({ success: true, data: summary });
});

// --- GET /api/trainee/progress/:branchId ---
// Full completion state for one branch, keyed by item so the frontend can
// check individual roadmap stages / projects.
router.get("/progress/:branchId", (req, res) => {
  const { branchId } = req.params;
  const rows = db
    .prepare(
      `SELECT item_type, item_key, completed FROM trainee_progress
       WHERE user_id = ? AND branch_id = ?`
    )
    .all(req.user.id, branchId);

  const state = {};
  for (const row of rows) {
    state[`${row.item_type}:${row.item_key}`] = !!row.completed;
  }

  res.json({ success: true, data: { branchId, items: state, ...branchProgressSummary(req.user.id, branchId) } });
});

// --- PUT /api/trainee/progress/:branchId ---
// Body: { itemType: 'roadmap_stage' | 'project', itemKey: string, completed: boolean }
router.put("/progress/:branchId", (req, res) => {
  const { branchId } = req.params;
  const { itemType, itemKey, completed } = req.body || {};

  if (!["roadmap_stage", "project"].includes(itemType) || !itemKey) {
    return res.status(400).json({ success: false, message: "itemType and itemKey are required" });
  }

  db.prepare(
    `INSERT INTO trainee_progress (user_id, branch_id, item_type, item_key, completed, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, branch_id, item_type, item_key)
     DO UPDATE SET completed = excluded.completed, updated_at = datetime('now')`
  ).run(req.user.id, branchId, itemType, itemKey, completed ? 1 : 0);

  res.json({ success: true, data: branchProgressSummary(req.user.id, branchId) });
});

// --- GET /api/trainee/notes ---
router.get("/notes", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM study_notes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(req.user.id);
  res.json({ success: true, data: rows });
});

// --- POST /api/trainee/notes ---
// Body: { topic, courseId, noteContent, tags }
router.post("/notes", (req, res) => {
  const { topic, courseId, noteContent, tags } = req.body || {};
  if (!topic || !noteContent) {
    return res.status(400).json({ success: false, message: "Topic and note content are required." });
  }

  const info = db
    .prepare(
      `INSERT INTO study_notes (user_id, topic, course_id, note_content, tags, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(req.user.id, topic.trim(), courseId || "", noteContent.trim(), tags || "");

  const note = db.prepare("SELECT * FROM study_notes WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ success: true, data: note });
});

// --- DELETE /api/trainee/notes/:id ---
router.delete("/notes/:id", (req, res) => {
  db.prepare("DELETE FROM study_notes WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  res.json({ success: true, data: { message: "Note removed" } });
});

module.exports = router;
