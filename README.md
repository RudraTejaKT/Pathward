# Pathward — Post-12th Career Roadmap App

A web app that walks a student through: **12th grade → Stream → Engineering branch →
Semester-wise courses/skills → Project ideas → Trending IT job roles.**

Built as a working MVP matching the functional requirements discussed for the client project
(career guidance / roadmap tool). React + Node/Express. Career-guide content (streams, branches,
roadmaps, projects, jobs) still lives in a structured JS module, but user accounts, trainee
progress, and payments are now backed by a real SQLite database (`backend/pathward.db`).

**v2 additions:** trainee login/signup (JWT), per-branch progress tracking (roadmap stages +
projects), and a Razorpay-based "Pathward Pro" one-time unlock.

## Project structure

```
career-guide/
├── backend/              Express REST API
│   ├── data.js           Streams, branches, roadmaps, projects, jobs (mock data layer)
│   ├── server.js         Route definitions
│   └── package.json
└── frontend/             React (Vite) app
    ├── src/
    │   ├── api.js               fetch wrapper for the backend
    │   ├── App.jsx               routes
    │   ├── main.jsx               entry point
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PathTrail.jsx      the "journey" stepper used across pages
    │   └── pages/
    │       ├── Home.jsx           hero + stream selection
    │       ├── Branches.jsx       engineering branch grid
    │       └── BranchDetail.jsx   roadmap / projects / job-roles tabs
    └── package.json
```

## Running locally

**1. Backend (runs on port 4000)**
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, and RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
# (use your Razorpay *test* keys from the dashboard while developing)
npm start
```
On first run this creates `backend/pathward.db` (SQLite) with the users, trainee-progress, and
payments tables.

**2. Frontend (runs on port 5173)**
```bash
cd frontend
npm install
cp .env.example .env   # points the frontend at the local API
npm run dev
```

Then open `http://localhost:5173`.

## API endpoints

### Career-guide content (public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/streams` | All post-12th streams (Engineering, Medical, Commerce...) |
| GET | `/api/branches` | All engineering branches |
| GET | `/api/branches/:branchId` | Single branch details |
| GET | `/api/roadmap/:branchId` | Semester-wise subjects & skills for a branch |
| GET | `/api/projects/:branchId` | Beginner → Advanced project ideas for a branch |
| GET | `/api/jobs/:branchId` | Trending job roles + required skills for a branch |
| GET | `/api/branch-details/:branchId` | Combined: branch + roadmap + projects + jobs in one call |

Branch IDs currently available: `cse`, `it`, `aids`, `ece`, `mech`, `civil`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` → creates a trainee account, returns a JWT |
| POST | `/api/auth/login` | `{ email, password }` → returns a JWT |
| GET | `/api/auth/me` | Returns the current user (requires `Authorization: Bearer <token>`) |

### Trainee progress (requires login)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trainee/progress` | Completion % per branch, for the dashboard |
| GET | `/api/trainee/progress/:branchId` | Per-item completion state for one branch |
| PUT | `/api/trainee/progress/:branchId` | `{ itemType: 'roadmap_stage' \| 'project', itemKey, completed }` |

### Payments — Razorpay (requires login)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments/plans` | Available plans and pricing |
| POST | `/api/payments/create-order` | `{ plan: 'pathward_pro' }` → creates a Razorpay order |
| POST | `/api/payments/verify` | Verifies the Razorpay signature and unlocks premium on success |
| GET | `/api/payments/history` | The current user's past payment attempts |

The payment flow follows Razorpay's standard Checkout pattern: the backend creates an order
server-side (so the amount can't be tampered with from the browser), the frontend opens
Razorpay's hosted Checkout widget, and the backend verifies the returned HMAC signature before
marking the user premium. No card details ever touch this app's own servers.

## What's implemented (MVP scope)

- [x] Stream selection (Engineering active; other streams shown as "coming soon" placeholders — matches FR2.1–FR2.3 minus the aptitude quiz)
- [x] Engineering branch listing + comparison info (FR3.1–FR3.2)
- [x] Semester-wise course/skill roadmap per branch (FR4.1–FR4.2)
- [x] Beginner/Intermediate/Advanced project recommendations per branch (FR5.1–FR5.3)
- [x] Trending IT job roles with required skills per branch (FR6.1–FR6.2)
- [x] REST API layer ready to be swapped onto a real database
- [x] User accounts / login, JWT-based (FR1.x)
- [x] Progress tracking / "mark project (and roadmap stage) as complete" (FR7.x), persisted per user
- [x] Payment gateway — Razorpay order creation + signature-verified unlock (part of NFR/monetization scope)
- [x] Persistent database — SQLite via better-sqlite3 (users, trainee_progress, payments)

## Not yet implemented (next milestones)

Still out of scope for this build — flagging for the next sprint:

- Aptitude quiz for stream recommendation (FR2.2)
- Search & filter (FR8.x)
- Admin panel for managing content without code changes (FR9.x)
- Password reset / email verification flow
- Refunds / webhook-based payment reconciliation (currently client-redirect verification only)
- HTTPS, rate limiting, and the other NFR security items — needed before any real deployment
- Swapping career-guide content (streams/branches/roadmaps) off the static `data.js` module —
  user/progress/payment data is already in a real DB, but this content layer is still static

## Tech notes for QA

- Users, trainee progress, and payments now persist in `backend/pathward.db` — safe to restart
  the server between test runs.
- All 6 engineering branches were verified to return complete `roadmap`, `projects`, and `jobs`
  arrays via the combined `/api/branch-details/:branchId` endpoint.
- Frontend gracefully shows a loading state and an error message if the API is unreachable —
  useful to test by stopping the backend while the frontend is running.
- Payment flow requires Razorpay *test mode* keys in `backend/.env` to try end-to-end; use
  Razorpay's published test card/UPI numbers to simulate success and failure.
- Passwords are hashed with bcrypt (never stored or logged in plaintext); JWTs expire after 7 days.
