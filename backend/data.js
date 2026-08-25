// Expanded Multi-Stream & Medical Science Universe Data Layer
// Backs all roadmaps, project ideas, clinical audits, and career paths across
// Engineering, Medical & Health Sciences, Commerce, Arts/Law, and Vocational routes.

const streams = [
  {
    id: "engineering",
    name: "Engineering & Technology",
    tagline: "Build the systems, machines, and software that run the world",
    description:
      "A 4-year degree (B.E./B.Tech) focused on software engineering, artificial intelligence, electronics, robotics, and smart infrastructure.",
    avgDuration: "4 years",
    available: true,
    route: "/engineering",
    badge: "6 Branches Active"
  },
  {
    id: "medical",
    name: "Medical & Health Sciences",
    tagline: "Diagnose, treat, cure, and advance human healthcare",
    description:
      "MBBS, Dental Surgery (BDS), AYUSH, Pharmacy, B.Sc Nursing, Physiotherapy (BPT), Allied Health, and Post-MBBS Medical PG specializations.",
    avgDuration: "4.5–5.5 years",
    available: true,
    route: "/medical",
    badge: "7 Pathways Active"
  },
  {
    id: "commerce",
    name: "Commerce, Finance & Management",
    tagline: "Understand capital markets, corporate strategy, and business leadership",
    description: "B.Com (Hons), BBA/BMS, Chartered Accountancy (CA), CMA, CS, Investment Banking, and FinTech pathways.",
    avgDuration: "3–4 years",
    available: true,
    route: "/learn#commerce",
    badge: "Modules Open"
  },
  {
    id: "design",
    name: "Design, Architecture & Media",
    tagline: "Shape how digital interfaces, physical spaces, and media look and feel",
    description: "B.Des (UI/UX, Product, Communication Design), B.Arch (Architecture), Animation, and Creative Arts.",
    avgDuration: "4–5 years",
    available: true,
    route: "/learn#arts",
    badge: "Modules Open"
  },
  {
    id: "arts",
    name: "Law, Humanities & Public Policy",
    tagline: "Defend justice, analyze human society, and shape public governance",
    description: "5-Year Integrated BA/BBA LLB, Psychology, Economics, Journalism, Civil Services, and International Relations.",
    avgDuration: "3–5 years",
    available: true,
    route: "/learn#arts",
    badge: "Modules Open"
  },
  {
    id: "vocational",
    name: "Vocational & Applied Technology",
    tagline: "Hands-on industrial trades, technical specializations, and rapid employment",
    description: "Polytechnic Engineering Diplomas, B.Voc (Applied Tech, Healthcare, Hospitality), and Industry Apprenticeships.",
    avgDuration: "1–3 years",
    available: true,
    route: "/learn#vocational",
    badge: "Modules Open"
  }
];

const branches = [
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
    tagline: "Hardware, embedded systems, and signal processing",
    coreFocus: ["Circuits", "Embedded Systems", "VLSI", "Communication Systems"],
  },
  {
    id: "mech",
    streamId: "engineering",
    name: "Mechanical Engineering",
    short: "Mech",
    demand: "Moderate",
    tagline: "Design and build physical machines, robotics, and thermal systems",
    coreFocus: ["Thermodynamics", "CAD/CAM", "Robotics", "Manufacturing"],
  },
  {
    id: "civil",
    streamId: "engineering",
    name: "Civil Engineering",
    short: "Civil",
    demand: "Moderate",
    tagline: "Design and construct infrastructure — buildings, roads, smart cities",
    coreFocus: ["Structural Design", "Construction Tech", "Surveying", "Urban Planning"],
  },

  // --- MEDICAL & HEALTH SCIENCES BRANCHES ---
  {
    id: "mbbs",
    streamId: "medical",
    name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)",
    short: "MBBS",
    demand: "Very High",
    tagline: "The premier clinical medical degree in India covering pre-clinical, para-clinical & clinical practice",
    coreFocus: ["Clinical Diagnosis", "Pharmacology & Pathology", "Surgery & Internal Medicine", "Rotatory Internship"],
  },
  {
    id: "bds",
    streamId: "medical",
    name: "BDS (Bachelor of Dental Surgery)",
    short: "BDS",
    demand: "High",
    tagline: "Oral healthcare, maxillo-facial diagnostics, orthodontic restoration, and dental surgery",
    coreFocus: ["Oral Anatomy", "Prosthodontics & Orthodontics", "Conservative Dentistry", "Oral & Maxillofacial Surgery"],
  },
  {
    id: "ayush",
    streamId: "medical",
    name: "AYUSH (BAMS / BHMS / BNYS)",
    short: "AYUSH",
    demand: "High",
    tagline: "Holistic Indian systems of medicine — Ayurveda, Homeopathy, Naturopathy & Yoga sciences",
    coreFocus: ["Ayurvedic Pharmacology", "Dravyaguna & Rasashastra", "Homeopathic Materia Medica", "Integrative Wellness"],
  },
  {
    id: "pharm",
    streamId: "medical",
    name: "Pharmacy (B.Pharm & Pharm.D)",
    short: "Pharmacy",
    demand: "Very High",
    tagline: "Drug formulation, pharmaceutical chemistry, clinical trials, and pharmacotherapy",
    coreFocus: ["Pharmaceutics", "Medicinal Chemistry", "Pharmacokinetics", "Clinical Drug Safety"],
  },
  {
    id: "nursing",
    streamId: "medical",
    name: "B.Sc Nursing & Critical Care",
    short: "Nursing",
    demand: "Very High",
    tagline: "Patient-centered critical care, surgical nursing, hospital administration, and public health",
    coreFocus: ["Medical-Surgical Nursing", "Obstetric Care", "Paediatric Nursing", "Emergency & Critical Care"],
  },
  {
    id: "allied",
    streamId: "medical",
    name: "Physiotherapy (BPT) & Allied Health",
    short: "Allied Health",
    demand: "High",
    tagline: "Physical rehabilitation, medical radiology imaging, and diagnostic laboratory technology",
    coreFocus: ["Biomechanics & Ortho Rehab", "Neuro-Physiotherapy", "Medical Imaging / X-Ray / CT", "Lab Diagnostics"],
  },
  {
    id: "medical-pg",
    streamId: "medical",
    name: "After MBBS / Medical PG (MD, MS, DNB, DM/MCh)",
    short: "Medical PG",
    demand: "Very High",
    tagline: "Advanced clinical specialization, super-specialties, surgical residencies, and fellowships",
    coreFocus: ["MD Internal Medicine / Radio / Paediatrics", "MS Surgery / Orthopaedics / OBG", "DM / MCh Super-Specialties", "NEET-PG / INI-CET / USMLE"],
  }
];

