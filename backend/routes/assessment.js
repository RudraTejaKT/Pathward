const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "backlox-dev-secret-change-in-prod";

// 12 curated multi-dimensional assessment questions
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    category: "Interest & Activity",
    question: "When you have a free weekend to explore a self-driven project, which activity excites you most?",
    icon: "💡",
    options: [
      {
        id: "a",
        label: "Building an app, coding a script, or setting up a smart gadget / game",
        weights: { engineering_tech: 5, cse: 4, it: 3, aids: 3 }
      },
      {
        id: "b",
        label: "Reading about human health, medical breakthroughs, or biology & neurosciences",
        weights: { medical_health: 5, pure_science: 3 }
      },
      {
        id: "c",
        label: "Analyzing stocks, startup business models, or planning an e-commerce venture",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "Designing 3D models, digital artwork, UI layouts, or sketching architectural plans",
        weights: { design_creative: 5, architecture: 3 }
      },
      {
        id: "e",
        label: "Writing essays, debating current affairs, studying legal cases or sociology",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "Tinkering with physical machines, DIY electronics, engines, or practical tools",
        weights: { vocational_hands_on: 4, engineering_tech: 3, mech: 4, ece: 3 }
      }
    ]
  },
  {
    id: 2,
    category: "Problem Solving Style",
    question: "How do you prefer to tackle and solve complex challenges?",
    icon: "🧩",
    options: [
      {
        id: "a",
        label: "Breaking down problems into logical steps, algorithms, and math formulas",
        weights: { engineering_tech: 4, commerce_finance: 2, cse: 4, aids: 4 }
      },
      {
        id: "b",
        label: "Observing symptoms/evidence, formulating scientific hypotheses, and clinical research",
        weights: { medical_health: 5, pure_science: 4 }
      },
      {
        id: "c",
        label: "Evaluating financial risks, profit-loss trade-offs, and negotiating team strategy",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "Brainstorming creative visual metaphors, aesthetics, and user-centric prototypes",
        weights: { design_creative: 5 }
      },
      {
        id: "e",
        label: "Analyzing ethical implications, historical precedents, and arguing legal perspectives",
        weights: { humanities_law: 5 }
      }
    ]
  },
  {
    id: 3,
    category: "Subject Affinity",
    question: "Which high-school / 12th grade subjects did you find most engaging and intuitive?",
    icon: "📚",
    options: [
      {
        id: "a",
        label: "Physics & Mathematics (calculus, mechanics, vectors, algebra)",
        weights: { engineering_tech: 5, mech: 4, ece: 4, cse: 3 }
      },
      {
        id: "b",
        label: "Biology & Chemistry (botany, zoology, organic chemistry, physiology)",
        weights: { medical_health: 5, pure_science: 3 }
      },
      {
        id: "c",
        label: "Accountancy, Business Studies & Economics (markets, trade, money)",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "Computer Science / Informatics Practices (programming, databases, web)",
        weights: { engineering_tech: 5, cse: 5, it: 4, aids: 4 }
      },
      {
        id: "e",
        label: "Political Science, History, English Literature & Psychology",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "Fine Arts, Applied Arts, Technical Drawing / Engineering Graphics",
        weights: { design_creative: 4, architecture: 4, civil: 3, mech: 2 }
      }
    ]
  },
  {
    id: 4,
    category: "Ideal Work Environment",
    question: "Picture your ideal workday 5 years from now. Where are you thriving?",
    icon: "🏢",
    options: [
      {
        id: "a",
        label: "A high-growth tech company or AI research lab building modern software products",
        weights: { engineering_tech: 5, cse: 5, aids: 5, it: 4 }
      },
      {
        id: "b",
        label: "A modern hospital, clinic, or biomedical laboratory helping patients heal",
        weights: { medical_health: 5 }
      },
      {
        id: "c",
        label: "A financial investment firm, corporate boardroom, or leading a startup as a founder",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "A creative design studio, film/game production house, or architectural firm",
        weights: { design_creative: 5, architecture: 4 }
      },
      {
        id: "e",
        label: "A courtroom, policy think-tank, civil service department, or publishing house",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "A manufacturing plant, robotics automation workshop, or infrastructure project site",
        weights: { engineering_tech: 4, mech: 5, civil: 5, ece: 4, vocational_hands_on: 4 }
      }
    ]
  },
  {
    id: 5,
    category: "Data & Technology Inclination",
    question: "When interacting with data and new technology (like Artificial Intelligence), what is your natural reaction?",
    icon: "🤖",
    options: [
      {
        id: "a",
        label: "I want to inspect how the neural networks, code, and mathematical models work under the hood",
        weights: { engineering_tech: 5, aids: 5, cse: 4 }
      },
      {
        id: "b",
        label: "I want to apply AI to predict diseases, genomic research, or medical drug discovery",
        weights: { medical_health: 4, engineering_tech: 3, aids: 3 }
      },
      {
        id: "c",
        label: "I look at how businesses can monetize it, improve ROI, and transform markets",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "I explore generative art, visual interfaces, video effects, and user experiences",
        weights: { design_creative: 5 }
      },
      {
        id: "e",
        label: "I scrutinize its ethical implications, legal policies, copyright, and societal impact",
        weights: { humanities_law: 5 }
      }
    ]
  },
  {
    id: 6,
    category: "Team Role",
    question: "In a group project with 5 classmates, what role do you naturally gravitate toward?",
    icon: "👥",
    options: [
      {
        id: "a",
        label: "The Technical Builder / Coder who implements the core working functionality",
        weights: { engineering_tech: 5, cse: 4, it: 3 }
      },
      {
        id: "b",
        label: "The Researcher who dives into scientific literature, facts, and verification",
        weights: { medical_health: 4, pure_science: 4 }
      },
      {
        id: "c",
        label: "The Strategist / Pitcher who manages the budget, timelines, and business presentation",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "The Visual Designer who makes the slides, prototype, and brand identity look stunning",
        weights: { design_creative: 5 }
      },
      {
        id: "e",
        label: "The Spokesperson / Writer who crafts the arguments, reports, and public speech",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "The Hands-on Fabricator who builds the physical demo or tests hardware components",
        weights: { vocational_hands_on: 4, mech: 4, ece: 4, civil: 3 }
      }
    ]
  },
  {
    id: 7,
    category: "Hardware vs Software vs Concepts",
    question: "If you had to choose what kind of tangible output you enjoy creating:",
    icon: "⚙️",
    options: [
      {
        id: "a",
        label: "Software algorithms, cloud infrastructure, or digital apps",
        weights: { engineering_tech: 5, cse: 5, it: 4 }
      },
      {
        id: "b",
        label: "Embedded circuits, IoT smart sensors, microchips, and communication systems",
        weights: { engineering_tech: 4, ece: 5 }
      },
      {
        id: "c",
        label: "Physical engines, drones, robotic mechanisms, or automated machinery",
        weights: { engineering_tech: 4, mech: 5, vocational_hands_on: 3 }
      },
      {
        id: "d",
        label: "Bridges, architectural landmarks, urban landscapes, and green buildings",
        weights: { engineering_tech: 3, civil: 5, architecture: 4 }
      },
      {
        id: "e",
        label: "Patient care routines, diagnostic protocols, or biological formulations",
        weights: { medical_health: 5 }
      },
      {
        id: "f",
        label: "Financial models, business strategies, marketing campaigns, or legal briefs",
        weights: { commerce_finance: 4, humanities_law: 4 }
      }
    ]
  },
  {
    id: 8,
    category: "Reading & Learning Habits",
    question: "Which of these headlines would you immediately click on to read thoroughly?",
    icon: "📰",
    options: [
      {
        id: "a",
        label: "\"New Quantum Computing & Open-Source AI Breakthroughs Revealed\"",
        weights: { engineering_tech: 5, cse: 4, aids: 5 }
      },
      {
        id: "b",
        label: "\"CRISPR Gene Editing & Revolutionary Cancer Immunotherapies in 2026\"",
        weights: { medical_health: 5 }
      },
      {
        id: "c",
        label: "\"How India's Top Unicorn Startups Raised Capital and Scaled Globally\"",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "\"Top Industrial Design and UI/UX Trends Shaping Next-Gen Consumer Devices\"",
        weights: { design_creative: 5 }
      },
      {
        id: "e",
        label: "\"Landmark Supreme Court Judgments and India's Foreign Policy Strategy\"",
        weights: { humanities_law: 5 }
      }
    ]
  },
  {
    id: 9,
    category: "Stress Tolerance & Work Preference",
    question: "What kind of work pressure or focus do you handle best?",
    icon: "🎯",
    options: [
      {
        id: "a",
        label: "Long deep-work sessions debugging code, writing logic, and solving technical bugs",
        weights: { engineering_tech: 5, cse: 4, it: 3 }
      },
      {
        id: "b",
        label: "High empathy, intense precision, and critical responsibility in patient care",
        weights: { medical_health: 5 }
      },
      {
        id: "c",
        label: "Fast-paced market negotiations, financial targets, and competitive business decisions",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "Iterative critique, visual refinement, and subjective creative exploration",
        weights: { design_creative: 5 }
      },
      {
        id: "e",
        label: "Extensive reading of documentation, case laws, debate prep, and critical synthesis",
        weights: { humanities_law: 5 }
      }
    ]
  },
  {
    id: 10,
    category: "Motivation & Drive",
    question: "What primary outcome gives you the deepest sense of accomplishment?",
    icon: "🏆",
    options: [
      {
        id: "a",
        label: "Inventing or engineering a product that thousands of people use on their computers/phones",
        weights: { engineering_tech: 5, cse: 4, it: 4, aids: 4 }
      },
      {
        id: "b",
        label: "Relieving human suffering, curing an illness, or improving public health standards",
        weights: { medical_health: 5 }
      },
      {
        id: "c",
        label: "Building wealth, closing a major business deal, or scaling an enterprise profitably",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "Creating an iconic visual brand, aesthetic architectural structure, or viral creative work",
        weights: { design_creative: 5, architecture: 4 }
      },
      {
        id: "e",
        label: "Defending justice, influencing public legislation, or educating and uplifting communities",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "Mastering practical craft, precision manufacturing, or maintaining complex critical infrastructure",
        weights: { vocational_hands_on: 5, mech: 4, civil: 4 }
      }
    ]
  },
  {
    id: 11,
    category: "Mathematical & Quantitative Comfort",
    question: "How do you feel about heavy quantitative math and data calculations?",
    icon: "🔢",
    options: [
      {
        id: "a",
        label: "I love math and enjoy applying complex algebra, calculus, and algorithms to tech systems",
        weights: { engineering_tech: 5, aids: 5, cse: 4, ece: 4 }
      },
      {
        id: "b",
        label: "I prefer practical business math (percentages, statistics, financial accounts, ROI)",
        weights: { commerce_finance: 5 }
      },
      {
        id: "c",
        label: "I prefer descriptive science with conceptual chemistry/biology over pure abstract math",
        weights: { medical_health: 5 }
      },
      {
        id: "d",
        label: "I prefer visual geometry, spatial reasoning, scale drawings, and perspective over formulas",
        weights: { design_creative: 4, architecture: 5, civil: 4 }
      },
      {
        id: "e",
        label: "I prefer qualitative analysis, language, verbal reasoning, and case studies over math",
        weights: { humanities_law: 5 }
      }
    ]
  },
  {
    id: 12,
    category: "Career Vision",
    question: "Which of the following professional titles sounds most exciting to you?",
    icon: "🌟",
    options: [
      {
        id: "a",
        label: "Full Stack Engineer / AI & Machine Learning Specialist / Cloud Architect",
        weights: { engineering_tech: 5, cse: 5, aids: 5, it: 4 }
      },
      {
        id: "b",
        label: "Doctor (MBBS) / Surgeon / Clinical Researcher / Pharmacist",
        weights: { medical_health: 5 }
      },
      {
        id: "c",
        label: "Chartered Accountant / Investment Banker / Product Manager / Entrepreneur",
        weights: { commerce_finance: 5 }
      },
      {
        id: "d",
        label: "UX/UI Lead / Creative Director / Principal Architect / Game Designer",
        weights: { design_creative: 5, architecture: 4 }
      },
      {
        id: "e",
        label: "Corporate Lawyer / Civil Servant (IAS/IPS) / Policy Analyst / Journalist",
        weights: { humanities_law: 5 }
      },
      {
        id: "f",
        label: "Robotics Engineer / Automotive Specialist / Structural Project Manager",
        weights: { engineering_tech: 4, mech: 5, civil: 5, ece: 4 }
      }
    ]
  }
];

