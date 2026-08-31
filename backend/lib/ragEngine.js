// Intelligent Retrieval-Augmented Generation (RAG) & Dynamic Academic Advisor Engine for Backlox Platform
// Indexes multi-stream knowledge: 35+ Engineering branches, Medical Sciences, Commerce/Law,
// Salary Telemetry, Exam Blueprints (JEE/NEET/GATE/CAT), Core Concept Tutorials & Platform Diagnostics.

const fs = require("fs");
const path = require("path");

// ==========================================
// 1. RAG KNOWLEDGE CORPUS
// ==========================================
const KNOWLEDGE_BASE = [
  // --- COMPUTER SCIENCE & IT ---
  {
    id: "kb_cse_overview",
    tags: ["cse", "computer science", "software", "programming", "coding", "it", "developer", "software engineer"],
    title: "Computer Science & Engineering (CSE) Pathway",
    category: "Engineering",
    summary: "Computer Science & Engineering focuses on algorithmic problem solving, software architectures, distributed systems, and computing theory.",
    details: `
**Computer Science & Engineering (CSE)**
- **Degree**: B.Tech / B.E. (4 Years) | **Eligibility**: 10+2 with PCM (Physics, Chemistry, Math).
- **Core Curricula**: Data Structures & Algorithms (DSA), Object-Oriented Programming (C++/Java/Python), Database Management Systems (DBMS), Operating Systems (Linux/Unix), Computer Networks (TCP/IP), Theory of Computation, Compiler Design, Distributed Systems, Cloud Architecture.
- **Top Career Trajectories**: Full-Stack Software Engineer, Distributed Systems Architect, Backend Platform Engineer, Cloud Infrastructure DevOps Specialist.
- **Salary Benchmarks (India)**:
  - Tier-1 (IITs/NITs/BITS): ₹18 LPA – ₹48 LPA (Top offers ₹1.2 Cr+ International).
  - Tier-2/3 Institutes: ₹6 LPA – ₹14 LPA.
  - High-Frequency Recruiters: Google, Microsoft, Amazon, Uber, Atlassian, Oracle, Adobe, Flipkart, Goldman Sachs.
    `,
    suggestedPills: ["CSE 4-Year Semester Roadmap", "Best DSA Roadmap for FAANG", "Compare CSE vs AI & Data Science", "Top Cloud Certifications (AWS/GCP)"],
  },
  {
    id: "kb_ai_data_science",
    tags: ["ai", "artificial intelligence", "data science", "machine learning", "ml", "deep learning", "nlp", "llm", "neural networks", "aids"],
    title: "Artificial Intelligence & Data Science (AI & DS)",
    category: "Engineering",
    summary: "AI & Data Science combines mathematical statistics, machine learning models, neural networks, computer vision, and large-scale data engineering.",
    details: `
**Artificial Intelligence & Data Science (AI & DS)**
- **Degree**: B.Tech in AI & Data Science / B.Tech in CSE (AI Specialization).
- **Core Curricula**: Linear Algebra & Multivariate Calculus, Probability & Inferential Statistics, Supervised & Unsupervised Machine Learning, Deep Neural Architectures (CNNs, RNNs, Transformers), Natural Language Processing (NLP), Big Data Analytics (Spark, Kafka), PyTorch & TensorFlow, Vector Databases (Pinecone, Milvus, Qdrant).
- **Modern Specializations**: Generative AI (LLMs, Diffusion Models, LoRA Fine-Tuning, RAG Architecture), Computer Vision (YOLO, OpenCV), MLOps (Kubeflow, MLflow).
- **Salary Benchmarks**:
  - Entry-level AI Engineer: ₹10 LPA – ₹22 LPA.
  - Senior ML/AI Researcher: ₹35 LPA – ₹75 LPA+.
  - Industry Sectors: Autonomous Vehicles, FinTech Fraud Detection, Healthcare Diagnostics, Quantitative Trading, Enterprise SaaS.
    `,
    suggestedPills: ["Explain Transformer Self-Attention", "How to Build a RAG Pipeline", "Mathematics for Machine Learning", "Compare AI/DS vs Core CSE"],
  },

  // --- ELECTRONICS & ELECTRICAL ---
  {
    id: "kb_ece_vlsi",
    tags: ["ece", "electronics", "communication", "vlsi", "embedded", "chip", "semiconductor", "microprocessor", "iot"],
    title: "Electronics & Communication Engineering (ECE & VLSI)",
    category: "Engineering",
    summary: "ECE covers semiconductor physics, VLSI chip design, embedded microcontrollers, analog/digital signal processing, and RF communications.",
    details: `
**Electronics & Communication Engineering (ECE & VLSI)**
- **Degree**: B.Tech / B.E. (4 Years).
- **Core Curricula**: Electronic Devices & Circuits (EDC), Digital Logic & HDL (Verilog/VHDL), Microprocessors & Microcontrollers (8051, ARM Cortex, RISC-V), VLSI Design (CMOS, Cadence/Synopsys tools), Signals & Systems, Wireless Communications (5G/6G, RF circuits).
- **Booming Domains**:
  1. **Semiconductor & Chip Design (India Semiconductor Mission)**: RTL design, Physical Design (PD), DFT, FPGA prototyping (NVIDIA, Intel, Qualcomm, Texas Instruments, AMD, MediaTek).
  2. **Embedded Systems & IoT**: Firmware development (C/C++, FreeRTOS, ESP32, STM32), Automotive ECU design.
- **Salary Benchmarks**:
  - Core VLSI Design Engineer: ₹12 LPA – ₹32 LPA (Tier-1 campuses often touch ₹25–40 LPA).
  - Embedded Systems / IoT: ₹6.5 LPA – ₹16 LPA.
    `,
    suggestedPills: ["VLSI Design Career Guide", "Embedded Systems Roadmap", "Difference between FPGA and ASIC", "GATE ECE Preparation Strategy"],
  },
  {
    id: "kb_eee_power",
    tags: ["eee", "electrical", "electronics", "power systems", "ev", "electric vehicles", "renewable", "solar", "grid", "smart grid"],
    title: "Electrical & Electronics Engineering (EEE & EV Systems)",
    category: "Engineering",
    summary: "EEE bridges high-voltage power generation, smart grids, renewable solar/wind energy, control systems, and modern electric vehicle powertrains.",
    details: `
**Electrical & Electronics Engineering (EEE & Clean Tech)**
- **Core Curricula**: Electrical Machines (Transformers, Induction/Synchronous Motors), Power Systems Engineering, Control Systems Theory (Bode Plots, State-Space), Power Electronics (Inverters, Buck-Boost Converters), High Voltage Engineering, Electric Vehicle Powertrain & Battery Management Systems (BMS).
- **High-Growth Frontiers**:
  - Electric Vehicles (EV): Battery thermal management, motor drives (Tesla, Ather, Ola Electric, Tata Motors).
  - Renewable Energy & Smart Grid: Solar inverter systems, micro-grid management, wind turbines.
- **Recruiters & PSUs**: Power Grid (PGCIL), NTPC, BHEL, Schneider Electric, ABB, Siemens, L&T, GE Vernova.
    `,
    suggestedPills: ["Electric Vehicle (EV) Engineering Guide", "Power Electronics in Renewable Energy", "GATE Electrical Syllabus & Books"],
  },

  // --- MECHANICAL & AEROSPACE ---
  {
    id: "kb_mechanical_robotics",
    tags: ["mechanical", "robotics", "mechatronics", "cad", "cam", "thermodynamics", "automobile", "manufacturing", "cfd"],
    title: "Mechanical Engineering, Robotics & Mechatronics",
    category: "Engineering",
    summary: "Mechanical Engineering deals with thermodynamics, fluid mechanics, structural design (CAD/FEA), robotics kinematics, and advanced manufacturing.",
    details: `
**Mechanical Engineering & Robotics**
- **Core Curricula**: Engineering Thermodynamics, Fluid Mechanics, Strength of Materials (SOM), Theory of Machines (Kinematics & Dynamics), Manufacturing Processes & CNC, Finite Element Analysis (FEA), Computational Fluid Dynamics (CFD), CAD Design (SolidWorks, CATIA, Fusion 360).
- **Mechatronics & Robotics**: ROS2 (Robot Operating System), Inverse Kinematics, Actuators & Sensors, PLC Automation, Industrial Cobots.
- **Top Industries**: Aerospace & Defense (ISRO, DRDO, Boeing, Airbus), Automotive & EV (Tata Motors, Mahindra, BMW), Heavy Engineering (L&T, Caterpillar, Bosch).
- **Salary Benchmarks**: Core Design/CFD Engineer: ₹7 LPA – ₹18 LPA; Robotics Specialist: ₹10 LPA – ₹26 LPA.
    `,
    suggestedPills: ["Robotics & ROS2 Roadmap", "CFD & FEA Simulation Tools", "SolidWorks vs CATIA for Industry", "GATE Mechanical Strategy"],
  },
  {
    id: "kb_aerospace",
    tags: ["aerospace", "aeronautical", "space", "isro", "aircraft", "propulsion", "rocket", "satellite", "avionics"],
    title: "Aerospace & Aeronautical Engineering",
    category: "Engineering",
    summary: "Aerospace Engineering involves aerodynamics, rocket propulsion, satellite systems, orbital mechanics, structural aeroelasticity, and flight control avionics.",
    details: `
**Aerospace & Aeronautical Engineering**
- **Degree**: B.Tech Aerospace / Aeronautical Engineering (4 Years).
- **Core Curricula**: Aerodynamics (Compressible & Incompressible flow), Propulsion Systems (Gas Turbines, Rocket Engines, Scramjets), Aircraft Structures & Composites, Flight Mechanics & Orbital Trajectories, Avionics & Navigation Systems.
- **Top Career Destinations**: ISRO (VSSC, URSC, LPSC), DRDO, HAL, Skyroot Aerospace, Agnikul Cosmos, Pixxel, Boeing, Airbus, Rolls-Royce Aerospace.
- **Salary Benchmarks**: Scientist/Engineer-SC (ISRO/DRDO): ₹12 LPA – ₹16 LPA (Govt pay matrix Level 10) + housing/allowances; Private SpaceTech: ₹10 LPA – ₹28 LPA.
    `,
    suggestedPills: ["How to Join ISRO / DRDO", "Aerodynamics & Propulsion Fundamentals", "SpaceTech Startups in India"],
  },

  // --- MEDICAL & HEALTH SCIENCES ---
  {
    id: "kb_medical_mbbs",
    tags: ["medical", "mbbs", "doctor", "neet", "neet-ug", "neet-pg", "medicine", "surgery", "anatomy", "physiology", "pathology", "hospital"],
    title: "MBBS & Clinical Medical Sciences",
    category: "Medical",
    summary: "MBBS is a 5.5-year degree (4.5 years academic + 1 year compulsory rotatory internship) covering preclinical, paraclinical, and clinical medicine.",
    details: `
**MBBS (Bachelor of Medicine, Bachelor of Surgery)**
- **Duration**: 4.5 Years + 1 Year Mandatory Internship | **Admission**: NEET-UG.
- **Phase Breakdown**:
  - **Pre-Clinical (1st Prof)**: Human Anatomy (Dissection), Physiology, Biochemistry.
  - **Para-Clinical (2nd Prof)**: Pathology, Pharmacology, Microbiology, Forensic Medicine & Toxicology (FMT).
  - **Clinical (3rd & Final Prof)**: General Medicine, General Surgery, Pediatrics, Obstetrics & Gynecology (OB-GYN), Orthopedics, Ophthalmology, ENT, Dermatology, Psychiatry, Community Medicine (PSM).
- **Post-MBBS Pathways**:
  - **NEET-PG / INI-CET / NExT**: MD (Doctor of Medicine - Internal Medicine, Radiology, Pediatrics, Dermatology) or MS (Master of Surgery - Orthopedics, General Surgery, OB-GYN).
  - Super-Specialization: DM / MCh (Cardiology, Neurosurgery, Surgical Oncology).
- **Stipend & Earnings**:
  - PG Resident Doctor: ₹60,000 – ₹1,20,000 / month (depending on state/central hospital).
  - Consultant Specialist: ₹20 LPA – ₹65 LPA+ (private practice / multi-specialty hospital).
    `,
    suggestedPills: ["NEET-UG Exam Strategy & High-Yield Topics", "12-Lead ECG Clinical Diagnosis", "Pharmacology Drug Classifications", "Post-MBBS PG Specializations"],
  },
  {
    id: "kb_pharmacy_bds_allied",
    tags: ["bds", "dental", "pharmacy", "b.pharm", "pharm.d", "nursing", "physiotherapy", "bpt", "allied health", "biomedical"],
    title: "Dental (BDS), Pharmacy (B.Pharm/Pharm.D) & Allied Health",
    category: "Medical & Allied",
    summary: "Allied healthcare encompasses dental surgery, drug development & clinical pharmacology, rehabilitation physiotherapy, and diagnostic imaging.",
    details: `
**Allied Healthcare & Dental Programs**
1. **BDS (Dental Surgery - 5 Yrs)**: Oral Anatomy, Conservative Dentistry, Prosthodontics, Orthodontics, Oral & Maxillofacial Surgery. Top PG: MDS.
2. **Pharmacy (B.Pharm 4 Yrs / Pharm.D 6 Yrs)**: Medicinal Chemistry, Pharmacognosy, Biopharmaceutics, Clinical Trials & Drug Formulation. Top Roles: Pharmacovigilance, Regulatory Affairs, R&D Scientist (Sun Pharma, Dr. Reddy's, Pfizer).
3. **Physiotherapy (BPT 4.5 Yrs)**: Musculoskeletal, Neurological, Sports Rehabilitation, Cardiorespiratory Physiotherapy. Top PG: MPT.
4. **B.Sc Nursing & Allied Tech**: Clinical Intensive Care, Medical Laboratory Technology (BMLT), Radiology Imaging Tech (BMIT).
    `,
    suggestedPills: ["Pharm.D vs B.Pharm Career Comparison", "Physiotherapy (BPT) Setup & Clinic Guide", "Top Clinical Research Organizations (CROs)"],
  },

  // --- COMMERCE, MANAGEMENT & LAW ---
  {
    id: "kb_commerce_finance",
    tags: ["commerce", "b.com", "bba", "ca", "chartered accountant", "cma", "cs", "cfa", "finance", "investment banking", "fintech", "stock market", "mba", "cat"],
    title: "Commerce, Chartered Accountancy (CA) & Investment Banking",
    category: "Commerce & Finance",
    summary: "Comprehensive guide to corporate finance, equity research, auditing, taxation, Chartered Accountancy, and IIM MBA admissions.",
    details: `
**Commerce, CA & Financial Leadership**
- **Professional Accreditations**:
  1. **Chartered Accountancy (ICAI CA)**: Foundation → Intermediate (Both Groups) → 2-Year Articleship → CA Final. Highest authority on Audit, Direct/Indirect Taxation (GST), and Corporate Financial Reporting.
  2. **CFA (Chartered Financial Analyst)**: Global gold standard for Portfolio Management, Equity Research, Fixed Income, and Hedge Funds.
  3. **MBA (IIMs / Top B-Schools)**: CAT exam (99+ percentile for IIM Ahmedabad, Bangalore, Calcutta). Post-MBA roles: Management Consulting (McKinsey, BCG, Bain), Investment Banking (Morgan Stanley, JP Morgan), Product Management.
- **Salary Benchmarks**:
  - Fresh Chartered Accountant (Rank Holders / Big 4): ₹11 LPA – ₹26 LPA.
  - IIM A/B/C MBA Graduates: ₹28 LPA – ₹55 LPA+.
    `,
    suggestedPills: ["CA Foundation to Final Roadmap", "How to Crack CAT with 99+ Percentile", "Investment Banking Career Blueprint", "CFA vs MBA Finance Comparison"],
  },
  {
    id: "kb_law_upsc",
    tags: ["law", "clat", "llb", "ba llb", "corporate law", "lawyer", "advocate", "upsc", "civil services", "ias", "ips", "judiciary"],
    title: "Law (5-Year Integrated LLB), Judiciary & UPSC Civil Services",
    category: "Law & Public Policy",
    summary: "Explores 5-Year Integrated Law (National Law Universities via CLAT), Corporate Mergers & Acquisitions, Criminal Litigation, and UPSC IAS/IPS examination.",
    details: `
**Law (NLUs / CLAT) & Civil Services (UPSC)**
- **5-Year Integrated BA/BBA LLB (via CLAT / AILET)**:
  - Top Institutions: NLSIU Bengaluru, NALSAR Hyderabad, WBNUJS Kolkata, NLU Delhi.
  - Practice Areas: Corporate Law (M&A, Private Equity, Capital Markets), Intellectual Property Rights (IPR & Patents), Arbitration & Dispute Resolution, Criminal & Constitutional Litigation.
  - Tier-1 Law Firm Salaries (Shardul Amarchand, Cyril Amarchand, Khaitan & Co, Trilegal): ₹16 LPA – ₹22 LPA starting package.
- **UPSC Civil Services Examination (IAS / IPS / IFS / IRS)**:
  - 3-Stage Selection: Prelims (GS + CSAT) → Mains (9 Written Subjective Papers) → Personality Test (Interview).
  - Career: District Magistrate (DM), Superintendent of Police (SP), Diplomatic Ambassador (IFS).
    `,
    suggestedPills: ["CLAT Preparation Blueprint", "Corporate Law vs Litigation Comparison", "UPSC CSE 1-Year Integrated Study Plan"],
  },

  // --- COMPETITIVE EXAM BLUEPRINTS ---
  {
    id: "kb_exam_jee_neet_gate",
    tags: ["jee", "jee main", "jee advanced", "neet", "gate", "cat", "clat", "exam", "cutoff", "strategy", "syllabus", "test", "marks"],
    title: "National Competitive Exam Blueprints & Strategic Scoring",
    category: "Competitive Exams",
    summary: "Strategic preparation frameworks, weightage analysis, and revision cadence for JEE, NEET, GATE, CAT, and CLAT.",
    details: `
**National Entrance Exam Strategy Guide**
1. **JEE Main & Advanced (Engineering)**:
   - Physics: Mechanics (Rotational, Gravitation), Electrodynamics, Modern Physics, Optics.
   - Chemistry: Physical (Thermodynamics, Equilibrium), Organic (Mechanisms, Named Reactions), Inorganic (Coordination Compounds, Chemical Bonding).
   - Mathematics: Calculus (Definite Integrals, Differential Equations), Coordinate Geometry, Vectors & 3D, Probability.
2. **NEET-UG (Medical 720 Marks)**:
   - Biology (360/720): 100% NCERT line-by-line mastery (Genetics, Human Physiology, Ecology, Cell Biology).
   - Physics (180/720): Formula retention, daily 45-min numerical speed drills.
   - Chemistry (180/720): NCERT Exemplar & Organic mechanisms.
3. **GATE (Graduate Aptitude Test in Engineering - 100 Marks)**:
   - Opens Direct PSU Recruitment (ONGC, IOCL, NTPC, BHEL) and M.Tech / Direct PhD admissions at IISc & IITs.
4. **CAT (Common Admission Test - 198 Marks)**:
   - Sectional split: VARC (Reading Comprehension), DILR (Data Interpretation & Logical Reasoning), QA (Quantitative Aptitude).
    `,
    suggestedPills: ["JEE Main Marks vs Percentile Table", "NEET Biology 350+ Score Strategy", "GATE General Aptitude Shortcuts", "CAT Sectional Time Management"],
  },

  // --- SCIENTIFIC & TECHNICAL CONCEPTS TUTOR (SMART TUTOR) ---
  {
    id: "kb_concept_transformer_attention",
    tags: ["transformer", "self-attention", "attention", "transformer architecture", "llm architecture", "q k v", "scaled dot product", "bert", "gpt"],
    title: "Deep Deconstruction: Transformer Scaled Dot-Product Self-Attention",
    category: "Computer Science & AI",
    summary: "Mathematical breakdown and visual intuition of the Transformer Self-Attention mechanism.",
    details: `
### 🧠 Deep Dive: Transformer Scaled Dot-Product Self-Attention

In modern Foundation Models (GPT-4, Gemini, Claude, LLaMA), **Self-Attention** allows every token in an input sequence to dynamically compare itself with every other token.

#### 1. Mathematical Formulation:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

Where:
- **$Q$ (Query)**: What the current token is seeking representation for ($N \\times d_k$).
- **$K$ (Key)**: What each token represents in the context window ($M \\times d_k$).
- **$V$ (Value)**: The actual semantic feature payload ($M \\times d_v$).
- **$\\sqrt{d_k}$ Scaling Factor**: Prevents the dot products from growing excessively large for high dimensions, which would cause the $\\text{softmax}$ gradient to vanishingly saturate!

#### 2. Step-by-Step Computational Workflow:
1. **Projection**: Input embeddings $X$ are multiplied by weight matrices $W_Q, W_K, W_V$.
2. **Similarity Scoring**: Compute raw attention logits $S = Q K^T$.
3. **Scaling & Normalization**: Scale by $\\frac{1}{\\sqrt{d_k}}$ and apply $\\text{softmax}$ row-wise across columns.
4. **Context Aggregation**: Multiply normalized probability weights by Value matrix $V$.

#### 3. Why Multi-Head Attention (MHA)?
Single attention averages different linguistic features. Multi-Head Attention runs $h$ independent attention projections in parallel subspaces (e.g., Head 1 tracks grammatical syntax, Head 2 tracks entity co-reference, Head 3 tracks factual verbs).
    `,
    suggestedPills: ["Explain RAG Architecture", "Explain Loss Functions in Deep Learning", "Difference between Encoder-only vs Decoder-only LLMs"],
  },
  {
    id: "kb_concept_ecg_stemi",
    tags: ["ecg", "stemi", "12-lead ecg", "cardiology", "infarction", "myocardial", "heart attack", "leads", "st elevation"],
    title: "Clinical Cardiology: 12-Lead ECG STEMI Localization Protocol",
    category: "Medical Sciences",
    summary: "Systematic protocol for diagnosing and localizing Acute ST-Elevation Myocardial Infarction on a 12-Lead Electrocardiogram.",
    details: `
### 🩺 Clinical Protocol: 12-Lead ECG STEMI Localization

An **Acute ST-Elevation Myocardial Infarction (STEMI)** is diagnosed on a 12-lead ECG when there is new $\\ge 1\\text{ mm}$ ($0.1\\text{ mV}$) ST-segment elevation in $\\ge 2$ anatomically contiguous leads (or $\\ge 2\\text{ mm}$ in leads V2–V3 in men).

#### 🗺️ Anatomical Localization Matrix:
| Coronary Artery | Affected Wall | Primary Diagnostic ECG Leads | Reciprocal ST Depression Leads |
| :--- | :--- | :--- | :--- |
| **LAD** (Left Anterior Descending) | **Anterior / Septal** | **V1, V2, V3, V4** | Leads II, III, aVF (Inferior) |
| **RCA** (Right Coronary Artery) | **Inferior Wall** | **Leads II, III, aVF** | Leads I, aVL (High Lateral) |
| **LCx** (Left Circumflex Artery) | **Lateral Wall** | **Leads I, aVL, V5, V6** | Leads II, III, aVF |
| **RCA / LCx (Posterior)** | **Posterior Wall** | **Tall R wave & ST depression in V1-V3** (Confirm with posterior leads V7, V8, V9) | V1, V2, V3 (Reciprocal) |

#### ⚠️ Immediate Emergency Protocol (MONA / D2B):
1. Immediate high-flow Oxygen if $SpO_2 < 90\\%$.
2. Chewable Aspirin ($300\\text{ mg}$) + P2Y12 inhibitor (Clopidogrel / Ticagrelor).
3. Sublingual Nitroglycerin (contraindicated if Right Ventricular STEMI or SBP $< 90$).
4. Rapid transfer to Cath Lab for **Primary PCI (Door-to-Balloon Time $< 90\\text{ min}$)** or thrombolysis (Alteplase/Tenecteplase) within $30\\text{ min}$ if PCI unavailable.
    `,
    suggestedPills: ["Cardiology Pharmacology (Antiplatelets & Statins)", "Explain Cardiac Action Potential", "NEET-PG Cardiology High-Yield MCQs"],
  },
  {
    id: "kb_concept_dsa_big_o",
    tags: ["dsa", "algorithms", "data structures", "big o", "time complexity", "dynamic programming", "graphs", "sorting", "binary search"],
    title: "Mastering Data Structures, Algorithms & Big-O Computational Complexity",
    category: "Computer Science",
    summary: "Systematic mastery guide for Data Structures & Algorithms, Big-O asymptotic notation, and competitive coding patterns.",
    details: `
### 💻 DSA & Algorithmic Complexity Mastery

#### 📊 Essential Time Complexities Cheat Sheet:
- **$O(1)$ Constant Time**: Hash Map lookup (\`Map.get()\`), Array indexing, Stack push/pop.
- **$O(\\log N)$ Logarithmic Time**: Binary Search on sorted arrays, Balanced Binary Search Tree (AVL/Red-Black) operations.
- **$O(N)$ Linear Time**: Single array traversal, Linear Search, Sliding Window.
- **$O(N \\log N)$ Linearithmic Time**: Merge Sort, Quick Sort (average), Heap Sort.
- **$O(N^2)$ Quadratic Time**: Nested loops, Bubble/Insertion Sort, Matrix multiplication (naive).
- **$O(2^N)$ Exponential Time**: Recursive Fibonacci, Subset generation (Power Set).

#### 🎯 Top 6 Interview Problem Patterns:
1. **Two Pointers & Sliding Window**: Longest Substring Without Repeating Characters, 3Sum.
2. **Fast & Slow Pointers (Floyd's Cycle)**: Detect cycle in linked list.
3. **Breadth-First Search (BFS) & Depth-First Search (DFS)**: Shortest path in unweighted grid, Connected components.
4. **Dynamic Programming (DP)**: 0/1 Knapsack, Longest Common Subsequence (LCS), Edit Distance.
5. **Monotonic Stack / Queue**: Next Greater Element, Daily Temperatures.
6. **Topological Sort (Kahn's Algorithm)**: Course Schedule dependency resolution.
    `,
    suggestedPills: ["Dynamic Programming (0/1 Knapsack Walkthrough)", "Graph Shortest Path (Dijkstra vs Bellman-Ford)", "Top 50 LeetCode Patterns"],
  },

  // --- BACKLOX PLATFORM & SUBSCRIPTION ---
  {
    id: "kb_platform_pricing_drm",
    tags: ["price", "pricing", "cost", "11", "rs", "rupees", "pro", "razorpay", "subscription", "buy", "pay", "upgrade", "offer", "discount", "drm", "watermark"],
    title: "Backlox Platform: ₹11 Early Bird Launch Offer & Razorpay Checkout",
    category: "Platform",
    summary: "Platform features, live ₹11 Razorpay checkout, 30-day session persistence, and DRM anti-piracy protections.",
    details: `
### 🌟 Backlox Platform Architecture & Launch Offer

1. **⚡ ₹11 Early Bird Special Launch Offer (First 100 Scholars)**:
   - Upgrades your scholar account to **Backlox Pro Lifetime Access** for just **₹11** (Regular price: ~~₹499~~).
   - **What's Unlocked**:
     - Complete 4-Year Academic Roadmaps & Syllabus Modules across 35+ branches.
     - Unlimited MCQ Practice Gym with instantaneous step-by-step diagnostic feedback.
     - Verified Course Masterclasses, Timestamped Lecture Notes & AI Summaries.
     - Verified Course Completion Certificates.
2. **💳 Razorpay Live Payment Gateway**:
   - Integrated with Live Merchant Keys (\`rzp_live_TWISVATsIVf97e\`).
   - Supports 1-Click Instant UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking, Debit/Credit Cards.
   - Payouts settle directly to your designated bank account with zero intermediary delay.
3. **🔒 DRM Protection & Content Security**:
   - Dynamic real-time student ID watermarking on video streams.
   - Intelligent keyboard interception blocking unauthorized screen recording and inspector tools.
   - Secure HTTPS SSL encryption across \`https://backlox.site\`.
    `,
    suggestedPills: ["Claim ₹11 Early Bird Pro Offer", "How to Start Practice Gym Test", "Explore 35+ Engineering Branches", "Browse Medical Universe"],
  }
];

