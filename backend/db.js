// Dual SQLite & Serverless-Safe Persisted Storage Layer for Backlox Platform
const path = require("path");
const fs = require("fs");

let Database;
try {
  Database = require("better-sqlite3");
} catch (e) {
  console.warn("Notice: better-sqlite3 native driver not found, using JSON disk store:", e.message);
}

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const tmpDir = isServerless ? "/tmp" : __dirname;

let db;

// Persistent JSON File Store Backup for Serverless / Fallback environments
function createDiskStore(dbFilePath) {
  const jsonPath = isServerless
    ? path.join("/tmp", "backlox_store.json")
    : (dbFilePath ? dbFilePath.replace(/\.db$/, ".json") : path.join(__dirname, "backlox_store.json"));

  let tables = {
    users: [
      {
        id: 1,
        name: "Student Demo",
        email: "student@university.edu",
        password_hash: "$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS",
        role: "trainee",
        phone: "+91 9876543210",
        gender: "Male",
        education: "B.Tech Computer Science",
        institution: "Indian Institute of Technology",
        interests: "AI,Machine Learning,Full Stack",
        experience: "Beginner",
        expertise: "React, Node.js",
        bio: "Curious scholar exploring technology career paths.",
        is_premium: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Prof. Alex Vance",
        email: "instructor@backlox.edu",
        password_hash: "$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS",
        role: "instructor",
        phone: "+91 9876500000",
        gender: "Other",
        education: "PhD Computer Systems",
        institution: "Backlox Faculty",
        interests: "Cloud,Systems,Architecture",
        experience: "10+ Years",
        expertise: "Distributed Systems, Rust, Python",
        bio: "Senior faculty mentor at Backlox Platform.",
        is_premium: 1,
        created_at: new Date().toISOString()
      }
    ],
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

  // Seed from bundled JSON if exists in __dirname and not yet in /tmp
  const seedJsonPath = path.join(__dirname, "backlox_store.json");
  if (isServerless && !fs.existsSync(jsonPath) && fs.existsSync(seedJsonPath)) {
    try {
      const seedData = JSON.parse(fs.readFileSync(seedJsonPath, "utf8"));
      tables = { ...tables, ...seedData };
    } catch (_) {}
  }

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

  // Initial save to establish file
  saveToDisk();

  let autoInc = 100;
  Object.values(tables).forEach((list) => {
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item && item.id && item.id > autoInc) autoInc = item.id;
      });
    }
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

          // --- Users Insert ---
          if (lowerSql.startsWith("insert into users")) {
            let user;
            if (params.length >= 10) {
              // Student signup (12 params)
              user = {
                id: autoInc,
                name: params[0],
                email: (params[1] || "").toLowerCase().trim(),
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
            } else if (params.length >= 3) {
              // Instructor signup (4 params: name, email, password_hash, role)
              user = {
                id: autoInc,
                name: params[0],
                email: (params[1] || "").toLowerCase().trim(),
                password_hash: params[2],
                role: params[3] || "instructor",
                phone: "",
                gender: "",
                education: "",
                institution: "",
                interests: "",
                experience: "",
                expertise: "",
                bio: "",
                is_premium: 0,
                created_at: new Date().toISOString()
              };
            } else {
              // Seed insert or fallback
              user = {
                id: autoInc,
                name: params[0] || "Scholar User",
                email: (params[1] || `user_${autoInc}@backlox.site`).toLowerCase().trim(),
                password_hash: params[2] || "",
                role: params[3] || "trainee",
                is_premium: 0,
                created_at: new Date().toISOString()
              };
            }

            // Remove existing user with same email if present to avoid duplication
            tables.users = tables.users.filter(u => (u.email || "").toLowerCase() !== user.email);
            tables.users.push(user);
            saveToDisk();
            return { lastInsertRowid: user.id, changes: 1 };
          }

          // --- Users Update ---
          if (lowerSql.startsWith("update users")) {
            if (lowerSql.includes("is_premium = 1")) {
              const targetId = params[0];
              const u = tables.users.find(x => x.id === targetId || (typeof targetId === "string" && x.email === targetId.toLowerCase()));
              if (u) u.is_premium = 1;
            }
            if (lowerSql.includes("password_hash = ?")) {
              const newHash = params[0];
              const targetEmail = (params[1] || "").toLowerCase();
              const u = tables.users.find(x => (x.email || "").toLowerCase() === targetEmail);
              if (u) u.password_hash = newHash;
            }
            saveToDisk();
            return { changes: 1 };
          }

          // --- Payments Insert ---
          if (lowerSql.startsWith("insert into payments") || lowerSql.startsWith("insert or ignore into payments")) {
            const payment = {
              id: autoInc,
              user_id: params[0],
              plan: params[1],
              amount_paise: params[2],
              currency: params[3] || "INR",
              razorpay_order_id: params[4],
              razorpay_payment_id: params[5] || null,
              razorpay_signature: params[6] || null,
              status: params[7] || (params[5] ? "paid" : "created"),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            tables.payments.push(payment);
            saveToDisk();
            return { lastInsertRowid: payment.id, changes: 1 };
          }

          // --- Payments Update ---
          if (lowerSql.startsWith("update payments")) {
            const status = params[0];
            const paymentId = params[1];
            const signature = params[2];
            const pId = params[3];
            const p = tables.payments.find(x => x.id === pId || x.razorpay_order_id === pId);
            if (p) {
              p.status = status;
              p.razorpay_payment_id = paymentId;
              p.razorpay_signature = signature;
              p.updated_at = new Date().toISOString();
            }
            saveToDisk();
            return { changes: 1 };
          }

          // --- Trainee Progress Insert / Upsert ---
          if (lowerSql.includes("trainee_progress")) {
            const progress = {
              id: autoInc,
              user_id: params[0],
              branch_id: params[1],
              item_type: params[2],
              item_key: params[3],
              completed: params[4] !== undefined ? params[4] : 1,
              updated_at: new Date().toISOString()
            };
            const idx = tables.trainee_progress.findIndex(
              tp => tp.user_id === progress.user_id && tp.branch_id === progress.branch_id && tp.item_type === progress.item_type && tp.item_key === progress.item_key
            );
            if (idx >= 0) {
              tables.trainee_progress[idx].completed = progress.completed;
              tables.trainee_progress[idx].updated_at = progress.updated_at;
            } else {
              tables.trainee_progress.push(progress);
            }
            saveToDisk();
            return { lastInsertRowid: autoInc, changes: 1 };
          }

          // --- Courses Insert ---
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

          // --- Study Notes ---
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

          // Fallback save
          saveToDisk();
          return { lastInsertRowid: autoInc, changes: 1 };
        },

        get: (...params) => {
          if (lowerSql.includes("from users where email")) {
            const email = (params[0] || "").toLowerCase().trim();
            return tables.users.find(u => (u.email || "").toLowerCase().trim() === email) || null;
          }
          if (lowerSql.includes("from users where id")) {
            const id = Number(params[0]);
            return tables.users.find(u => u.id === id) || null;
          }
          if (lowerSql.includes("from payments where razorpay_order_id")) {
            const orderId = params[0];
            const userId = params[1];
            return tables.payments.find(p => p.razorpay_order_id === orderId && (userId ? p.user_id === userId : true)) || null;
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
          if (lowerSql.includes("from payments where user_id")) {
            const uid = params[0];
            return tables.payments.filter(p => p.user_id === uid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          if (lowerSql.includes("from trainee_progress where user_id")) {
            const uid = params[0];
            const branch = params[1];
            return tables.trainee_progress.filter(tp => tp.user_id === uid && (branch ? tp.branch_id === branch : true));
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
const defaultDbPath = isServerless ? path.join("/tmp", "backlox.db") : path.join(__dirname, "backlox.db");
const DB_PATH = process.env.DB_PATH || defaultDbPath;

// In serverless, copy initial seed database to /tmp if present in __dirname and not yet in /tmp
if (isServerless) {
  const sourceDbPath = path.join(__dirname, "backlox.db");
  if (fs.existsSync(sourceDbPath) && !fs.existsSync(DB_PATH)) {
    try {
      fs.copyFileSync(sourceDbPath, DB_PATH);
      console.log(`📋 Copied seed database to writable serverless storage: ${DB_PATH}`);
    } catch (copyErr) {
      console.warn("Notice: could not copy seed db to /tmp:", copyErr.message);
    }
  }
}

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
      `).run("Student Demo", "student@university.edu", "$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS", "trainee");
    } else {
      db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).run('$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'student@university.edu');
    }

    const demoInstructor = db.prepare("SELECT id FROM users WHERE email = ?").get("instructor@backlox.edu");
    if (!demoInstructor) {
      db.prepare(`
        INSERT INTO users (name, email, password_hash, role, is_premium)
        VALUES ('Prof. Alex Vance', 'instructor@backlox.edu', '$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS', 'instructor', 1)
      `).run("Prof. Alex Vance", "instructor@backlox.edu", "$2a$10$ElF7sdCtqflZJ2yl.9Q9oe7Vsa6m3e/.DvVmzrcTAVbdnMboMoiaS", "instructor");
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