// Stream metadata for recommendation responses
const STREAM_PROFILES = {
  engineering_tech: {
    id: "science",
    name: "Science — Engineering & Technology",
    icon: "💻",
    description: "High aptitude for logical decomposition, algorithms, mathematics, and building digital or physical tech solutions.",
    keyDegrees: ["B.Tech / B.E. (Computer Science, AI & DS, ECE, Mechanical)", "BCA / MCA", "B.Sc. Data Science & Computing"],
    targetExams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "State CETs (KCET, MHT-CET, COMEDK)"],
    topRoles: ["Software Development Engineer", "AI/ML Engineer", "Cloud & DevOps Architect", "Robotics Specialist"],
    learnPath: "/engineering"
  },
  medical_health: {
    id: "science",
    name: "Science — Medical & Allied Health Sciences",
    icon: "🩺",
    description: "Strong affinity for life sciences, human physiology, diagnostic research, healthcare service, and clinical precision.",
    keyDegrees: ["MBBS", "BDS (Dental)", "BAMS / BHMS (AYUSH)", "B.Pharm / Pharm.D", "B.Sc. Nursing & Allied Health"],
    targetExams: ["NEET-UG", "AIIMS Nursing Entrance", "CUET-UG (Biotech/Biomedical)"],
    topRoles: ["Physician / Surgeon", "Clinical Researcher", "Pharmaceutical Scientist", "Biotechnologist"],
    learnPath: "/learn"
  },
  commerce_finance: {
    id: "commerce",
    name: "Commerce, Business & Financial Strategy",
    icon: "📈",
    description: "Natural orientation toward financial markets, business models, investment analytics, accounting, and leadership.",
    keyDegrees: ["B.Com (Hons)", "BBA / BMS", "Integrated BBA-MBA (IPMAT)", "CA / CMA / CS Pathways"],
    targetExams: ["CUET-UG (Commerce & Economics)", "CA Foundation", "CMA Foundation", "IPMAT (IIM Indore/Rohtak)", "NPAT"],
    topRoles: ["Chartered Accountant", "Investment Banker", "Financial Analyst", "Management Consultant", "Startup Founder"],
    learnPath: "/learn"
  },
  design_creative: {
    id: "arts",
    name: "Design, Architecture & Creative Arts",
    icon: "🎨",
    description: "Excellence in visual aesthetics, spatial reasoning, user experience design, storytelling, and digital creative production.",
    keyDegrees: ["B.Des (UI/UX, Product, Communication)", "B.Arch (Architecture)", "BFA (Fine/Applied Arts)", "B.Sc. Animation & VFX"],
    targetExams: ["UCEED", "NID DAT", "NIFT Entrance", "NATA (for Architecture)", "CUET-UG (Fine Arts)"],
    topRoles: ["Product / UI/UX Designer", "Architect & Spatial Designer", "Creative Director", "Game & 3D Visualizer"],
    learnPath: "/learn"
  },
  humanities_law: {
    id: "arts",
    name: "Law, Public Policy & Social Sciences",
    icon: "⚖️",
    description: "Strong verbal and logical reasoning, interest in justice, ethics, public policy, civil governance, and social dynamics.",
    keyDegrees: ["5-Year Integrated BA LLB / BBA LLB", "BA (Political Science, Psychology, Economics, Journalism)", "B.Ed / Social Work"],
    targetExams: ["CLAT", "AILET", "SLAT", "CUET-UG (Humanities)", "UPSC / State Civil Services (Post-Grad)"],
    topRoles: ["Corporate & Litigation Lawyer", "Civil Servant (IAS / IPS)", "Public Policy Analyst", "Investigative Journalist"],
    learnPath: "/learn"
  },
  vocational_hands_on: {
    id: "vocational",
    name: "Vocational, Applied Technology & Industry Trades",
    icon: "🛠️",
    description: "High aptitude for practical implementation, hardware troubleshooting, applied skills, and fast-track employment routes.",
    keyDegrees: ["Polytechnic Engineering Diploma", "B.Voc (Applied Tech, Healthcare, Hospitality)", "ITI Advanced Trades"],
    targetExams: ["Polytechnic Entrance (JEECUP, AP POLYCET, etc.)", "CUET-UG (Vocational)", "Apprenticeship Assessments"],
    topRoles: ["Automation Technician", "Network Support Specialist", "Precision Machining Specialist", "Technical Project Supervisor"],
    learnPath: "/learn"
  }
};