// ==========================================
// 2. SEMANTIC RETRIEVAL & INTENT CLASSIFICATION
// ==========================================

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function calculateRelevanceScore(queryTokens, kbItem) {
  let score = 0;
  const itemText = `${kbItem.title} ${kbItem.tags.join(" ")} ${kbItem.summary} ${kbItem.details}`.toLowerCase();

  for (const token of queryTokens) {
    // Exact tag match (highest weight)
    if (kbItem.tags.includes(token)) {
      score += 15;
    }
    // Title match
    if (kbItem.title.toLowerCase().includes(token)) {
      score += 10;
    }
    // Tag substring
    for (const tag of kbItem.tags) {
      if (tag.includes(token) || token.includes(tag)) {
        score += 6;
      }
    }
    // Body text frequency
    const regex = new RegExp(`\\b${token}\\b`, "g");
    const matches = itemText.match(regex);
    if (matches) {
      score += Math.min(8, matches.length * 2);
    }
  }

  return score;
}

function retrieveRelevantDocuments(query, topK = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return [KNOWLEDGE_BASE[0]];
  }

  const scored = KNOWLEDGE_BASE.map((doc) => ({
    doc,
    score: calculateRelevanceScore(queryTokens, doc),
  }));

  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.doc);
  return relevant.length > 0 ? relevant : [KNOWLEDGE_BASE[0]];
}

