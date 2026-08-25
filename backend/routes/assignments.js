const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/assignments (Get all assignments or filtered by courseId)
router.get("/", (req, res) => {
  const { courseId } = req.query;
  let rows;
  if (courseId) {
    rows = db.prepare("SELECT * FROM assignments WHERE course_id = ? ORDER BY id DESC").all(courseId);
  } else {
    rows = db.prepare("SELECT * FROM assignments ORDER BY id DESC").all();
  }

  // Pre-populate demo assignments if none exist
  if (!rows || rows.length === 0) {
    const demo = [
      {
        id: 1,
        instructor_id: 1,
        course_id: "feat-1",
        title: "Assignment 1: PyTorch Attention Matrix & Scaled Softmax",
        description: "Implement scaled dot-product attention from mathematical derivation with masked decoder capability.",
        due_date: "July 30, 2026",
        max_points: 100,
        starter_code: "import torch\n\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    # Write your implementation here\n    pass",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        instructor_id: 1,
        course_id: "feat-1",
        title: "Assignment 2: Dockerized FastAPI Model Serving Endpoint",
        description: "Build an asynchronous FastAPI service serving ONNX exported models with docker-compose.",
        due_date: "August 05, 2026",
        max_points: 100,
        starter_code: "from fastapi import FastAPI\napp = FastAPI()\n\n@app.post('/predict')\nasync def predict(payload: dict):\n    pass",
        created_at: new Date().toISOString()
      }
    ];
    return res.json({ success: true, data: demo });
  }

  res.json({ success: true, data: rows });
});

// POST /api/assignments (Instructor creates a new assignment)
router.post("/", requireAuth, (req, res) => {
  const { courseId, title, description, dueDate, maxPoints, starterCode } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required." });
  }

  const info = db.prepare(
    `INSERT INTO assignments (instructor_id, course_id, title, description, due_date, max_points, starter_code)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.user.id,
    courseId || "",
    title.trim(),
    description.trim(),
    dueDate || "Next Week",
    Number(maxPoints || 100),
    starterCode || ""
  );

  const created = db.prepare("SELECT * FROM assignments WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ success: true, data: created });
});

// POST /api/assignments/:id/submit (Student submits work)
router.post("/:id/submit", requireAuth, (req, res) => {
  const assignmentId = req.params.id;
  const { submissionContent, submissionUrl } = req.body || {};

  if (!submissionContent && !submissionUrl) {
    return res.status(400).json({ success: false, message: "Submission content or repository URL required." });
  }

  const info = db.prepare(
    `INSERT INTO assignment_submissions (assignment_id, user_id, student_name, submission_content, submission_url, status)
     VALUES (?, ?, ?, ?, ?, 'submitted')`
  ).run(
    assignmentId,
    req.user.id,
    req.user.name || "Scholar",
    submissionContent || "",
    submissionUrl || ""
  );

  const sub = db.prepare("SELECT * FROM assignment_submissions WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ success: true, data: sub });
});

// GET /api/assignments/:id/submissions (Instructor reviews submissions)
router.get("/:id/submissions", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM assignment_submissions WHERE assignment_id = ? ORDER BY id DESC").all(req.params.id);
  res.json({ success: true, data: rows });
});

// POST /api/assignments/submissions/:id/grade (Instructor grades a submission)
router.post("/submissions/:id/grade", requireAuth, (req, res) => {
  const { score, feedback } = req.body || {};
  db.prepare(
    `UPDATE assignment_submissions 
     SET score = ?, feedback = ?, status = 'graded', graded_at = datetime('now')
     WHERE id = ?`
  ).run(Number(score || 0), feedback || "Great work!", req.params.id);

  const updated = db.prepare("SELECT * FROM assignment_submissions WHERE id = ?").get(req.params.id);
  res.json({ success: true, data: updated });
});

// GET /api/assignments/instructor/all-submissions (Get all submissions for an instructor's assignments)
router.get("/instructor/all-submissions", requireAuth, (req, res) => {
  const rows = db.prepare(
    `SELECT sub.*, a.title AS assignment_title, a.max_points 
     FROM assignment_submissions sub
     JOIN assignments a ON a.id = sub.assignment_id
     ORDER BY sub.id DESC`
  ).all();

  // If none in DB, return high quality demo submissions for realistic Coursera/Udemy grading UI
  if (!rows || rows.length === 0) {
    const demo = [
      {
        id: 101,
        assignment_id: 1,
        assignment_title: "PyTorch Attention Matrix & Scaled Softmax",
        student_name: "Nabisha Khan",
        submission_content: "Implemented Multi-Head Attention using torch.einsum with scaled dot-product and causal masking. Unit tests passed with 99.8% precision.",
        submission_url: "https://github.com/nabisha/attention-mechanisms",
        score: 98,
        feedback: "Exceptional einsum optimization and clean docstrings!",
        status: "graded",
        submitted_at: "2 hours ago",
        max_points: 100
      },
      {
        id: 102,
        assignment_id: 1,
        assignment_title: "PyTorch Attention Matrix & Scaled Softmax",
        student_name: "Chandrakesh Sharma",
        submission_content: "Wrote attention computation with PyTorch tensor broadcasting and softmax temperature scaling. Tested on BERT tokenizer sentences.",
        submission_url: "https://github.com/chandrakesh/transformer-core",
        score: null,
        feedback: "",
        status: "submitted",
        submitted_at: "5 hours ago",
        max_points: 100
      },
      {
        id: 103,
        assignment_id: 2,
        assignment_title: "Dockerized FastAPI Model Serving Endpoint",
        student_name: "Mohammad Umar",
        submission_content: "Built async FastAPI server with ONNX Runtime inference engine. Added Dockerfile with multi-stage build reducing image to 180MB.",
        submission_url: "https://github.com/umar/fastapi-onnx-docker",
        score: null,
        feedback: "",
        status: "submitted",
        submitted_at: "Yesterday",
        max_points: 100
      }
    ];
    return res.json({ success: true, data: demo });
  }

  res.json({ success: true, data: rows });
});

module.exports = router;