const roadmaps = {
  // --- ENGINEERING ROADMAPS ---
  cse: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Programming in C/Python", "Discrete Mathematics", "Digital Logic", "Data Structures"],
      skillsToLearn: ["Python or Java fundamentals", "Git & version control", "Basic Linux/CLI"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["OOP (Java/C++)", "DBMS", "Operating Systems", "Computer Networks", "Algorithms"],
      skillsToLearn: ["SQL", "REST APIs", "Data structures & algorithms practice (LeetCode/HackerRank)"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["Web Technologies", "Software Engineering", "Cloud Computing", "Elective (AI/ML or Systems)"],
      skillsToLearn: ["A frontend framework (React)", "A backend framework (Node/Express or Django)", "Docker basics", "AWS/GCP fundamentals"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "System Design", "Distributed Systems (elective)"],
      skillsToLearn: ["System design basics", "CI/CD pipelines", "Open-source contribution", "Mock interviews & DSA mastery"],
    },
  ],
  it: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Programming Fundamentals", "Discrete Mathematics", "Digital Electronics"],
      skillsToLearn: ["Python basics", "HTML/CSS", "Git & GitHub"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["DBMS", "Computer Networks", "OOP", "Operating Systems"],
      skillsToLearn: ["SQL", "Networking fundamentals (CCNA-level)", "Linux administration"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["Web & Mobile Development", "Cloud Computing", "Information Security", "Software Testing"],
      skillsToLearn: ["Full-stack development (MERN)", "AWS/Azure basics", "Cybersecurity fundamentals"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "DevOps", "Enterprise Systems (elective)"],
      skillsToLearn: ["Docker & Kubernetes basics", "CI/CD", "Cloud certification (AWS/Azure Associate)"],
    },
  ],
  aids: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Programming in Python", "Linear Algebra", "Probability & Statistics", "Discrete Math"],
      skillsToLearn: ["Python + NumPy/Pandas", "Git & GitHub", "SQL basics"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["Data Structures", "DBMS", "Machine Learning Fundamentals", "Data Visualization"],
      skillsToLearn: ["Scikit-learn", "Matplotlib/Seaborn/Power BI", "Statistical hypothesis testing"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["Deep Learning", "NLP", "Big Data Systems", "Computer Vision (elective)"],
      skillsToLearn: ["TensorFlow/PyTorch", "Spark/Hadoop basics", "Cloud ML (AWS Sagemaker/GCP Vertex AI)"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "MLOps", "Generative AI (elective)"],
      skillsToLearn: ["Model deployment (Docker + FastAPI)", "Prompt engineering & LLM fine-tuning", "Kaggle competitions"],
    },
  ],
  ece: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Basic Electronics", "Circuit Theory", "Engineering Mathematics"],
      skillsToLearn: ["Circuit simulation (Multisim/LTspice)", "C programming"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["Analog & Digital Electronics", "Signals & Systems", "Microprocessors"],
      skillsToLearn: ["Embedded C", "Arduino/Raspberry Pi basics"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["VLSI Design", "Communication Systems", "Embedded Systems", "IoT (elective)"],
      skillsToLearn: ["Verilog/VHDL", "PCB design (KiCad)", "IoT protocols (MQTT)"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "5G/Wireless Networks (elective)"],
      skillsToLearn: ["FPGA programming", "RTOS basics", "Signal processing with MATLAB/Python"],
    },
  ],
  mech: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Engineering Mechanics", "Thermodynamics I", "Engineering Drawing"],
      skillsToLearn: ["AutoCAD basics", "Excel for engineering calculations"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["Fluid Mechanics", "Strength of Materials", "Manufacturing Processes"],
      skillsToLearn: ["SolidWorks/CATIA", "Basic MATLAB"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["CAD/CAM", "Robotics", "Heat Transfer", "Automobile Engineering (elective)"],
      skillsToLearn: ["ANSYS (FEA)", "PLC programming basics", "Robotics simulation"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "Industry 4.0 / Automation (elective)"],
      skillsToLearn: ["Digital twin basics", "Six Sigma fundamentals", "Product design portfolio"],
    },
  ],
  civil: [
    {
      stage: "Foundation (Year 1)",
      subjects: ["Engineering Mechanics", "Building Materials", "Surveying"],
      skillsToLearn: ["AutoCAD basics", "Total station surveying"],
    },
    {
      stage: "Core (Year 2)",
      subjects: ["Structural Analysis", "Fluid Mechanics", "Geotechnical Engineering"],
      skillsToLearn: ["STAAD.Pro basics", "Excel-based structural calc"],
    },
    {
      stage: "Specialization (Year 3)",
      subjects: ["Structural Design (RCC/Steel)", "Transportation Engineering", "Environmental Engineering"],
      skillsToLearn: ["Revit/BIM", "ETABS", "Project estimation & costing"],
    },
    {
      stage: "Industry-Ready (Year 4)",
      subjects: ["Capstone Project", "Construction Management (elective)"],
      skillsToLearn: ["Primavera/MS Project", "Green building (LEED basics)", "Site management fundamentals"],
    },
  ],

  // --- MEDICAL & HEALTH SCIENCES ROADMAPS ---
  mbbs: [
    {
      stage: "1st Professional (Year 1 - Pre-Clinical)",
      subjects: ["Human Anatomy & Embryology", "Human Physiology & Biophysics", "Biochemistry & Molecular Biology"],
      skillsToLearn: ["Cadaveric Dissection & Histology", "Hematology & Clinical Vitals Examination", "Biochemical Lab Assays", "Early Clinical Exposure (ECE)"],
    },
    {
      stage: "2nd Professional (Year 2 - Para-Clinical)",
      subjects: ["Pathology & Hematology", "Microbiology & Immunology", "Pharmacology & Therapeutics", "Forensic Medicine & Toxicology (FMT)"],
      skillsToLearn: ["Clinical Case Vignette Diagnosis", "Prescription Writing & Rational Drug Therapy", "Histopathological Slide Interpretation", "Hospital Outpatient (OPD) Postings"],
    },
    {
      stage: "3rd Professional Part 1 (Year 3 - Clinical I)",
      subjects: ["Ophthalmology (Eye)", "Oto-Rhino-Laryngology (ENT)", "Community Medicine & Public Health", "Forensic Medicine (as applicable)"],
      skillsToLearn: ["Fundoscopy & Slit Lamp Examination", "Otoscopy & Tuning Fork Tests", "Epidemiological Survey & Biostatistics", "Immunization & Primary Health Center (PHC) Postings"],
    },
    {
      stage: "Final Professional Part 2 (Year 4 - Clinical II)",
      subjects: ["General Medicine & Dermatology/Psychiatry", "General Surgery & Orthopaedics/Anaesthesia", "Obstetrics & Gynaecology (OBG)", "Paediatrics & Neonatology"],
      skillsToLearn: ["Systematic Clinical History Taking", "Emergency BLS/ACLS Life Support", "Pre-op & Post-op Patient Management", "Normal Delivery & Neonatal Resuscitation"],
    },
    {
      stage: "Compulsory Rotatory Medical Internship (CRMI - 1 Year)",
      subjects: ["Medicine, Surgery, OBG, Paediatrics, Casualty & Rural Health Rotations"],
      skillsToLearn: ["Independent Patient Management under Supervision", "Procedural Skills (Cannulation, Suturing, Lumbar Puncture)", "NEET-PG / INI-CET Master Revision", "Medical Ethics & Medico-legal Documentation"],
    },
  ],

  bds: [
    {
      stage: "Year 1: Dental Foundations",
      subjects: ["General Anatomy & Histology", "General Physiology & Biochemistry", "Dental Anatomy & Oral Histology"],
      skillsToLearn: ["Tooth Carving on Wax Blocks", "Cranial Nerve Anatomy Identification", "Microscopic Oral Slide Evaluation"],
    },
    {
      stage: "Year 2: Pre-Clinical Dentistry",
      subjects: ["General Pathology & Microbiology", "General & Dental Pharmacology", "Pre-Clinical Conservative Dentistry & Prosthodontics"],
      skillsToLearn: ["Typhodont Cavity Preparation", "Complete Denture Fabrication Techniques", "Local Anaesthesia Principles"],
    },
    {
      stage: "Year 3: Clinical Postings",
      subjects: ["General Medicine", "General Surgery", "Oral Pathology & Oral Microbiology"],
      skillsToLearn: ["Clinical Case History & Soft Tissue Biopsy Basics", "Surgical Hand Washing & Asepsis", "Dental Radiograph (IOPA/OPG) Interpretation"],
    },
    {
      stage: "Year 4 & Rotatory Internship",
      subjects: ["Oral & Maxillofacial Surgery", "Conservative Dentistry & Endodontics", "Orthodontics", "Periodontology", "Pedodontics"],
      skillsToLearn: ["Root Canal Treatment (RCT)", "Simple & Surgical Tooth Extractions", "Scaling & Flap Surgery", "Impression Taking & Orthodontic Removable Appliances"],
    },
  ],

  ayush: [
    {
      stage: "Year 1: Samhita & Rachana Sharir",
      subjects: ["Ayurvedic Fundamentals (Sanskrit, Padartha Vijnan)", "Rachana Sharir (Anatomy)", "Kriya Sharir (Physiology)"],
      skillsToLearn: ["Tridosha & Prakriti Assessment", "Pulse Diagnosis (Nadi Pariksha) Fundamentals", "Comparative Modern Anatomy"],
    },
    {
      stage: "Year 2: Dravyaguna & Rasashastra",
      subjects: ["Dravyaguna Vijnan (Pharmacognosy)", "Rasashastra & Bhaishajya Kalpana (Pharmaceutics)", "Roga Nidana (Pathology & Diagnostics)", "Charaka Samhita (Purvardha)"],
      skillsToLearn: ["Medicinal Plant Identification & Formulation Prep", "Diagnostic Palpation & Tongue Examination", "Preparation of Herbal Decoctions & Tailas"],
    },
    {
      stage: "Year 3: Rog Nidan & Specialities",
      subjects: ["Agada Tantra (Toxicology & Forensic)", "Swasthavritta (Preventive & Social Medicine)", "Prasuti Tantra & Striroga (Gynaecology)"],
      skillsToLearn: ["Dietetics according to Ritu (Season)", "Antenatal Ayurvedic Care Protocols", "Panchakarma Procedure Protocols"],
    },
    {
      stage: "Year 4 & Clinical Internship",
      subjects: ["Kayachikitsa (Internal Medicine)", "Shalya Tantra (Surgery & Ksharasutra)", "Shalakya Tantra (ENT & Ophthalmology)", "Panchakarma"],
      skillsToLearn: ["Ksharasutra Therapy for Anorectal Disorders", "Administering Vamana, Virechana, Basti, Nasya", "Integrative Chronic Disease Management"],
    },
  ],

  pharm: [
    {
      stage: "Year 1 (Sem 1-2): Pharmaceutical Fundamentals",
      subjects: ["Human Anatomy & Physiology", "Pharmaceutical Analysis", "Pharmaceutics I", "Pharmaceutical Inorganic Chemistry"],
      skillsToLearn: ["Titration & Volumetric Analysis", "Laboratory Compounding of Solutions & Emulsions", "Safe Chemical Handling"],
    },
    {
      stage: "Year 2 (Sem 3-4): Organic & Physical Pharmacy",
      subjects: ["Pharmaceutical Organic Chemistry", "Physical Pharmaceutics", "Pharmaceutical Microbiology", "Pharmaceutical Engineering"],
      skillsToLearn: ["Synthesis of Drug Intermediates", "Sterilization & Aseptic Media Inoculation", "Unit Operations & Flow of Fluids"],
    },
    {
      stage: "Year 3 (Sem 5-6): Pharmacology & Medicinal Chemistry",
      subjects: ["Medicinal Chemistry", "Pharmacology I & II", "Pharmacognosy & Phytochemistry", "Pharmaceutical Jurisprudence"],
      skillsToLearn: ["Structure-Activity Relationship (SAR) Analysis", "Animal Tissue & In-Vitro Drug Response Screening", "Phytochemical Extraction & Chromatography (TLC/HPLC)"],
    },
    {
      stage: "Year 4 (Sem 7-8): Industrial Practice & Novel Delivery",
      subjects: ["Instrumental Methods of Analysis (HPLC/UV/NMR)", "Industrial Pharmacy", "Pharmacy Practice & Clinical Pharmacokinetics", "Novel Drug Delivery Systems (NDDS)"],
      skillsToLearn: ["Formulation of Sustained-Release Tablets & Nanoparticles", "Dissolution & Bioavailability Testing", "GPAT Entrance Mastery", "Clinical Trial Protocols & Regulatory Filings (FDA/CDSCO)"],
    },
  ],

  nursing: [
    {
      stage: "Year 1: Foundations of Nursing",
      subjects: ["Applied Anatomy & Physiology", "Applied Sociology & Psychology", "Nursing Foundation I & II", "First Aid"],
      skillsToLearn: ["Vital Signs Assessment & Patient Hygiene", "Aseptic Wound Dressing & Catheterization", "Basic Life Support (BLS) & Communication"],
    },
    {
      stage: "Year 2: Medical-Surgical & Pharmacology",
      subjects: ["Applied Pharmacology & Pathology", "Adult Health Nursing I (Medical-Surgical)", "Health Assessment & Infection Prevention"],
      skillsToLearn: ["IV Cannulation & Medication Administration", "Pre-operative & Post-operative Nursing Protocols", "ECG Monitoring & Fluid Balance Charting"],
    },
    {
      stage: "Year 3: Specialized & Child Health Nursing",
      subjects: ["Child Health Nursing (Pediatrics)", "Mental Health Nursing (Psychiatry)", "Community Health Nursing I", "Educational Technology"],
      skillsToLearn: ["Pediatric Drug Dosage Calculations", "Therapeutic Communication & De-escalation", "Maternal & Child Health Field Home Visits"],
    },
    {
      stage: "Year 4 & Critical Care Internship",
      subjects: ["Midwifery & Obstetrical Nursing", "Community Health Nursing II", "Nursing Research & Statistics", "Critical Care & ICU Postings"],
      skillsToLearn: ["Managing Normal Labor & Partograph Charting", "Ventilator & Infusion Pump Management in ICU", "Nursing Leadership, Triage & Hospital Accreditation (NABH)"],
    },
  ],

  allied: [
    {
      stage: "Year 1: Core Biomedical Sciences",
      subjects: ["Anatomy & Physiology", "Biochemistry & Pathology Fundamentals", "Biomechanics & Kinesiology (for BPT) / Radiographic Physics (for Imaging)"],
      skillsToLearn: ["Goniometry & Joint Range of Motion Testing", "Radiographic Exposure & Darkroom Techniques", "Clinical Lab Safety & Pipetting"],
    },
    {
      stage: "Year 2: Diagnostic & Therapeutic Techniques",
      subjects: ["Exercise Therapy & Electrotherapy (BPT)", "Microbiology & Clinical Biochemistry", "Advanced Radiography (CT/MRI/Ultrasound Principles)"],
      skillsToLearn: ["Application of TENS, IFT, Ultrasound Therapy", "Operating Automated Clinical Chemistry Analyzers", "CT Scan Patient Positioning & Protocols"],
    },
    {
      stage: "Year 3: Clinical Specialization",
      subjects: ["Orthopaedic & Sports Rehabilitation (BPT)", "Neurological Rehabilitation", "Cardiopulmonary Physical Therapy", "Special Radiographic Procedures"],
      skillsToLearn: ["Post-Fracture & Stroke Rehabilitation Protocols", "Chest Physiotherapy & ICU Mobilization", "MRI Sequence Selection & Artifact Reduction"],
    },
    {
      stage: "Year 4 & Clinical Internship",
      subjects: ["Community Rehabilitation & Ergonomics", "Advanced Clinical Postings", "Research Methodology & Project"],
      skillsToLearn: ["Ergonomic Workstation Assessment & Gait Analysis", "Independent Diagnostic Report Assisting", "Patient Rehabilitation Planning"],
    },
  ],

  "medical-pg": [
    {
      stage: "Year 1: Clinical Residency Onboarding (Junior Resident 1)",
      subjects: ["Core Specialty Inpatient Wards", "Emergency Duty & Intensive Care Rotations", "Biostatistics & Thesis Topic Selection"],
      skillsToLearn: ["Primary Management of Acute Emergencies in Selected Branch", "Clinical Case Presentations in Grand Rounds", "Drafting Ethical Committee Research Protocol"],
    },
    {
      stage: "Year 2: Advanced Procedural Mastery (Junior Resident 2)",
      subjects: ["Sub-specialty Rotations (Cardio, Neuro, Nephro, GI, ICU)", "Outpatient (OPD) Independent Consultations", "Data Collection for Dissertation"],
    skillsToLearn: ["Diagnostic Procedures (Endoscopy/Echo/Biopsies/Central Lines)", "Surgical Assisting & Supervised Elective Surgeries", "Clinical Teaching of MBBS Undergraduates"],
    },
    {
      stage: "Year 3: Senior Residency & Exit Examination (Junior Resident 3)",
      subjects: ["Thesis Submission", "Final Practical & Clinical Board Exams", "Preparation for DM/MCh Super-Specialty / Fellowships"],
      skillsToLearn: ["Independent Surgical & Clinical Decision Making", "Hospital Quality & Infection Control Leadership", "Senior Resident / Consultant Transition"],
    },
  ],
};

