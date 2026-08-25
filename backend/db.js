// SQLite persistence layer. Replaces the "no DB yet" gap flagged in the
// original README — this is the minimal real store needed for login,
// trainee progress, and payment records to actually persist across restarts.

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "pathward.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'trainee',   -- 'trainee' | 'admin' | 'instructor'
    phone TEXT,
    gender TEXT,
    education TEXT,
    institution TEXT,
    interests TEXT,
    experience TEXT,
    expertise TEXT,
    bio TEXT,
    is_premium INTEGER NOT NULL DEFAULT 0,  -- unlocked by a successful payment
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trainee_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL,
    item_type TEXT NOT NULL,   -- 'roadmap_stage' | 'project'
    item_key TEXT NOT NULL,    -- stage name or project title
    completed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, branch_id, item_type, item_key)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    stream_id TEXT,
    price_paise INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    video_url TEXT NOT NULL DEFAULT '',
    resource_url TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS course_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(course_id,user_id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,               -- e.g. 'pathward_pro'
    amount_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'created', -- 'created' | 'paid' | 'failed'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assessment_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    top_stream TEXT NOT NULL,
    top_branch TEXT,
    scores_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS study_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    course_id TEXT DEFAULT '',
    note_content TEXT NOT NULL,
    tags TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT DEFAULT '',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT DEFAULT '',
    max_points INTEGER DEFAULT 100,
    starter_code TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT DEFAULT '',
    submission_content TEXT NOT NULL,
    submission_url TEXT DEFAULT '',
    score INTEGER DEFAULT NULL,
    feedback TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'graded'
    submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
    graded_at TEXT DEFAULT NULL
  );
`);

// Safe runtime column migrations
["phone", "gender", "education", "institution", "interests", "experience", "expertise", "bio"].forEach((col) => {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
  } catch {}
});

module.exports = db;