const BRANCH_PROFILES = {
  cse: {
    id: "cse",
    name: "Computer Science & Engineering (CSE)",
    matchKeywords: ["Software Development", "Algorithms", "Web & Mobile Systems", "System Design"],
    route: "/engineering/cse"
  },
  aids: {
    id: "aids",
    name: "Artificial Intelligence & Data Science (AI & DS)",
    matchKeywords: ["Machine Learning", "Neural Networks", "Data Engineering", "Predictive Analytics"],
    route: "/engineering/aids"
  },
  it: {
    id: "it",
    name: "Information Technology (IT)",
    matchKeywords: ["Cloud Infrastructure", "Cybersecurity", "DevOps", "Database Systems"],
    route: "/engineering/it"
  },
  ece: {
    id: "ece",
    name: "Electronics & Communication (ECE)",
    matchKeywords: ["Embedded Systems", "IoT & Microcontrollers", "VLSI Design", "Telecom Networks"],
    route: "/engineering/ece"
  },
  mech: {
    id: "mech",
    name: "Mechanical Engineering",
    matchKeywords: ["Robotics & Automation", "CAD/CAM 3D Design", "Electric Vehicles (EV)", "Thermal Engineering"],
    route: "/engineering/mech"
  },
  civil: {
    id: "civil",
    name: "Civil Engineering",
    matchKeywords: ["Smart Infrastructure", "Structural Engineering", "Green Urban Planning", "Project Management"],
    route: "/engineering/civil"
  }
};