const projects = {
  // --- ENGINEERING PROJECTS ---
  cse: [
    { level: "Beginner", title: "Personal Portfolio Website", stack: ["HTML", "CSS", "JavaScript"], description: "A responsive site showcasing your resume, projects, and contact info." },
    { level: "Beginner", title: "To-Do List App with Auth", stack: ["React", "Node.js", "MongoDB"], description: "CRUD app with user login — teaches full request/response cycle." },
    { level: "Intermediate", title: "E-Commerce Platform", stack: ["React", "Express", "PostgreSQL", "Stripe API"], description: "Product catalog, cart, checkout, and order history." },
    { level: "Intermediate", title: "Real-Time Chat App", stack: ["Socket.io", "Node.js", "React"], description: "Multi-user chat rooms with live message delivery." },
    { level: "Advanced", title: "URL Shortener at Scale", stack: ["Node.js", "Redis", "Docker", "AWS"], description: "Focus on caching, rate limiting, and horizontal scaling." },
    { level: "Advanced", title: "Distributed Task Scheduler", stack: ["Go/Node.js", "RabbitMQ", "Kubernetes"], description: "Demonstrates system design and distributed systems concepts." },
  ],
  it: [
    { level: "Beginner", title: "Network Inventory Tracker", stack: ["Python", "SQLite"], description: "Script that scans and logs devices on a local network." },
    { level: "Beginner", title: "File Backup Automation Tool", stack: ["Python", "Cron"], description: "Automates scheduled backups to local/cloud storage." },
    { level: "Intermediate", title: "Helpdesk Ticketing System", stack: ["MERN Stack"], description: "IT support ticket workflow with status tracking and roles." },
    { level: "Intermediate", title: "Cloud Cost Dashboard", stack: ["AWS SDK", "React", "Chart.js"], description: "Visualizes cloud resource usage and cost trends." },
    { level: "Advanced", title: "CI/CD Pipeline for a Sample App", stack: ["Jenkins/GitHub Actions", "Docker", "Kubernetes"], description: "End-to-end automated build, test, deploy pipeline." },
    { level: "Advanced", title: "Intrusion Detection Prototype", stack: ["Python", "Scapy", "ML basics"], description: "Detects anomalous network traffic patterns." },
  ],
  aids: [
    { level: "Beginner", title: "Titanic Survival Prediction", stack: ["Python", "Pandas", "Scikit-learn"], description: "Classic classification project — the ML 'hello world'." },
    { level: "Beginner", title: "Sales Data Dashboard", stack: ["Power BI / Tableau"], description: "Clean and visualize a retail dataset with actionable insights." },
    { level: "Intermediate", title: "Movie Recommendation System", stack: ["Python", "Scikit-learn", "Flask"], description: "Content-based or collaborative filtering recommender." },
    { level: "Intermediate", title: "Sentiment Analysis on Tweets", stack: ["Python", "NLTK/spaCy", "Streamlit"], description: "NLP pipeline from raw text to deployed demo." },
    { level: "Advanced", title: "End-to-End ML Deployment", stack: ["PyTorch", "FastAPI", "Docker", "AWS Sagemaker"], description: "Train, containerize, and serve a model via API." },
    { level: "Advanced", title: "RAG-based Q&A Chatbot", stack: ["LangChain", "Vector DB", "LLM API"], description: "Retrieval-augmented generation over a custom document set." },
  ],
  ece: [
    { level: "Beginner", title: "Home Automation with Arduino", stack: ["Arduino", "Relays", "Sensors"], description: "Control appliances via app or voice command." },
    { level: "Beginner", title: "Digital Clock using 555 Timer/FPGA", stack: ["Digital Logic", "Verilog"], description: "Classic hardware logic design project." },
    { level: "Intermediate", title: "IoT-Based Environment Monitor", stack: ["ESP32", "MQTT", "Cloud Dashboard"], description: "Sensor data streamed to a live dashboard." },
    { level: "Intermediate", title: "PCB Design for a Power Supply", stack: ["KiCad", "Circuit Design"], description: "End-to-end schematic to fabricated board." },
    { level: "Advanced", title: "FPGA-Based Image Processor", stack: ["Verilog/VHDL", "FPGA Board"], description: "Hardware-accelerated image filtering pipeline." },
    { level: "Advanced", title: "5G Signal Simulation", stack: ["MATLAB", "Signal Processing"], description: "Simulate and analyze modern communication protocols." },
  ],
  mech: [
    { level: "Beginner", title: "Go-Kart Chassis Design", stack: ["SolidWorks", "Basic Mechanics"], description: "3D model and basic stress analysis of a chassis." },
    { level: "Beginner", title: "3D Printed Mechanism", stack: ["CAD", "3D Printing"], description: "Design and fabricate a simple gear or linkage mechanism." },
    { level: "Intermediate", title: "Robotic Arm Prototype", stack: ["Arduino", "Servo Motors", "CAD"], description: "A pick-and-place arm with basic control logic." },
    { level: "Intermediate", title: "FEA Stress Analysis Project", stack: ["ANSYS"], description: "Simulate load-bearing capacity of a mechanical part." },
    { level: "Advanced", title: "Automated Guided Vehicle (AGV)", stack: ["Robotics", "Sensors", "Path Planning"], description: "A self-navigating cart for warehouse-style tasks." },
    { level: "Advanced", title: "Digital Twin of a Production Line", stack: ["Simulation Software", "IoT Sensors"], description: "Real-time virtual model of a physical process." },
  ],
  civil: [
    { level: "Beginner", title: "2D House Plan & Elevation", stack: ["AutoCAD"], description: "Design a residential layout to scale." },
    { level: "Beginner", title: "Concrete Mix Design Study", stack: ["Lab Testing", "Excel"], description: "Determine optimal mix ratios for target strength." },
    { level: "Intermediate", title: "3D BIM Model of a Building", stack: ["Revit"], description: "Full building information model with material takeoffs." },
    { level: "Intermediate", title: "Structural Analysis of a Frame", stack: ["STAAD.Pro / ETABS"], description: "Analyze load distribution on a multi-story frame." },
    { level: "Advanced", title: "Smart Traffic Management Study", stack: ["Traffic Simulation Software", "GIS"], description: "Model and optimize traffic flow for an urban junction." },
    { level: "Advanced", title: "Sustainable Building Design", stack: ["BIM", "Energy Simulation"], description: "Design for LEED/green-building certification criteria." },
  ],

  // --- MEDICAL & HEALTH SCIENCES CASE STUDIES & CLINICAL AUDITS ---
  mbbs: [
    { level: "Beginner", title: "Clinical Case Vignette: Acute Abdomen Triage", stack: ["Clinical History", "Abdominal Exam", "Differential Diagnosis"], description: "A detailed workup distinguishing acute appendicitis, cholecystitis, and renal colic." },
    { level: "Beginner", title: "Community Hypertension & Diabetes Screening Audit", stack: ["Epidemiological Survey", "Blood Pressure", "Glucometry"], description: "Screen 50 community subjects and chart prevalence against lifestyle risk factors." },
    { level: "Intermediate", title: "12-Lead ECG Interpretation Case Series", stack: ["Cardiology", "ECG Analysis", "Ischemia / Arrhythmia Patterns"], description: "Systematic identification of STEMI, NSTEMI, Bundle Branch Blocks, and Atrial Fibrillation." },
    { level: "Intermediate", title: "ICMR Short Term Studentship (STS) Research Proposal", stack: ["Research Protocol", "Biostatistics", "Institutional Ethics Review"], description: "Formulate a formal undergraduate medical research proposal on antimicrobial resistance or hospital infections." },
    { level: "Advanced", title: "Surgical Case Audit: Laparoscopic vs Open Cholecystectomy", stack: ["Surgical Data Audit", "Post-Op Recovery", "Complication Rate Analysis"], description: "Compare operating time, hospital stay duration, and recovery outcomes." },
    { level: "Advanced", title: "Critical Care Sepsis Protocol Review (qSOFA & Bundle Compliance)", stack: ["ICU Protocol", "Lactate Clearance", "Antibiotic Stewardship"], description: "Audit compliance with the 1-Hour Sepsis Bundle in emergency medical admissions." },
  ],

  bds: [
    { level: "Beginner", title: "Caries Risk Assessment in Pediatric Patients", stack: ["Caries Risk Index", "Diet Counseling", "Fluoride Application"], description: "Assess early childhood caries and design preventative oral health regimens." },
    { level: "Intermediate", title: "Radiographic Audit of Impacted Mandibular Third Molars", stack: ["OPG / CBCT", "Winter's Classification", "Pell & Gregory"], description: "Analyze impaction angles and proximity to the inferior alveolar nerve." },
    { level: "Advanced", title: "Complete Denture Rehabilitation Case Presentation", stack: ["Prosthodontics", "Centric Relation", "Occlusal Balance"], description: "Full clinical documentation from primary impressions to post-insertion adjustments." },
  ],

  ayush: [
    { level: "Beginner", title: "Comparative Herbarium of 30 Medicinal Plants", stack: ["Dravyaguna", "Botanical Classification", "Therapeutic Action"], description: "Document habitat, active alkaloids, Rasa, Guna, Virya, and Vipaka of essential herbs." },
    { level: "Intermediate", title: "Clinical Observational Study on Panchakarma in Osteoarthritis", stack: ["Janu Basti", "Knee WOMAC Score", "Vata Shamana"], description: "Evaluate functional mobility and pain reduction before and after therapy." },
    { level: "Advanced", title: "Ksharasutra Preparation & Anorectal Case Series", stack: ["Ksharasutra", "Fistula-in-Ano", "Surgical Healing Rate"], description: "Standardized thread preparation with Apamarga Kshara, Haridra, and Snuhi latex." },
  ],

  pharm: [
    { level: "Beginner", title: "Quality Control Assay of Commercial Paracetamol Tablets", stack: ["UV-Vis Spectrophotometry", "Disintegration Test", "Friability"], description: "Test uniformity of dosage, hardness, and active pharmaceutical ingredient (API) assay." },
    { level: "Intermediate", title: "Formulation of Fast-Dissolving Oral Thin Films", stack: ["Polymer Casting", "Solubility Enhancement", "Stability Testing"], description: "Develop and evaluate pediatric oral thin films for rapid drug delivery." },
    { level: "Advanced", title: "Pharmacovigilance Adverse Drug Reaction (ADR) Surveillance Study", stack: ["CDSCO ADR Forms", "Naranjo Causality Scale", "Drug Safety"], description: "Audit adverse drug reporting and causality analysis in an affiliated hospital." },
  ],

  nursing: [
    { level: "Beginner", title: "Standard Operating Procedure (SOP) on Hand Hygiene & Asepsis", stack: ["WHO 5 Moments", "Microbiology Swab Testing", "NABH Compliance"], description: "Assess healthcare worker hand hygiene compliance before and after education." },
    { level: "Intermediate", title: "Pressure Ulcer Prevention Protocol (Braden Scale Implementation)", stack: ["Braden Scale", "Positioning Schedule", "Barrier Dressings"], description: "Implement preventative skin bundles in immobilized ICU and orthopedic patients." },
    { level: "Advanced", title: "Emergency Crash Cart Readiness Audit in Multi-Specialty Wards", stack: ["Defibrillator Checks", "Emergency Drug Expiry", "BLS/ACLS Equipment"], description: "Systematic monthly audit ensuring rapid response preparedness." },
  ],

  allied: [
    { level: "Beginner", title: "Ergonomic Assessment of Computer Workstation Users", stack: ["RULA / REBA Score", "Postural Analysis", "Spine Ergonomics"], description: "Evaluate musculoskeletal discomfort among desk workers and prescribe corrective stretches." },
    { level: "Intermediate", title: "Post-ACL Reconstruction Rehabilitation Milestone Plan", stack: ["Closed Kinetic Chain Exercises", "Graft Protection", "Isokinetic Testing"], description: "Step-by-step 24-week physiotherapy return-to-sport protocol." },
    { level: "Advanced", title: "Diagnostic Quality Comparison of Low-Dose CT Protocols", stack: ["CT Physics", "Radiation Dose Index (DLP)", "Signal-to-Noise Ratio"], description: "Assess image clarity versus radiation exposure reduction in chest CT scans." },
  ],

  "medical-pg": [
    { level: "Beginner", title: "Systematic Review & Meta-Analysis in Clinical Medicine", stack: ["PRISMA Guidelines", "Cochrane Methodology", "Forest Plot Generation"], description: "Synthesize published randomized clinical trials on a clinical treatment." },
    { level: "Intermediate", title: "Prospective Observational Dissertation (PG Thesis)", stack: ["Study Design", "Sample Size Calculation", "SPSS / R Biostatistics"], description: "Full 2-year clinical dissertation protocol from institutional review to thesis defense." },
    { level: "Advanced", title: "Morbidity & Mortality (M&M) Clinical Case Review", stack: ["Root Cause Analysis", "Diagnostic Pitfalls", "Quality Improvement"], description: "In-depth case review to identify clinical learning points and hospital protocol upgrades." },
  ],
};

