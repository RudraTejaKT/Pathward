// Robust Client-Side Fallback Data Layer for Engineering & Medical Universes
// Prevents blank screens even if backend network request is delayed or offline

export const FALLBACK_BRANCHES = [
  // --- ENGINEERING BRANCHES ---
  {
    id: "cse",
    streamId: "engineering",
    name: "Computer Science & Engineering",
    short: "CSE",
    demand: "Very High",
    tagline: "Software, algorithms, and systems — the broadest IT entry point",
    coreFocus: ["Programming", "Data Structures", "Systems", "Software Engineering"],
  },
  {
    id: "it",
    streamId: "engineering",
    name: "Information Technology",
    short: "IT",
    demand: "High",
    tagline: "Applied computing — networks, databases, and enterprise software",
    coreFocus: ["Networking", "Databases", "Web Development", "Cloud Infra"],
  },
  {
    id: "aids",
    streamId: "engineering",
    name: "AI & Data Science",
    short: "AI & DS",
    demand: "Very High",
    tagline: "Machine learning, statistics, and data-driven systems",
    coreFocus: ["Statistics", "Machine Learning", "Data Engineering", "Deep Learning"],
  },
  {
    id: "ece",
    streamId: "engineering",
    name: "Electronics & Communication",
    short: "ECE",
    demand: "High",
    tagline: "Hardware-software bridge: VLSI, embedded systems, and signals",
    coreFocus: ["Circuits", "Signals", "VLSI Design", "Embedded Systems"],
  },
  {
    id: "mech",
    streamId: "engineering",
    name: "Mechanical Engineering",
    short: "MECH",
    demand: "Moderate",
    tagline: "Machines, thermodynamics, design, and robotics",
    coreFocus: ["Mechanics", "Thermodynamics", "CAD/CAM", "Manufacturing"],
  },
  {
    id: "civil",
    streamId: "engineering",
    name: "Civil Engineering",
    short: "CIVIL",
    demand: "Moderate",
    tagline: "Structures, infrastructure, transportation, and sustainability",
    coreFocus: ["Structural Design", "Geotechnical", "Transportation", "Surveying"],
  },

  // --- MEDICAL & HEALTH SCIENCE BRANCHES ---
  {
    id: "mbbs",
    streamId: "medical",
    name: "MBBS (Bachelor of Medicine & Surgery)",
    short: "MBBS",
    demand: "Very High",
    tagline: "4.5 Yrs + 1 Yr Rotatory Internship in Hospital Wards",
    coreFocus: ["Anatomy & Physiology", "Pathology & Pharma", "General Medicine", "Surgery & OBGYN"],
  },
  {
    id: "bds",
    streamId: "medical",
    name: "BDS (Dental Surgery & Maxillofacial)",
    short: "BDS",
    demand: "High",
    tagline: "4 Yrs + 1 Yr Rotatory Internship in Dental Clinics",
    coreFocus: ["Oral Anatomy", "Conservative Dentistry", "Orthodontics", "Oral Surgery"],
  },
  {
    id: "ayush",
    streamId: "medical",
    name: "AYUSH (Ayurveda, Homeopathy, Unani)",
    short: "BAMS / BHMS",
    demand: "Moderate",
    tagline: "Traditional Indian & Integrative Medicine Systems",
    coreFocus: ["Kriya Sharir", "Dravyaguna", "Panchakarma", "Herbal Pharmacology"],
  },
  {
    id: "pharm",
    streamId: "medical",
    name: "Pharmacy (B.Pharm / Pharm.D)",
    short: "B.Pharm / Pharm.D",
    demand: "High",
    tagline: "Pharmaceutical Sciences, Drug Formulation & Clinical Trials",
    coreFocus: ["Medicinal Chemistry", "Pharmaceutics", "Pharmacology", "Regulatory Affairs"],
  },
  {
    id: "nursing",
    streamId: "medical",
    name: "B.Sc Nursing (Critical & Perioperative)",
    short: "B.Sc Nursing",
    demand: "Very High",
    tagline: "Patient Care, Critical ICU Management & Clinical Protocols",
    coreFocus: ["Medical-Surgical Nursing", "Pediatrics & OBG", "Community Health", "Critical ICU"],
  },
  {
    id: "allied",
    streamId: "medical",
    name: "Physiotherapy & Allied Health (BPT / BMLT)",
    short: "BPT / Allied Health",
    demand: "High",
    tagline: "Rehabilitation, Medical Lab Tech & Radiology Imaging",
    coreFocus: ["Biomechanics & Kinesiology", "Orthopedic Rehab", "Neurological Rehab", "Radiology / MLT"],
  },
  {
    id: "medical-pg",
    streamId: "medical",
    name: "Post-MBBS Medical Specializations (MD / MS / DNB)",
    short: "MD / MS Residency",
    demand: "Very High",
    tagline: "Clinical Residency, Super-Specialty DM/MCh & Fellowship",
    coreFocus: ["Cardiology / Neurology", "General Surgery", "Radiodiagnosis", "Pediatrics / OBGYN"],
  },
];