// Optional auth extraction helper (doesn't fail if guest)
function getOptionalUser(req) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/, "");
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return db.prepare("SELECT id, name, email, role, is_premium FROM users WHERE id = ?").get(decoded.id) || null;
  } catch {
    return null;
  }
}

// GET /api/assessment/questions
router.get("/questions", (req, res) => {
  res.json({
    success: true,
    data: {
      total: ASSESSMENT_QUESTIONS.length,
      questions: ASSESSMENT_QUESTIONS
    }
  });
});

// POST /api/assessment/evaluate
router.post("/evaluate", (req, res) => {
  const { answers } = req.body || {}; // Record of questionId -> optionId (e.g. { "1": "a", "2": "b" })

  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ success: false, message: "Invalid answers submitted" });
  }

  // Initialize accumulators
  const streamScores = {
    engineering_tech: 0,
    medical_health: 0,
    commerce_finance: 0,
    design_creative: 0,
    humanities_law: 0,
    vocational_hands_on: 0
  };

  const branchScores = {
    cse: 0,
    aids: 0,
    it: 0,
    ece: 0,
    mech: 0,
    civil: 0
  };

  // Tally weights
  for (const q of ASSESSMENT_QUESTIONS) {
    const selectedOptionId = answers[q.id] || answers[String(q.id)];
    if (!selectedOptionId) continue;
    const opt = q.options.find(o => o.id === selectedOptionId);
    if (!opt || !opt.weights) continue;

    for (const [key, weight] of Object.entries(opt.weights)) {
      if (streamScores[key] !== undefined) {
        streamScores[key] += weight;
      }
      if (branchScores[key] !== undefined) {
        branchScores[key] += weight;
      }
    }
  }

  // Compute total stream points and percentages
  const maxStreamScore = Math.max(...Object.values(streamScores), 1);
  const sumStreamScores = Object.values(streamScores).reduce((a, b) => a + b, 0) || 1;

  const streamMatches = Object.keys(streamScores).map(key => {
    const raw = streamScores[key];
    const percentage = Math.min(99, Math.max(15, Math.round((raw / maxStreamScore) * 88 + (raw / sumStreamScores) * 12)));
    return {
      streamKey: key,
      ...STREAM_PROFILES[key],
      rawScore: raw,
      matchPercentage: percentage
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const topStream = streamMatches[0];

  // Compute branch matches
  const maxBranchScore = Math.max(...Object.values(branchScores), 1);
  const branchMatches = Object.keys(branchScores).map(key => {
    const raw = branchScores[key];
    const percentage = Math.min(98, Math.max(20, Math.round((raw / maxBranchScore) * 92)));
    return {
      branchId: key,
      ...BRANCH_PROFILES[key],
      rawScore: raw,
      matchPercentage: percentage
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const topBranch = branchMatches[0];

  // Determine top student traits based on scoring distribution
  const traits = [];
  if (streamScores.engineering_tech >= 12) traits.push("Algorithmic & Systems Thinker");
  if (branchScores.aids >= 8 || streamScores.engineering_tech >= 15) traits.push("Data-Driven Problem Solver");
  if (streamScores.medical_health >= 10) traits.push("Scientific & Diagnostic Mindset");
  if (streamScores.commerce_finance >= 10) traits.push("Strategic & Financial Acumen");
  if (streamScores.design_creative >= 10) traits.push("Aesthetic & Visual Intuition");
  if (streamScores.humanities_law >= 10) traits.push("Critical Thinking & Persuasive Communicator");
  if (streamScores.vocational_hands_on >= 8 || branchScores.mech >= 8) traits.push("Practical & Hands-On Engineering Aptitude");

  if (traits.length === 0) {
    traits.push("Versatile & Multi-Disciplinary Learner");
  }

  const resultData = {
    topStream,
    topBranch: topStream.streamKey === "engineering_tech" ? topBranch : null,
    streamMatches,
    branchMatches,
    studentTraits: traits.slice(0, 4),
    recommendedExams: topStream.targetExams,
    recommendedDegrees: topStream.keyDegrees,
    summary: `Your responses reflect the strongest alignment with **${topStream.name}** (${topStream.matchPercentage}% match). ${topStream.description}`,
    evaluatedAt: new Date().toISOString()
  };

  // If user is authenticated, persist result
  const user = getOptionalUser(req);
  if (user) {
    try {
      db.prepare(`
        INSERT INTO assessment_results(user_id, top_stream, top_branch, scores_json)
        VALUES(?, ?, ?, ?)
      `).run(
        user.id,
        topStream.name,
        resultData.topBranch ? resultData.topBranch.name : null,
        JSON.stringify(resultData)
      );
    } catch (err) {
      console.error("Failed to persist assessment result:", err);
    }
  }

  res.json({
    success: true,
    data: resultData
  });
});

// GET /api/assessment/latest (for logged in users)
router.get("/latest", requireAuth, (req, res) => {
  const row = db.prepare(`
    SELECT * FROM assessment_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(req.user.id);

  if (!row) {
    return res.json({ success: true, data: null });
  }

  try {
    const parsed = JSON.parse(row.scores_json);
    res.json({
      success: true,
      data: {
        id: row.id,
        createdAt: row.created_at,
        ...parsed
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error parsing saved assessment result" });
  }
});

module.exports = router;