const jobs = {
  // --- ENGINEERING JOB ROLES ---
  cse: [
    { role: "Full-Stack Developer", demand: "Very High", skills: ["React/Angular", "Node.js/Django", "SQL & NoSQL", "System Design"] },
    { role: "Cloud/DevOps Engineer", demand: "Very High", skills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "CI/CD"] },
    { role: "Software Development Engineer (SDE)", demand: "High", skills: ["DSA", "OOP", "System Design", "Testing"] },
    { role: "Site Reliability Engineer (SRE)", demand: "Growing", skills: ["Linux", "Monitoring tools", "Automation scripting"] },
  ],
  it: [
    { role: "Cloud Support Engineer", demand: "High", skills: ["AWS/Azure", "Networking", "Troubleshooting"] },
    { role: "DevOps Engineer", demand: "Very High", skills: ["CI/CD", "Docker/Kubernetes", "Scripting"] },
    { role: "Cybersecurity Analyst", demand: "Very High", skills: ["Network security", "SIEM tools", "Ethical hacking basics"] },
    { role: "IT Systems Administrator", demand: "Moderate", skills: ["Windows/Linux server admin", "Networking", "Virtualization"] },
  ],
  aids: [
    { role: "Machine Learning Engineer", demand: "Very High", skills: ["Python", "TensorFlow/PyTorch", "MLOps"] },
    { role: "Data Scientist", demand: "Very High", skills: ["Statistics", "Python/R", "SQL", "Business communication"] },
    { role: "Data Engineer", demand: "High", skills: ["ETL pipelines", "Spark", "Cloud data warehouses"] },
    { role: "AI/GenAI Engineer", demand: "Growing Fast", skills: ["LLMs", "Prompt engineering", "Vector databases", "RAG systems"] },
  ],
  ece: [
    { role: "Embedded Systems Engineer", demand: "High", skills: ["Embedded C", "RTOS", "Microcontrollers"] },
    { role: "VLSI Design Engineer", demand: "High", skills: ["Verilog/VHDL", "Chip design tools"] },
    { role: "IoT Solutions Engineer", demand: "Growing", skills: ["IoT protocols", "Cloud integration", "Sensors"] },
    { role: "RF/Signal Processing Engineer", demand: "Moderate", skills: ["MATLAB", "Communication systems", "5G/6G basics"] },
  ],
  mech: [
    { role: "Design Engineer (CAD/CAM)", demand: "Moderate", skills: ["SolidWorks/CATIA", "GD&T", "FEA"] },
    { role: "Robotics/Automation Engineer", demand: "Growing", skills: ["Robotics", "PLC programming", "Sensors"] },
    { role: "Manufacturing/Process Engineer", demand: "Moderate", skills: ["Lean manufacturing", "Six Sigma", "Quality control"] },
    { role: "EV/Battery Systems Engineer", demand: "Growing Fast", skills: ["Thermal systems", "Battery tech", "CAD"] },
  ],
  civil: [
    { role: "Structural Engineer", demand: "Moderate", skills: ["STAAD.Pro/ETABS", "Structural codes", "RCC/Steel design"] },
    { role: "BIM Engineer/Modeler", demand: "Growing", skills: ["Revit", "Navisworks", "Coordination workflows"] },
    { role: "Site/Project Engineer", demand: "Moderate", skills: ["Project scheduling", "Site supervision", "Estimation"] },
    { role: "Urban/Transportation Planner", demand: "Growing", skills: ["GIS", "Traffic simulation", "Sustainable design"] },
  ],

  // --- MEDICAL & HEALTHCARE ROLES ---
  mbbs: [
    { role: "General Duty Medical Officer (GDMO)", demand: "Very High", skills: ["OPD/IPD Management", "Emergency Triage", "Pharmacotherapy", "Public Health Programs"] },
    { role: "Hospital Resident Physician", demand: "Very High", skills: ["Critical Care", "Ward Management", "Bedside Procedures", "Multidisciplinary Consultation"] },
    { role: "Clinical Research Associate (CRA)", demand: "High", skills: ["GCP Guidelines", "Clinical Trial Protocol", "Bioethics", "Patient Recruitment"] },
    { role: "Medical Advisor / Healthcare Consultant", demand: "Growing", skills: ["Health Informatics", "Health Insurance TPA", "Telemedicine", "Medical Strategy"] },
  ],
  bds: [
    { role: "General Dental Practitioner", demand: "High", skills: ["Restorative Dentistry", "Endodontics (RCT)", "Extractions", "Patient Counseling"] },
    { role: "Oral & Maxillofacial Surgeon (MDS)", demand: "Very High", skills: ["Trauma Surgery", "Implantology", "Cleft Lip & Palate", "Biopsy Diagnostics"] },
    { role: "Orthodontist (MDS)", demand: "High", skills: ["Fixed Orthodontic Appliances", "Clear Aligners", "Dentofacial Orthopedics", "Cephalometrics"] },
    { role: "Public Health Dentist", demand: "Moderate", skills: ["Community Oral Surveys", "School Dental Health", "Tobacco Cessation Programs"] },
  ],
  ayush: [
    { role: "Ayurvedic Medical Consultant", demand: "High", skills: ["Prakriti Pariksha", "Customized Chikitsa", "Dietary Ahara Planning", "Herbal Formulations"] },
    { role: "Panchakarma Center Director", demand: "Very High", skills: ["Vamana/Virechana/Basti Administration", "Wellness Tourism", "Stress Management"] },
    { role: "Herbal Formulation Scientist (R&D)", demand: "High", skills: ["Standardization of Phytomedicines", "Quality Control", "Regulatory Approvals"] },
  ],
  pharm: [
    { role: "Clinical Pharmacist", demand: "Very High", skills: ["Drug Interaction Checking", "Therapeutic Drug Monitoring", "Ward Rounds", "Patient Counseling"] },
    { role: "Formulation R&D Scientist", demand: "Very High", skills: ["Pre-formulation", "Novel Drug Delivery (NDDS)", "HPLC/Dissolution", "Patent Filing"] },
    { role: "Regulatory Affairs Specialist", demand: "High", skills: ["Dossier Preparation (eCTD)", "US-FDA / EMA / CDSCO Submissions", "GMP Audits"] },
    { role: "Hospital Pharmacy Manager", demand: "High", skills: ["Inventory Management", "Narcotic Drug Control", "Cold Chain Logistics"] },
  ],
  nursing: [
    { role: "Intensive Care (ICU) Staff Nurse", demand: "Very High", skills: ["Mechanical Ventilation", "Inotropic Infusions", "Hemodynamic Monitoring", "BLS/ACLS"] },
    { role: "Operation Theatre (OT) Nurse", demand: "High", skills: ["Scrubbing & Circulating", "Surgical Instrument Sterilization", "Anesthesia Assisting"] },
    { role: "Nursing Superintendent / Hospital Administrator", demand: "High", skills: ["Nursing Staff Rostering", "NABH/JCI Quality Protocols", "Infection Control Audits"] },
    { role: "Clinical Nurse Educator", demand: "Growing", skills: ["Simulation Training", "Continuing Nursing Education", "Competency Assessments"] },
  ],
  allied: [
    { role: "Consultant Physiotherapist", demand: "Very High", skills: ["Manual Therapy", "Sports Injury Rehabilitation", "Neurological Stroke Rehab", "Ergonomics"] },
    { role: "Medical Imaging Technologist (CT/MRI)", demand: "Very High", skills: ["Advanced CT/MRI Operation", "Radiation Safety", "Contrast Media Protocols"] },
    { role: "Chief Medical Laboratory Technologist", demand: "High", skills: ["Histopathology", "Hematology Automation", "Molecular PCR Testing", "NABL Quality Control"] },
  ],
  "medical-pg": [
    { role: "Super-Specialist Physician (DM Cardiology / Nephrology / Neurology)", demand: "Very High", skills: ["Interventional Procedures", "Tertiary Care ICU", "Complex Disease Management"] },
    { role: "Consultant Surgeon (MS / MCh Neurosurgery / Surgical Oncology)", demand: "Very High", skills: ["Advanced Laparoscopic & Robotic Surgery", "Tertiary Center Care", "Surgical Team Leadership"] },
    { role: "Consultant Radiodiagnosis Specialist (MD Radiology)", demand: "Very High", skills: ["Cross-Sectional Imaging (CT/MRI)", "Interventional Radiology", "Ultrasound Doppler", "PET-CT"] },
    { role: "Public Health Officer / WHO Epidemiologist (MPH)", demand: "High", skills: ["Disease Surveillance", "Vaccine Policy", "Health Economics", "Global Health Leadership"] },
  ],
};

module.exports = { streams, branches, roadmaps, projects, jobs };
