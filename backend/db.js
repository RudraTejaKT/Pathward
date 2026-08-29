// Dual SQLite & File-Persisted Storage Layer for Backlox Platform
const path = require("path");
const fs = require("fs");

let Database;
try {
  Database = require("better-sqlite3");
} catch (e) {
  console.warn("Notice: better-sqlite3 native driver not found, using JSON disk store:", e.message);
}

let db;

// Persistent JSON File Store Backup
function createDiskStore(dbFilePath) {
  const jsonPath = dbFilePath ? dbFilePath.replace(/\.db$/, ".json") : path.join(__dirname, "backlox_store.json");

  let tables = {
    users: [],
    trainee_progress: [],
    courses: [],
    course_modules: [],
    course_enrollments: [],
    payments: [],
    assessment_results: [],
    study_notes: [],
    assignments: [],
    assignment_submissions: []
  };

  // Load from disk if exists
  try {
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      tables = { ...tables, ...data };
      console.log(`📁 Loaded ${tables.users.length} users from persistent disk store: ${jsonPath}`);
    }
  } catch (e) {
    console.warn("Disk store load notice:", e.message);
  }

  function saveToDisk() {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(tables, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to persist data to disk:", e.message);
    }
  }

  let autoInc = 100;
  Object.values(tables).forEach(list => {
    list.forEach(item => {
      if (item && item.id && item.id > autoInc) autoInc = item.id;
    });
  });

  return {
    pragma: () => {},
    exec: () => {},
    prepare: (sql) => {
      const cleanSql = sql.trim();
      const lowerSql = cleanSql.toLowerCase();

      return {
        run: (...params) => {
          autoInc++;
          if (lowerSql.startsWith("insert into users")) {
            const user = {
              id: autoInc,
              name: params[0],
              email: (params[1] || "").toLowerCase(),
              password_hash: params[2],
              role: params[3] || "trainee",
              phone: params[4] || "",
              gender: params[5] || "",
              education: params[6] || "",
              institution: params[7] || "",
              interests: params[8] || "",
              experience: params[9] || "",
              expertise: params[10] || "",
              bio: params[11] || "",
              is_premium: 0,
              created_at: new Date().toISOString()
            };
            tables.users.push(user);
            saveToDisk();
            return { lastInsertRowid: user.id, changes: 1 };
          }

          if (lowerSql.startsWith("insert into courses")) {
            const course = {
              id: autoInc,
              instructor_id: params[0],
              title: params[1],
              description: params[2],
              category: params[3],
              stream_id: params[4] || null,
              price_paise: params[5] || 0,
              status: params[6] || "published",
              created_at: new Date().toISOString()
            };
            tables.courses.push(course);
            saveToDisk();
            return { lastInsertRowid: course.id, changes: 1 };
          }

          if (lowerSql.startsWith("insert into study_notes")) {
            const note = {
              id: autoInc,
              user_id: params[0],
              topic: params[1],
              note_content: params[2],
              tags: params[3] || "",
              course_id: params[4] || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            tables.study_notes.push(note);
            saveToDisk();
            return { lastInsertRowid: note.id, changes: 1 };
          }

          if (lowerSql.startsWith("update users")) {
            saveToDisk();
            return { changes: 1 };
          }

          saveToDisk();
          return { lastInsertRowid: autoInc, changes: 1 };
        },

        get: (...params) => {
          if (lowerSql.includes("from users where email")) {
            const email = (params[0] || "").toLowerCase();
            return tables.users.find(u => (u.email || "").toLowerCase() === email) || null;
          }
          if (lowerSql.includes("from users where id")) {
            const id = Number(params[0]);
            return tables.users.find(u => u.id === id) || null;
          }
          if (lowerSql.includes("from courses where id")) {
            const id = Number(params[0]);
            return tables.courses.find(c => c.id === id) || null;
          }
          if (lowerSql.includes("from study_notes where id")) {
            const id = Number(params[0]);
            return tables.study_notes.find(n => n.id === id) || null;
          }
          return null;
        },

        all: (...params) => {
          if (lowerSql.includes("from courses")) {
            return tables.courses;
          }
          if (lowerSql.includes("from users")) {
            return tables.users;
          }
          if (lowerSql.includes("from study_notes")) {
            return tables.study_notes.filter(n => n.user_id === Number(params[0]));
          }
          if (lowerSql.includes("from assignments")) {
            return tables.assignments;
          }
          return [];
        }
      };
    }
  };
}

// 1. Initialize SQLite Database
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "backlox.db");

if (Database) {
  try {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    console.log(`💾 SQLite Database connected on disk: ${DB_PATH}`);
  } catch (err) {
    console.warn("SQLite disk init warning, using disk JSON store:", err.message);
    db = createDiskStore(DB_PATH);
  }
} else {
  db = createDiskStore(DB_PATH);
}

// 2. Initialize Database Schema
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'trainee',
      phone TEXT,
      gender TEXT,
      education TEXT,
      institution TEXT,
      interests TEXT,
      experience TEXT,
      expertise TEXT,
      bio TEXT,
      is_premium INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trainee_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      branch_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_key TEXT NOT NULL,
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
      plan TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      razorpay_order_id TEXT NOT NULL UNIQUE,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      status TEXT NOT NULL DEFAULT 'created',
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
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      graded_at TEXT DEFAULT NULL
    );
  `);

  ["phone", "gender", "education", "institution", "interests", "experience", "expertise", "bio"].forEach((col) => {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
    } catch {}
  });

  // Seed default demo student and instructor accounts if not present
  try {
    const demoStudent = db.prepare("SELECT id FROM users WHERE email = ?").get("student@university.edu");
    if (!demoStudent) {
      db.prepare(`
        INSERT INTO users (name, email, password_hash, role, is_premium)
        VALUES ('Student Demo', 'student@university.edu', '$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'trainee', 1)
      `).run();
    } else {
      db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).run('$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'student@university.edu');
    }

    const demoInstructor = db.prepare("SELECT id FROM users WHERE email = ?").get("instructor@backlox.edu");
    if (!demoInstructor) {
      db.prepare(`
        INSERT INTO users (name, email, password_hash, role, is_premium)
        VALUES ('Prof. Alex Vance', 'instructor@backlox.edu', '$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'instructor', 1)
      `).run();
    } else {
      db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).run('$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'instructor@backlox.edu');
    }
  } catch (seedErr) {
    console.warn("Notice: demo user seeding:", seedErr.message);
  }
} catch (e) {
  console.warn("DB table setup warning:", e.message);
}

module.exports = db;