export function getFallbackBranchDetail(branchId) {
  const branch = FALLBACK_BRANCHES.find((b) => b.id === branchId) || FALLBACK_BRANCHES[0];
  const isMedical = branch.streamId === "medical";

  return {
    branch,
    roadmap: [
      {
        stage: isMedical ? "Prof 1: Pre-Clinical Foundations" : "Year 1: Core Engineering Foundations",
        description: isMedical
          ? "Master Human Anatomy dissection, Physiology homeostasis, and Medical Biochemistry."
          : "Master Mathematics, C/C++ Programming, Data Structures, and basic electronics.",
        items: [
          { title: isMedical ? "Gross Anatomy & Histology" : "Data Structures & Algorithms", tags: ["Essential", "Core"] },
          { title: isMedical ? "Medical Physiology & Blood Gas" : "Computer Systems & OS", tags: ["Foundational"] },
          { title: isMedical ? "Metabolism & Clinical Enzymology" : "Object Oriented Design (Java/C++)", tags: ["Practical"] },
        ],
      },
      {
        stage: isMedical ? "Prof 2: Para-Clinical & Pharmacology" : "Year 2: Architecture & Scalable Systems",
        description: isMedical
          ? "Deep dive into Pathology, Medical Microbiology, and Pharmacotherapy mechanisms."
          : "Dive into Database Management, Operating Systems, Computer Networks, and Full-Stack Engineering.",
        items: [
          { title: isMedical ? "General & Systemic Pathology" : "Relational & NoSQL Databases", tags: ["Critical"] },
          { title: isMedical ? "Antimicrobial & Autonomic Pharma" : "Distributed Networks & API Gateways", tags: ["Core"] },
          { title: isMedical ? "Clinical Bacteriology & Virology" : "Modern Web Frameworks (React/Node)", tags: ["Hands-On"] },
        ],
      },
      {
        stage: isMedical ? "Prof 3: Clinical Postings & Diagnostics" : "Year 3: Advanced Specialization & AI",
        description: isMedical
          ? "Daily hospital OPD/IPD ward rounds in Internal Medicine, General Surgery, and Pediatrics."
          : "Specialized streams: Machine Learning, Cloud Architecture, DevOps CI/CD, and Security.",
        items: [
          { title: isMedical ? "Clinical Case Workup & ECG" : "Machine Learning & Deep Learning", tags: ["Advanced"] },
          { title: isMedical ? "Surgical Suturing & Trauma Audit" : "Cloud Microservices & Kubernetes", tags: ["Applied"] },
          { title: isMedical ? "Community Health & Epidemiology" : "System Design & Scalability", tags: ["Industry Standard"] },
        ],
      },
      {
        stage: isMedical ? "Internship: Rotatory Hospital Residency" : "Year 4: Capstone & Industry Placement",
        description: isMedical
          ? "Hands-on Casualty/Emergency, ICU management, Labor Room, and preparation for NEET PG / USMLE."
          : "Enterprise capstone project, open-source contributions, technical interviews, and placements.",
        items: [
          { title: isMedical ? "Emergency Triage & CPR / ACLS" : "Enterprise Full-Stack Capstone", tags: ["Capstone"] },
          { title: isMedical ? "NEET PG High-Yield Systemic Review" : "System Design & Mock Coding Audits", tags: ["Placement Ready"] },
        ],
      },
    ],
    projects: [
      {
        title: isMedical ? "Clinical Audit: 12-Lead ECG Ischemic Localization" : "Distributed Real-Time Scalable Message Broker",
        description: isMedical
          ? "Audit 50 clinical ECG strips identifying acute STEMI patterns, reciprocal ST depression, and arrhythmia triggers."
          : "Build an event-driven pub-sub queue in Go/Node with persistent WAL logs, consumer offsets, and idempotent deliveries.",
        difficulty: "Advanced",
      },
      {
        title: isMedical ? "Antimicrobial Stewardship & Resistant Culture Audit" : "AI Medical Imaging Classifier with ResNet & Grad-CAM",
        description: isMedical
          ? "Survey hospital microbiological antibiograms and draft evidence-based empirical therapy guidelines."
          : "Fine-tune a deep CNN on NIH Chest X-Ray dataset with Grad-CAM visual heatmaps for pulmonary consolidations.",
        difficulty: "Intermediate",
      },
      {
        title: isMedical ? "Pharmacovigilance Adverse Drug Event (ADE) Case Series" : "Full-Stack Collaborative LMS & Code Sandbox",
        description: isMedical
          ? "Analyze drug-drug interactions in multi-morbid hypertensive diabetic patients with renal impairment."
          : "Multi-tenant workspace with Monaco code editor, WebAssembly sandbox execution, and live peer chat.",
        difficulty: "Intermediate",
      },
    ],
    jobs: [
      {
        role: isMedical ? "Resident Medical Officer / Junior Doctor" : "Software Development Engineer (SDE-1 / SDE-2)",
        salary: isMedical ? "₹10–18 LPA" : "₹14–32 LPA",
        topHiring: isMedical ? "Apollo, Fortis, Max, AIIMS, Manipal" : "Google, Microsoft, Amazon, Uber, Atlassian",
      },
      {
        role: isMedical ? "Clinical Specialist / MD Resident" : "AI Systems & Machine Learning Engineer",
        salary: isMedical ? "₹18–35 LPA" : "₹18–40 LPA",
        topHiring: isMedical ? "Govt Medical Colleges, Tertiary Care Hospitals" : "NVIDIA, OpenAI, Meta, Databricks, Microsoft AI",
      },
      {
        role: isMedical ? "Medical Research & Clinical Trials Scientist" : "Cloud & Distributed Systems Architect",
        salary: isMedical ? "₹15–28 LPA" : "₹22–50 LPA",
        topHiring: isMedical ? "Novartis, Pfizer, AstraZeneca, ICMR" : "AWS, Google Cloud, Azure, Stripe, Netflix",
      },
    ],
  };
}