// ==========================================
// 3. DYNAMIC RAG SYNTHESIS (SMART ADVISOR GENERATOR)
// ==========================================

function generateDynamicRAGReply(query, history = []) {
  const q = query.trim();
  const qLower = q.toLowerCase();
  const retrievedDocs = retrieveRelevantDocuments(q, 3);
  const primaryDoc = retrievedDocs[0];

  // Specific dynamic response builders based on contextual query analysis
  let reply = "";
  let suggestedPills = [];

  // Check if query is greeting / introductory
  if (/^(hi|hello|hey|greetings|namaste|good morning|good afternoon|good evening|yo)\b/i.test(qLower) && qLower.length < 25) {
    reply = `👋 **Hello Scholar! Welcome to Backlox Universe!** 🎓\n\nI am **Octi**, your intelligent academic advisor, technical tutor, and career mentor.\n\nHere is how I can assist your journey right now:\n- 🚀 **Explore High-Demand Pathways**: Compare 35+ Engineering Branches, Medical Sciences, Commerce/CA, and Law.\n- 🔬 **Concept Deep Dives**: Ask me to deconstruct topics like *Transformer Self-Attention*, *12-Lead ECG STEMI*, *Big-O Algorithms*, *Thermodynamics*, or *VLSI Design*.\n- 🏆 **Exam Strategy**: Get high-yield study plans for **JEE Main/Advanced, NEET, GATE, CAT, and CLAT**.\n- 💳 **Launch Special**: Upgrade to Backlox Pro Lifetime for just **₹11** (First 100 Scholars offer)!\n\nWhat topic would you like to explore today?`;
    suggestedPills = [
      "Recommend best stream after 12th",
      "Explain Transformer Self-Attention",
      "How to crack GATE / NEET exam",
      "Claim ₹11 Launch Offer via Razorpay",
    ];
    return { reply, suggestedPills, sources: [primaryDoc.title] };
  }

  // Check for salary / CTC comparisons
  if (qLower.includes("salary") || qLower.includes("ctc") || qLower.includes("package") || qLower.includes("placement") || qLower.includes("earn") || qLower.includes("highest paying")) {
    reply = `💼 **Career CTC & Salary Benchmarks (2026 Telemetry)**\n\nHere is the verified compensation breakdown across leading technical and medical sectors in India:\n\n| Domain / Branch | Tier-1 Avg CTC (IITs/AIIMS/IIMs) | Tier-2/3 Avg CTC | Top Product / Hospital Pay | Key Recruiters |\n| :--- | :--- | :--- | :--- | :--- |\n| **AI & Data Science** | ₹22 LPA – ₹52 LPA | ₹8 LPA – ₹16 LPA | ₹80 LPA+ (US: $180k+) | Google DeepMind, OpenAI, Uber, Atlassian |\n| **Computer Science (CSE)** | ₹18 LPA – ₹48 LPA | ₹6 LPA – ₹14 LPA | ₹1.2 Cr+ (International) | Microsoft, Amazon, Adobe, Goldman Sachs |\n| **VLSI & Semiconductor (ECE)**| ₹16 LPA – ₹38 LPA | ₹6.5 LPA – ₹13 LPA | ₹45 LPA+ | NVIDIA, Qualcomm, Intel, AMD, TI |\n| **MBBS Specialist (MD/MS)** | ₹18 LPA – ₹36 LPA | ₹12 LPA – ₹20 LPA | ₹60 LPA+ (Consultant) | Apollo Hospitals, Fortis, Max, AIIMS Faculty |\n| **Electric Vehicles & Robotics**| ₹12 LPA – ₹28 LPA | ₹5.5 LPA – ₹11 LPA | ₹35 LPA+ | Tesla, Ather Energy, Tata Motors, Bosch |\n| **Investment Banking & CA** | ₹25 LPA – ₹55 LPA | ₹10 LPA – ₹18 LPA | ₹1.5 Cr+ (Front Office) | JP Morgan, Morgan Stanley, McKinsey, BCG |\n\n💡 *Pro-Tip*: Top compensation is strongly correlated with building demonstrable portfolio capstones, open-source contributions, and verified certifications!`;
    suggestedPills = ["Explore High-Growth CSE Roadmap", "How to prepare for FAANG Placements", "Compare VLSI vs Software Salaries"];
    return { reply, suggestedPills, sources: ["Career & Salary Telemetry Index"] };
  }

  // Check for pricing / ₹11 launch offer
  if (qLower.includes("11") || qLower.includes("price") || qLower.includes("cost") || qLower.includes("pro") || qLower.includes("buy") || qLower.includes("pay") || qLower.includes("offer") || qLower.includes("razorpay")) {
    reply = `⚡ **Backlox Pro Early Bird Launch Offer (First 100 Scholars)**\n\n- **Special Price**: **₹11.00** *(Regular: ~~₹499~~)*\n- **Access**: Lifetime Unlimited Access to all 35+ branches, roadmaps, course masterclasses, and verified certifications.\n- **Payment Method**: Live Razorpay Checkout via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking.\n- **Bank Settlement**: 100% verified live merchant credentials depositing securely directly to your registered bank account!\n\n👉 *To upgrade*: Click **"Upgrade to Pro"** on your dashboard or click the banner **"Claim ₹11 Launch Offer via Razorpay"**!`;
    suggestedPills = ["Open Subscription Modal", "View Course Catalog", "Practice MCQ Test Gym"];
    return { reply, suggestedPills, sources: [primaryDoc.title] };
  }

  // General Synthesis: Formulate dynamic answer using RAG retrieved documents
  reply = `### 🎓 **Octi Academic Intelligence**: ${primaryDoc.title}\n\n${primaryDoc.details.trim()}\n\n`;

  // If secondary document is relevant, attach complementary insights
  if (retrievedDocs.length > 1 && retrievedDocs[1].id !== primaryDoc.id) {
    const sec = retrievedDocs[1];
    reply += `\n---\n#### 🔍 Complementary Pathway Insights: **${sec.title}**\n${sec.summary}\n`;
  }

  reply += `\n\n💡 *Need personalized guidance?* Tell me your current grade/semester or target goal, and I'll generate a tailored milestone checklist!`;

  suggestedPills = primaryDoc.suggestedPills || [
    "Recommend best stream for me",
    "View 4-Year Semester Roadmap",
    "Practice Aptitude Gym MCQs",
  ];

  return {
    reply,
    suggestedPills,
    sources: retrievedDocs.map((d) => d.title),
  };
}

module.exports = {
  KNOWLEDGE_BASE,
  retrieveRelevantDocuments,
  generateDynamicRAGReply,
};
