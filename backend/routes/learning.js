const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  // Ignore read-only filesystem errors on serverless
}
const upload = multer({ dest: uploadDir, limits: { fileSize: 100 * 1024 * 1024 } });

// Backlox's expanded India-wide pathway catalogue.
const EXAMS = [
  { id:"jee-main", name:"JEE Main", category:"Engineering", streams:["science"], subjects:["Physics","Chemistry","Mathematics"], description:"National level engineering entrance for NITs, IIITs, CFTIs." },
  { id:"jee-advanced", name:"JEE Advanced", category:"Engineering", streams:["science"], subjects:["Physics","Chemistry","Mathematics"], description:"Advanced entrance for Indian Institutes of Technology (IITs)." },
  { id:"neet", name:"NEET-UG", category:"Medical", streams:["science"], subjects:["Physics","Chemistry","Biology"], description:"Single national entrance for MBBS, BDS, AYUSH, and veterinary admissions across India." },
  { id:"neet-pg", name:"NEET-PG / INI-CET", category:"Medical PG", streams:["science"], subjects:["Pre-clinical","Para-clinical","Clinical Specialties"], description:"Postgraduate entrance for MD, MS, DNB, and AIIMS/JIPMER PG residencies." },
  { id:"cuet", name:"CUET-UG", category:"University Entrance", streams:["science","commerce","arts"], subjects:["Language","General Test","Domain Subjects"], description:"Common university entrance for Central and top State Universities." },
  { id:"clat", name:"CLAT", category:"Law", streams:["science","commerce","arts"], subjects:["English","Current Affairs","Legal Reasoning","Logical Reasoning","Quantitative Techniques"], description:"National Law Universities (NLUs) entrance for 5-Year Integrated LLB." },
  { id:"ailet", name:"AILET", category:"Law", streams:["science","commerce","arts"], subjects:["English","Current Affairs","Logical Reasoning"], description:"National Law University Delhi entrance." },
  { id:"ca-foundation", name:"CA Foundation", category:"Commerce", streams:["commerce"], subjects:["Accounting","Business Laws","Quantitative Aptitude","Business Economics"], description:"Entry-level chartered accountancy examination by ICAI." },
  { id:"cma-foundation", name:"CMA Foundation", category:"Commerce", streams:["commerce"], subjects:["Business Laws","Accounting","Economics","Mathematics"], description:"Cost and management accountancy foundation by ICMAI." },
  { id:"ipmat", name:"IPMAT", category:"Management", streams:["science","commerce","arts"], subjects:["Quantitative Ability","Verbal Ability","Logical Reasoning"], description:"5-Year Integrated Management Programme at IIM Indore, Rohtak, Ranchi." },
  { id:"nift", name:"NIFT Entrance", category:"Design", streams:["arts","science","commerce"], subjects:["Creative Ability","General Ability","Situation Test"], description:"National Institute of Fashion Technology bachelor design entrance." },
  { id:"uceed", name:"UCEED", category:"Design", streams:["science","commerce","arts"], subjects:["Visualization","Design Aptitude","Logical Reasoning","English"], description:"Undergraduate design admission for IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, IIITDM." },
  { id:"nid-dat", name:"NID DAT", category:"Design", streams:["science","commerce","arts"], subjects:["Design Aptitude","Creative Ability","General Aptitude"], description:"National Institute of Design bachelor of design entrance." },
  { id:"nata", name:"NATA", category:"Architecture", streams:["science"], subjects:["Drawing","Mathematics","General Aptitude"], description:"National Aptitude Test in Architecture for B.Arch admissions." },
  { id:"nda", name:"NDA & NA", category:"Defence", streams:["science","commerce","arts"], subjects:["Mathematics","General Ability Test"], description:"UPSC National Defence Academy & Naval Academy officer cadet entry." },
  { id:"bitsat", name:"BITSAT", category:"Engineering", streams:["science"], subjects:["Physics","Chemistry","Mathematics/Biology","English","Logical Reasoning"], description:"Birla Institute of Technology and Science undergraduate admission." },
  { id:"viteee", name:"VITEEE", category:"Engineering", streams:["science"], subjects:["Physics","Chemistry","Mathematics/Biology","English","Aptitude"], description:"Vellore Institute of Technology engineering entrance." },
  { id:"comdk", name:"COMEDK UGET", category:"Engineering", streams:["science"], subjects:["Physics","Chemistry","Mathematics"], description:"Consortium of Medical, Engineering and Dental Colleges of Karnataka entrance." },
  { id:"kcet", name:"KCET", category:"State Entrance", streams:["science"], subjects:["Physics","Chemistry","Mathematics/Biology"], description:"Karnataka state common entrance examination." },
  { id:"mht-cet", name:"MHT-CET", category:"State Entrance", streams:["science"], subjects:["Physics","Chemistry","Mathematics/Biology"], description:"Maharashtra state common entrance examination." },
  { id:"wbjee", name:"WBJEE", category:"State Entrance", streams:["science"], subjects:["Physics","Chemistry","Mathematics"], description:"West Bengal joint entrance examination." },
  { id:"iiser-iat", name:"IISER Aptitude Test", category:"Pure Science", streams:["science"], subjects:["Physics","Chemistry","Mathematics","Biology"], description:"BS-MS research-oriented admission to IISERs and IISc Bangalore." },
  { id:"nest", name:"NEST", category:"Pure Science", streams:["science"], subjects:["Physics","Chemistry","Mathematics","Biology"], description:"National Institute of Science Education and Research (NISER) entrance." },
  { id:"nchm-jee", name:"NCHM JEE", category:"Hospitality", streams:["science","commerce","arts"], subjects:["Numerical Ability","Reasoning","English","General Knowledge","Aptitude"], description:"National Council for Hotel Management undergraduate entrance." },
  { id:"slat", name:"SLAT", category:"Law", streams:["science","commerce","arts"], subjects:["Logical Reasoning","Legal Reasoning","Analytical Reasoning","Reading","General Knowledge"], description:"Symbiosis Law School entrance examination." },
  { id:"ugc-net", name:"UGC NET", category:"Higher Education", streams:["all"], subjects:["Teaching & Research Aptitude","Subject Paper"], description:"National Eligibility Test for Assistant Professorship and Junior Research Fellowship (JRF)." },
];

const TED_TALKS = [
  { title:"The power of believing that you can improve", speaker:"Carol Dweck", url:"https://www.ted.com/talks/carol_dweck_the_power_of_believing_that_you_can_improve", level:"Intermediate" },
  { title:"How to speak so that people want to listen", speaker:"Julian Treasure", url:"https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen", level:"Intermediate" },
  { title:"How to build your confidence — and spark it in others", speaker:"Brittany Packnett Cunningham", url:"https://www.ted.com/talks/brittany_packnett_cunningham_how_to_build_your_confidence_and_spark_it_in_others", level:"Intermediate" },
  { title:"What makes a good life? Lessons from the longest study on happiness", speaker:"Robert Waldinger", url:"https://www.ted.com/talks/robert_waldinger_what_makes_a_good_life_lessons_from_the_longest_study_on_happiness", level:"Intermediate" },
];

const STREAMS = [
  {
    id:"science", name:"Science (PCM & PCB)", groups:["PCM","PCB","PCMB"],
    courses:["Engineering & Technology","Medicine & Surgery (MBBS)","Dental (BDS)","AYUSH","Pharmacy","Nursing & Allied Health","Pure & Applied Sciences","Architecture & Planning","Computer Applications"],
    exams:["JEE Main","JEE Advanced","NEET-UG","CUET-UG","NATA","NDA"]
  },
  {
    id:"medical", name:"Medical & Health Sciences", groups:["PCB (Physics, Chemistry, Biology)","PCMB"],
    courses:["MBBS","BDS (Dental)","BAMS / BHMS (AYUSH)","B.Pharm & Pharm.D","B.Sc Nursing","Physiotherapy (BPT)","Medical Lab Tech & Radiology","After-MBBS PG (MD/MS/DNB)"],
    exams:["NEET-UG","NEET-PG / INI-CET","AIIMS Nursing Entrance","CUET-UG (Biotech)"]
  },
  {
    id:"commerce", name:"Commerce & Business", groups:["Commerce with Mathematics","Commerce without Mathematics"],
    courses:["B.Com (Hons)","BBA / Management","CA (Chartered Accountancy)","CMA","CS","Economics","Finance & Banking","Business Analytics","Law"],
    exams:["CUET-UG","CA Foundation","CMA Foundation","IPMAT","CLAT"]
  },
  {
    id:"arts", name:"Arts, Humanities & Law", groups:["Humanities","Social Sciences","Design & Law"],
    courses:["5-Year Integrated BA/BBA LLB","Psychology","Political Science","Sociology","Economics","Journalism & Mass Media","Design (B.Des)","Fine Arts","Civil Services Prep"],
    exams:["CUET-UG","CLAT","AILET","UCEED","NIFT Entrance","NDA"]
  },
  {
    id:"vocational", name:"Vocational, Skill & Diploma", groups:["IT & Digital","Healthcare","Engineering Trades","Automotive","Hospitality"],
    courses:["Polytechnic Diploma","B.Voc (Applied Tech)","ITI Advanced Trades","Healthcare Technician","Apprenticeships","CNC & Industrial Automation"],
    exams:["State Polytechnic Entrance (JEECUP, AP POLYCET)","CUET-UG (Vocational)","AITT Trade Test"]
  },
];

const CAREER_FAMILIES = [
  {id:"engineering",name:"Engineering & Technology",after:["12th Science"],branches:["CSE","IT","AI & Data Science","ECE","EEE","Mechanical","Civil","Chemical","Aerospace","Biotechnology","Biomedical","Mechatronics","Robotics","Automobile","Mining","Metallurgy","Production","Petroleum","Environmental","Agricultural Engineering","Food Technology","Textile Technology"]},
  {id:"medical",name:"Medical & Health Sciences",after:["12th PCB/PCMB"],branches:["MBBS","BDS","BAMS","BHMS","BUMS","BSMS","BNYS","BVSc & AH","BPT","BOT","B.Sc Nursing","B.Pharm","Pharm.D","B.Sc Allied Health","BASLP","Optometry","Radiology","Medical Laboratory Technology","Cardiovascular Technology","Emergency & Trauma Care","Public Health"]},
  {id:"medical-pg",name:"After MBBS / Medical PG",after:["MBBS"],branches:["MD","MS","DNB","Postgraduate Diplomas","DM","MCh","DrNB","Fellowships","Public Health / MPH","Clinical Research","Medical Administration","Medical Education","Forensic Medicine","Medical Genetics","Transfusion Medicine","Pathology","Radiodiagnosis","Anaesthesiology","Psychiatry","Dermatology","Paediatrics","General Medicine","General Surgery","Obstetrics & Gynaecology","Orthopaedics","Ophthalmology","ENT","Emergency Medicine","Family Medicine","Respiratory Medicine","Nuclear Medicine","Radiation Oncology","Anatomy","Physiology","Biochemistry","Microbiology","Pharmacology","Community Medicine"]},
  {id:"commerce-management",name:"Commerce, Management & Finance",after:["12th Commerce / Any stream where eligible"],branches:["B.Com","BBA","BBM","CA","CMA","CS","BMS","Economics","Finance","Banking","Insurance","Business Analytics","Actuarial Science","FinTech","Entrepreneurship","Supply Chain","Marketing","Human Resources"]},
  {id:"law",name:"Law & Legal Studies",after:["12th Any stream"],branches:["BA LLB","BBA LLB","B.Com LLB","B.Sc LLB","LLB","LLM","Corporate Law","Criminal Law","Constitutional Law","IPR","Cyber Law","Tax Law","International Law","Legal Operations"]},
  {id:"design",name:"Design, Fashion & Creative Arts",after:["12th Any stream"],branches:["B.Des","Fashion Design","Communication Design","Product Design","UX/UI","Interior Design","Industrial Design","Animation","VFX","Game Design","Fine Arts","Applied Arts","Photography","Music","Dance","Theatre","Fashion Technology"]},
  {id:"architecture",name:"Architecture, Planning & Built Environment",after:["12th Science / eligible pathways"],branches:["B.Arch","B.Plan","Interior Architecture","Landscape Architecture","Urban Planning","Regional Planning","Construction Management","Quantity Surveying"]},
  {id:"pure-science",name:"Pure & Applied Sciences",after:["12th Science"],branches:["Physics","Chemistry","Mathematics","Statistics","Biotechnology","Biochemistry","Microbiology","Zoology","Botany","Geology","Geography","Environmental Science","Data Science","Computer Science","Astronomy / Astrophysics","Forensic Science"]},
  {id:"agriculture",name:"Agriculture, Food & Environmental Sciences",after:["12th Science / Agriculture"],branches:["Agriculture","Horticulture","Forestry","Fisheries","Food Technology","Dairy Technology","Agricultural Economics","Agricultural Engineering","Agricultural Biotechnology","Food Nutrition","Environmental Science"]},
  {id:"computer-applications",name:"Computer Applications & IT",after:["12th Any stream where eligible"],branches:["BCA","MCA","Cloud Computing","Cybersecurity","AI/ML","Data Analytics","Data Science","Software Development","Web Development","DevOps","Networking","Database Administration"]},
  {id:"humanities-social",name:"Humanities, Social Sciences & Languages",after:["12th Any stream"],branches:["Psychology","Sociology","Political Science","History","Economics","Geography","Philosophy","Anthropology","Social Work","Public Administration","International Relations","English","Indian Languages","Foreign Languages","Library Science"]},
  {id:"education",name:"Education & Teaching",after:["12th / Graduation depending on programme"],branches:["Integrated Teacher Education","B.Ed","D.El.Ed","M.Ed","Special Education","Educational Psychology","Curriculum & Instruction","Educational Technology"]},
  {id:"hospitality-travel",name:"Hospitality, Tourism & Aviation",after:["12th Any stream"],branches:["Hotel Management","Culinary Arts","Tourism Management","Travel Management","Event Management","Aviation & Airport Management","Cabin Crew Studies","Hospitality Operations"]},
  {id:"defence-public",name:"Defence, Government & Public Service",after:["12th / Graduation depending on exam"],branches:["NDA","CDS","AFCAT","CAPF","Civil Services","State PSC","SSC","Banking","Railways","Police Services","Coast Guard","Defence Technical Entry"]},
  {id:"maritime",name:"Maritime & Ocean Studies",after:["12th Science / eligible pathways"],branches:["Marine Engineering","Nautical Science","Naval Architecture","Shipbuilding","Oceanography","Port & Logistics Management","Fisheries"]},
  {id:"sports",name:"Sports, Fitness & Wellness",after:["12th Any stream"],branches:["Physical Education","Sports Science","Sports Management","Coaching","Fitness Training","Yoga","Nutrition & Wellness"]},
];

// Rich, structured syllabus & interactive module content for all streams
const STREAM_MODULES = {
  science: [
    {
      title: "Foundation & Core Sciences",
      description: "Physics, Chemistry, Mathematics/Biology fundamentals with laboratory principles.",
      topics: ["Newtonian Mechanics, Kinematics & Thermodynamics", "Electromagnetism, Optics & Modern Physics", "Organic Chemistry Mechanisms & Physical Chemistry", "Calculus, Vectors & Coordinate Geometry (PCM)", "Cell Biology, Genetics & Human Physiology (PCB)"],
      duration: "4–6 Weeks",
      resources: ["NCERT Class 11 & 12 Exemplar", "Khan Academy Science & Calculus", "MIT OpenCourseWare Physics"],
      checkpoints: ["Master dimensional analysis & differential calculus", "Solve 50 equilibrium & stoichiometry problems", "Complete genetics pedigree chart exercises"]
    },
    {
      title: "Competitive Entrance Preparation",
      description: "JEE Main/Advanced, NEET-UG, CUET-UG, NATA and NDA exam mastery with timed test strategies.",
      topics: ["High-Yield Problem Solving Techniques", "Previous 10 Years Question Bank Analysis", "Speed & Accuracy Optimization", "Negative Marking Avoidance Strategy"],
      duration: "8–12 Weeks",
      resources: ["Backlox MCQ Lab Engine", "NTA Official Mock Tests Bank", "Subject Concept Formula Maps"],
      checkpoints: ["Achieve 85%+ accuracy in Chapterwise MCQs", "Complete 5 full-length timed mock tests", "Create error log notebook for revision"]
    },
    {
      title: "Career & Branch Exploration",
      description: "Compare Engineering, Medicine, Dental, Pure Science Research, Architecture, and Biotechnology outcomes.",
      topics: ["4-Year Degree Curricula Comparison", "Eligibility, Cutoffs & Counseling Rounds (JoSAA, MCC, State CETs)", "Global Career Opportunities & ROI", "Industry Trends: AI, Genomics, Clean Energy"],
      duration: "2 Weeks",
      resources: ["NIRF College Rankings", "AICTE & NMC Official Portals", "Backlox Branch Matcher"],
      checkpoints: ["Shortlist top 5 target colleges and courses", "Understand category quotas and reservation rules", "Map higher study paths (GATE/CAT/GRE/USMLE)"]
    },
    {
      title: "Branch & Degree Specialization",
      description: "Deep dive into specific degree syllabi, semester-wise subjects, and hands-on laboratory setups.",
      topics: ["Pre-Semester Core Subject Preview", "Key Mathematical Foundations for Engineering/Medicine", "Recommended Textbooks & Reference Literature", "Software & Tools Setup (Python, MATLAB, Bio-informatics)"],
      duration: "3 Weeks",
      resources: ["NPTEL Video Lectures", "Coursera / edX Foundational Courses", "GitHub Open-Source Student Pack"],
      checkpoints: ["Install IDE / programming environment or medical atlas", "Review 1st Semester syllabus", "Connect with college alumni or seniors"]
    },
    {
      title: "Skill Builder & Professional Launch",
      description: "Technical literacy, communication, scientific writing, and career-readiness competencies.",
      topics: ["Technical Documentation & Research Writing", "Public Speaking & Presentation Skills", "Digital Literacy & Problem Solving", "Time Management & Stress Resilience"],
      duration: "2 Weeks",
      resources: ["TED Talks Vocabulary Lab", "Harvard Business Review Student Guide", "LinkedIn Learning"],
      checkpoints: ["Build a student resume & GitHub/LinkedIn profile", "Deliver a 5-minute technical presentation", "Complete 20 TED vocabulary modules"]
    }
  ],
  medical: [
    {
      title: "Pre-Clinical Foundations",
      description: "Human Gross Anatomy, General Physiology, and Medical Biochemistry foundations.",
      topics: ["General Histology, Embryology & Osteology", "Nerve-Muscle Physiology & Cardiovascular Hemodynamics", "Enzymology, Metabolism & Medical Genetics", "Medical Terminology & Cadaveric Dissection Principles"],
      duration: "8–10 Weeks",
      resources: ["BD Chaurasia Human Anatomy", "Guyton & Hall Medical Physiology", "Harper's Illustrated Biochemistry"],
      checkpoints: ["Identify major cranial nerves and arterial supplies", "Master cardiac cycle & ECG waveforms", "Understand metabolic pathway inborn errors"]
    },
    {
      title: "NEET-UG & Medical Entrance Mastery",
      description: "Intensive biology, chemistry, and physics high-yield review for medical college admissions.",
      topics: ["Human Physiology, Reproduction & Genetics NCERT Line-by-Line", "Organic Chemistry Reactions & Named Mechanisms", "Optics, Modern Physics & Mechanics Shortcuts", "Mock Test Analysis & High-Speed Elimination"],
      duration: "10–14 Weeks",
      resources: ["Backlox Medical MCQ Lab", "AIIMS & NEET Previous Year Papers", "NCERT Biology Fingertips"],
      checkpoints: ["Score 340+ in Biology Practice Tests", "Master physics numerical shortcuts", "Analyze weak areas in full mock tests"]
    },
    {
      title: "Clinical Pathways & Degree Explorer",
      description: "Compare MBBS, BDS (Dental), BAMS (Ayurveda), Pharmacy, Nursing, Physiotherapy, and Allied Health careers.",
      topics: ["Degree Scope, Duration & Internship Requirements", "Hospital Career Hierarchies (Resident to Consultant)", "Government Medical Officer vs Private Practice vs Clinical Research", "Emerging Fields: Medical Genetics, Health Informatics, Telemedicine"],
      duration: "2 Weeks",
      resources: ["National Medical Commission (NMC) Portal", "WHO Health Careers Guide", "Backlox Medical Universe"],
      checkpoints: ["Compare undergraduate medical options", "Review fee structures and bond requirements across states", "Explore Medical PG options (MD/MS/DNB)"]
    },
    {
      title: "Clinical Skills & Bedside Diagnostics",
      description: "Introduction to systematic history taking, general physical examination, and vital signs.",
      topics: ["Vital Signs: Blood Pressure, Pulse, Respiratory Rate, SpO2", "Systematic History Taking Framework (Chief Complaint to ROS)", "Basic Life Support (BLS) Protocols", "Medical Ethics & Empathetic Patient Communication"],
      duration: "4 Weeks",
      resources: ["Macleod's Clinical Examination", "Hutchison's Clinical Methods", "AHA BLS Guidelines"],
      checkpoints: ["Perform accurate manual blood pressure measurement", "Structure a complete patient case sheet", "Master the ABCDE emergency triage approach"]
    },
    {
      title: "Medical PG & Global Licensing Routes",
      description: "Planning beyond MBBS: NEET-PG, INI-CET, USMLE (USA), PLAB/UKMLA (UK), and AMC (Australia).",
      topics: ["NEET-PG / NExT Exam Pattern & 19 Subject Weightages", "USMLE Step 1 (Pass/Fail) & Step 2 CK Clinical Mastery", "PLAB 1 & 2 / UK Foundation Programme", "Clinical Research, Fellowships & Super-Specialty (DM/MCh)"],
      duration: "3 Weeks",
      resources: ["First Aid for USMLE Step 1", "Marrow / Prepladder Curriculum Guidelines", "GMC UK Official Licensing Guide"],
      checkpoints: ["Understand timelines for USMLE/PLAB exams", "Review high-yield clinical question banks", "Shortlist preferred clinical specialties"]
    }
  ],
  commerce: [
    {
      title: "Accounting & Financial Foundations",
      description: "Double-entry bookkeeping, corporate financial statements, and cost accounting basics.",
      topics: ["Principles of Financial Accounting", "Trial Balance, Profit & Loss, Balance Sheet", "Ratio Analysis & Cash Flow Statements", "Basics of Auditing & Standards"],
      duration: "6 Weeks",
      resources: ["ICAI Study Material", "Investopedia Financial Accounting", "Corporate Annual Reports"],
      checkpoints: ["Draft a complete 3-statement financial model", "Calculate liquidity and solvency ratios", "Understand GST and direct tax compliance"]
    },
    {
      title: "Professional Entrances & Certifications",
      description: "CA Foundation, CMA Foundation, CS Executive Entrance (CSEET), and IPMAT preparation.",
      topics: ["Business Laws & Regulatory Framework", "Business Mathematics & Logical Reasoning", "Micro & Macro Economics", "Management Aptitude & Interview Readiness"],
      duration: "8–12 Weeks",
      resources: ["ICAI / ICMAI / ICSI Portals", "IPMAT Previous Years Questions", "Backlox Commerce MCQ Lab"],
      checkpoints: ["Complete CA Foundation mock test series", "Master contract law and partnership acts", "Practice quantitative aptitude speed tests"]
    },
    {
      title: "Capital Markets, FinTech & Banking",
      description: "Stock markets, mutual funds, corporate finance, and modern financial technology.",
      topics: ["Equity & Debt Markets (NSE/BSE)", "Valuation Techniques (DCF, Multiples)", "Commercial Banking Operations & RBI Guidelines", "FinTech: UPI, Blockchain, Algorithmic Trading"],
      duration: "4 Weeks",
      resources: ["NSE Academy Modules", "Zerodha Varsity", "Bloomberg Market Concepts"],
      checkpoints: ["Analyze a live public company's balance sheet", "Simulate an equity investment portfolio", "Complete NISM certification module"]
    },
    {
      title: "Business Analytics & Excel Mastery",
      description: "Advanced Microsoft Excel, Power BI dashboards, SQL, and data-driven decision making.",
      topics: ["Advanced Excel (VLOOKUP, XLOOKUP, Pivot Tables, Macros)", "Financial Modeling & Sensitivity Analysis", "Power BI Data Visualization", "SQL for Business Queries"],
      duration: "4 Weeks",
      resources: ["Microsoft Excel Official Certification", "Coursera Business Analytics Specialization", "Kaggle Financial Datasets"],
      checkpoints: ["Build a financial KPI dashboard in Power BI", "Write complex SQL join queries on sales data", "Create a discounted cash flow (DCF) model"]
    },
    {
      title: "Entrepreneurship & Corporate Strategy",
      description: "Startup ideation, venture capital funding, business model canvas, and growth strategies.",
      topics: ["Business Model Canvas & Lean Startup", "Unit Economics & Customer Acquisition Cost (CAC/LTV)", "Pitch Deck Creation & Investor Negotiations", "Supply Chain & Operations Strategy"],
      duration: "3 Weeks",
      resources: ["Y Combinator Startup School", "Harvard Business Review Strategy Cases", "Startup India Portal"],
      checkpoints: ["Draft a 10-slide startup pitch deck", "Calculate break-even and runway projections", "Conduct competitor benchmarking analysis"]
    }
  ],
  arts: [
    {
      title: "Critical Thinking & Humanities Foundations",
      description: "Political thought, modern history, sociology, ethics, and psychological foundations.",
      topics: ["Constitutional Law & Indian Political System", "World & Modern Indian History", "Sociological Theories & Social Movements", "Cognitive & Behavioral Psychology"],
      duration: "6 Weeks",
      resources: ["Stanford Encyclopedia of Philosophy", "NCERT Humanities Exemplar", "JSTOR Open Access"],
      checkpoints: ["Write an analytical essay on constitutional rights", "Compare qualitative vs quantitative research methods", "Synthesize a key sociological case study"]
    },
    {
      title: "Law & Competitive Entrance Routes",
      description: "CLAT, AILET, CUET-UG Humanities, and Civil Services Foundation.",
      topics: ["Legal Reasoning & Landmark Supreme Court Judgments", "Current Affairs & Global Geopolitics", "Verbal Ability & Reading Comprehension", "General Mental Ability & Analytical Logic"],
      duration: "8–10 Weeks",
      resources: ["Backlox CLAT Practice Lab", "LiveLaw & Bar and Bench", "The Hindu / Indian Express Editorial Analysis"],
      checkpoints: ["Score 80%+ in CLAT Reading Comprehension sets", "Summarize 10 landmark constitutional cases", "Solve 5 full-length legal reasoning test series"]
    },
    {
      title: "Design, Media & Visual Communication",
      description: "UX/UI principles, visual storytelling, journalism, and digital media production.",
      topics: ["Design Thinking Methodology", "Typography, Color Theory & Layouts", "Investigative Journalism & Fact-Checking", "Digital Content Creation & Podcasting"],
      duration: "4 Weeks",
      resources: ["Figma Design Academy", "Nielsen Norman Group UX Guidelines", "Poynter Institute Journalism"],
      checkpoints: ["Create a 5-screen interactive app prototype in Figma", "Publish an investigative feature article", "Design a cohesive visual brand identity"]
    },
    {
      title: "Public Policy & Civil Services Pathway",
      description: "Policy analysis, governance mechanisms, international relations, and administrative ethics.",
      topics: ["Public Policy Formulation & Evaluation", "Administrative Ethics & Governance", "International Organizations (UN, WTO, IMF)", "Public Welfare Schemes & Implementation"],
      duration: "4 Weeks",
      resources: ["NITI Aayog Policy Reports", "UPSC Syllabus Guidelines", "PRS Legislative Research"],
      checkpoints: ["Draft a policy memo on an urban healthcare or education challenge", "Analyze legislative bills currently in parliament", "Prepare a structured debate brief"]
    },
    {
      title: "Research, Writing & Professional Portfolio",
      description: "Academic literature review, APA/MLA citations, publishing, and career launch.",
      topics: ["Structuring Academic Research Papers", "Citation Standards & Avoiding Plagiarism", "Grant Proposal & Thesis Writing", "Building a Public Writing Portfolio (Substack/Medium)"],
      duration: "3 Weeks",
      resources: ["Purdue OWL Writing Lab", "Google Scholar", "ResearchGate"],
      checkpoints: ["Submit an original 2000-word research review", "Establish a curated writing portfolio", "Draft a statement of purpose (SOP) for higher studies"]
    }
  ],
  vocational: [
    {
      title: "Technical & Industrial Fundamentals",
      description: "Industrial safety protocols, workshop tools, electrical basics, and technical schematics.",
      topics: ["Occupational Safety & Health (OSHA/ISO Standards)", "Blueprint & Schematic Reading", "Hand Tools, Power Tools & Precision Instruments", "Basic Electrical & Electronic Testing"],
      duration: "4 Weeks",
      resources: ["National Skill Development Corporation (NSDC)", "ITI Trade Manuals", "Skill India Digital"],
      checkpoints: ["Demonstrate multimeter electrical testing", "Read an industrial wiring diagram", "Pass the workshop safety assessment"]
    },
    {
      title: "Applied Trade Specialization",
      description: "CNC Machining, Automotive Diagnostics, Refrigeration/HVAC, or Healthcare Technology.",
      topics: ["Automotive Engine Systems & EV Diagnostics", "CNC Programming & CAD/CAM Machine Setup", "HVAC Refrigeration Cycles & Electrical Controls", "Medical Equipment Maintenance & Calibration"],
      duration: "8–12 Weeks",
      resources: ["NIMI Instructional Media", "Manufacturer Service Manuals", "Virtual Trade Simulators"],
      checkpoints: ["Perform standard fault diagnosis on automotive/HVAC systems", "Execute a precision CNC part run", "Calibrate a medical or laboratory instrument"]
    },
    {
      title: "Apprenticeship & Certification Prep",
      description: "All India Trade Test (AITT), NCVT certifications, and corporate apprenticeship readiness.",
      topics: ["NCVT / DGT Trade Theory Review", "Practical Workshop Assessments", "Interview Readiness for PSUs (BHEL, Railways, ISRO, DRDO)", "Apprenticeship Act Guidelines"],
      duration: "4 Weeks",
      resources: ["NAPS Apprenticeship Portal", "Bharat Skills Learning Platform", "Previous Trade Test Papers"],
      checkpoints: ["Register on the National Apprenticeship Portal", "Complete mock trade theory test", "Prepare technical trade resume"]
    },
    {
      title: "Digital Trade Tools & Smart Automation",
      description: "PLC programming basics, 3D printing, smart home IoT, and automated maintenance.",
      topics: ["Ladder Logic & PLC Automation Basics", "3D Printing & Slicing Software", "Smart Home Installation & Solar PV Systems", "Predictive Maintenance & Sensors"],
      duration: "4 Weeks",
      resources: ["Siemens / Schneider Electric Learning", "Arduino Hardware Hub", "Solar Energy Corporation of India Modules"],
      checkpoints: ["Program a basic automated conveyor PLC sequence", "3D print a functional replacement part", "Calculate solar panel inverter sizing"]
    },
    {
      title: "Career Launch & Entrepreneurship",
      description: "Service business setup, client estimation, GST invoicing, and independent trade contracting.",
      topics: ["Starting a Trade Service Enterprise (Workshop/Agency)", "Cost Estimation & Quotation Drafting", "Digital Invoicing & Tax Compliance", "Customer Relations & Quality Assurance"],
      duration: "2 Weeks",
      resources: ["MSME Udyam Registration Portal", "Pradhan Mantri Mudra Yojana Guide", "Trade Contractor Playbook"],
      checkpoints: ["Draft a formal service quotation with parts & labor", "Register for an MSME Udyam certificate", "Set up a Google Business Profile for services"]
    }
  ]
};

router.get("/streams", (req,res)=>res.json({success:true,data:STREAMS}));
router.get("/exams", (req,res)=>res.json({success:true,data:EXAMS}));
router.get("/ted-talks", (req,res)=>res.json({success:true,data:TED_TALKS}));
router.get("/courses", (req,res)=>{
  const rows=db.prepare(`SELECT c.*, u.name AS instructor_name, (SELECT video_url FROM course_modules m WHERE m.course_id=c.id ORDER BY position, id LIMIT 1) AS trailer_video_url, (SELECT COUNT(*) FROM course_modules m WHERE m.course_id=c.id) AS module_count FROM courses c JOIN users u ON u.id=c.instructor_id WHERE c.status='published' ORDER BY c.created_at DESC`).all();
  res.json({success:true,data:rows});
});
router.get("/courses/:id", (req,res)=>{
  const course=db.prepare(`SELECT c.*, u.name AS instructor_name, (SELECT video_url FROM course_modules m WHERE m.course_id=c.id ORDER BY position, id LIMIT 1) AS trailer_video_url FROM courses c JOIN users u ON u.id=c.instructor_id WHERE c.id=? AND c.status='published'`).get(req.params.id);
  if(!course) return res.status(404).json({success:false,message:"Course not found"});
  const modules=db.prepare(`SELECT id,title,description,video_url,resource_url,position FROM course_modules WHERE course_id=? ORDER BY position,id`).all(req.params.id);
  res.json({success:true,data:{course,modules}});
});

function requireInstructor(req,res,next){
  if(!["instructor","admin"].includes(req.user.role)) return res.status(403).json({success:false,message:"Instructor access required"});
  next();
}
router.use("/instructor",requireAuth,requireInstructor);
router.get("/instructor/courses",(req,res)=>{
  const rows=db.prepare(`SELECT c.*, (SELECT video_url FROM course_modules m WHERE m.course_id=c.id ORDER BY position, id LIMIT 1) AS trailer_video_url, (SELECT COUNT(*) FROM course_modules m WHERE m.course_id=c.id) module_count FROM courses c WHERE instructor_id=? ORDER BY created_at DESC`).all(req.user.id);
  res.json({success:true,data:rows});
});
router.post("/instructor/courses",(req,res)=>{
  const {title,description,category,stream_id,price,trailer_video_url,trailerVideoUrl}=req.body||{};
  if(!title||!description||!category) return res.status(400).json({success:false,message:"Title, description and category are required"});
  const info=db.prepare(`INSERT INTO courses(instructor_id,title,description,category,stream_id,price_paise,status) VALUES(?,?,?,?,?,?,?)`).run(req.user.id,title.trim(),description.trim(),category.trim(),stream_id||null,Math.max(0,Math.round(Number(price||0)*100)),"published");
  const newCourseId = info.lastInsertRowid;
  const vidUrl = trailer_video_url || trailerVideoUrl || "https://www.youtube.com/embed/aircAruvnKk";
  db.prepare(`INSERT INTO course_modules(course_id,title,description,video_url,resource_url,position) VALUES(?,?,?,?,?,?)`).run(
    newCourseId,
    `Foundations of ${title.trim()}`,
    description.trim(),
    vidUrl,
    "",
    1
  );
  res.status(201).json({success:true,data:{id:newCourseId}});
});
router.post("/instructor/courses/:id/modules/upload", upload.single("moduleFile"), (req,res)=>{
  const owns=db.prepare("SELECT id FROM courses WHERE id=? AND instructor_id=?").get(req.params.id,req.user.id);
  if(!owns){ if(req.file) fs.unlinkSync(req.file.path); return res.status(404).json({success:false,message:"Course not found"}); }
  const {title,description,videoUrl,position}=req.body||{};
  if(!title){ if(req.file) fs.unlinkSync(req.file.path); return res.status(400).json({success:false,message:"Module title is required"}); }
  const resourceUrl=req.file?`/uploads/${path.basename(req.file.path)}`:"";
  db.prepare(`INSERT INTO course_modules(course_id,title,description,video_url,resource_url,position) VALUES(?,?,?,?,?,?)`).run(req.params.id,title,description||"",videoUrl||"",resourceUrl,Number(position||1));
  res.status(201).json({success:true,data:{resourceUrl}});
});

router.post("/instructor/courses/:id/modules",(req,res)=>{
  const cid = req.params.id;
  const {title,description,videoUrl,resourceUrl,position}=req.body||{};
  if(!title) return res.status(400).json({success:false,message:"Module title is required"});

  let course = db.prepare("SELECT id FROM courses WHERE id=?").get(cid);
  if (!course) {
    const info = db.prepare("INSERT INTO courses(instructor_id,title,description,category,status) VALUES(?,?,?,?,'published')").run(
      req.user.id,
      title,
      description || "Custom Course",
      "Specialized"
    );
    course = { id: info.lastInsertRowid };
  }

  const newModInfo = db.prepare(`INSERT INTO course_modules(course_id,title,description,video_url,resource_url,position) VALUES(?,?,?,?,?,?)`).run(
    course.id,
    title,
    description||"",
    videoUrl||"",
    resourceUrl||"",
    Number(position||1)
  );
  res.status(201).json({success:true,data:{message:"Module added", id: newModInfo.lastInsertRowid}});
});

// Shuffling helper function to randomize options and accurately track the correct answer index
function shuffleQuestion(q) {
  const optionsWithFlag = q.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === q.answer,
  }));

  // Fisher-Yates shuffle
  for (let i = optionsWithFlag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsWithFlag[i], optionsWithFlag[j]] = [optionsWithFlag[j], optionsWithFlag[i]];
  }

  const shuffledOptions = optionsWithFlag.map((item) => item.text);
  const newAnswerIndex = optionsWithFlag.findIndex((item) => item.isCorrect);

  return {
    ...q,
    options: shuffledOptions,
    answer: newAnswerIndex,
  };
}

const ADVANCED_MCQ_BANK = {
  science: [
    {
      question: "In a quantum particle-in-a-1D-box of length L, if the particle is in the second excited state (n = 3), at what positions x within the box (0 < x < L) is the probability density of finding the particle equal to zero (nodes)?",
      options: ["x = L/3 and x = 2L/3", "x = L/2 only", "x = L/4 and x = 3L/4", "x = L/6, L/2, and 5L/6"],
      answer: 0,
      difficulty: "Hard (JEE Adv / GATE)",
      subject: "Quantum Physics",
      explanation: "For state n, the wave function ψ_n(x) = sqrt(2/L) * sin(n*pi*x/L). Zero probability density occurs when sin(3*pi*x/L) = 0, giving 3*pi*x/L = pi, 2*pi => x = L/3 and x = 2L/3 inside the open interval (0, L)."
    },
    {
      question: "A uniform magnetic field B is perpendicular to the plane of a circular loop of radius r and electrical resistance R. If the magnetic field magnitude decays exponentially as B(t) = B0 * exp(-lambda * t), what is the total electrical charge Q that flows past any point in the loop from t = 0 to t -> infinity?",
      options: ["(pi * r^2 * B0) / R", "(lambda * pi * r^2 * B0) / R", "(pi * r^2 * B0) / (lambda * R)", "(2 * pi * r * B0) / R"],
      answer: 0,
      difficulty: "Hard (JEE Advanced)",
      subject: "Electrodynamics",
      explanation: "By Faraday's law and Ohm's law, induced charge dq = dPhi / R. Integrating total charge Q = Delta Phi / R = (Phi_initial - Phi_final) / R = (pi * r^2 * B0 - 0) / R = (pi * r^2 * B0) / R, independent of decay constant lambda."
    },
    {
      question: "Which of the following coordination complexes will exhibit the highest crystal field stabilization energy (CFSE) in an octahedral strong field environment?",
      options: ["[Co(CN)6]3- (low-spin d6)", "[Fe(CN)6]3- (low-spin d5)", "[Cr(NH3)6]3+ (d3)", "[Ni(H2O)6]2+ (d8)"],
      answer: 0,
      difficulty: "Hard (NEET-UG / JEE Adv)",
      subject: "Inorganic Chemistry",
      explanation: "Low-spin d6 Co3+ in an octahedral strong field has electron configuration (t2g)^6 (eg)^0. CFSE = 6 * (-0.4 * Delta_o) + 2P = -2.4 * Delta_o + 2P, which is the highest CFSE among the choices."
    },
    {
      question: "For a real gas obeying the van der Waals equation (P + a/V^2)(V - b) = RT, what is the critical compressibility factor Z_c = (P_c * V_c) / (R * T_c)?",
      options: ["3/8 = 0.375", "1/3 = 0.333", "8/3 = 2.667", "1.000 (Ideal)"],
      answer: 0,
      difficulty: "Hard (Physical Chemistry / GATE)",
      subject: "Thermodynamics",
      explanation: "At the critical point: P_c = a / (27 * b^2), V_c = 3b, and T_c = (8a) / (27 * R * b). Calculating Z_c = (P_c * V_c) / (R * T_c) = [ (a / 27b^2) * (3b) ] / [ R * (8a / 27Rb) ] = (3a/27b) / (8a/27b) = 3/8 = 0.375."
    },
    {
      question: "In algorithm analysis, what is the tight asymptotic time complexity for finding the strongly connected components (SCCs) of a directed graph G = (V, E) using Tarjan's algorithm or Kosaraju's algorithm?",
      options: ["Theta(|V| + |E|)", "Theta(|V| * log |V|)", "Theta(|V|^2)", "Theta(|E| * log |V|)"],
      answer: 0,
      difficulty: "Hard (GATE CS / Algorithms)",
      subject: "Computer Science",
      explanation: "Both Tarjan's and Kosaraju's algorithms compute all strongly connected components in linear time Theta(|V| + |E|) using Depth-First Search (DFS) traversals."
    },
    {
      question: "Consider an ideal Carnot heat engine operating between temperatures T_hot = 600 K and T_cold = 300 K. If it absorbs 1200 J of heat from the high-temperature reservoir, what is the entropy change of the universe during one complete reversible cycle?",
      options: ["0 J/K", "+2.0 J/K", "-2.0 J/K", "+4.0 J/K"],
      answer: 0,
      difficulty: "Hard (Physics / Thermodynamics)",
      subject: "Thermal Physics",
      explanation: "For any completely reversible Carnot cycle, Delta S_system = 0 and Delta S_surroundings = (-Q_hot / T_hot) + (Q_cold / T_cold) = -1200/600 + 600/300 = -2 + 2 = 0. Therefore, Delta S_universe = 0 J/K."
    }
  ],
  medical: [
    {
      question: "A 58-year-old male presents with acute crushing substernal chest pain. The 12-lead ECG reveals 3mm ST-segment elevation with hyperacute T waves in leads II, III, and aVF, along with reciprocal ST depression in leads I and aVL. Which coronary artery is most likely occluded?",
      options: ["Right Coronary Artery (RCA)", "Left Anterior Descending (LAD)", "Left Circumflex Artery (LCx)", "Left Main Coronary Artery (LMCA)"],
      answer: 0,
      difficulty: "Expert (NEET-PG / NEXT / Clinical)",
      subject: "Cardiology",
      explanation: "Leads II, III, and aVF reflect the inferior wall of the left ventricle. Inferior STEMI is caused by acute thrombotic occlusion of the Right Coronary Artery (RCA) in ~85-90% of cases (or dominant LCx in ~10-15%)."
    },
    {
      question: "An arterial blood gas (ABG) analysis from an ICU patient shows: pH = 7.24, PaCO2 = 28 mmHg, and HCO3- = 12 mEq/L. The patient's serum Na+ = 140 mEq/L and Cl- = 100 mEq/L. What is the primary acid-base disorder and anion gap status?",
      options: ["High Anion Gap Metabolic Acidosis with respiratory compensation", "Normal Anion Gap (Hyperchloremic) Metabolic Acidosis", "Primary Respiratory Acidosis with renal compensation", "Mixed Metabolic and Respiratory Alkalosis"],
      answer: 0,
      difficulty: "Expert (NEET-PG / Critical Care)",
      subject: "Emergency Medicine",
      explanation: "pH < 7.35 and HCO3- < 22 indicates primary metabolic acidosis. Anion Gap = Na - (Cl + HCO3) = 140 - (100 + 12) = 28 mEq/L (Normal is 8-12 mEq/L). Winter's formula expected PaCO2 = 1.5 * 12 + 8 +/- 2 = 26 +/- 2 = 24-28 mmHg, matching the measured PaCO2 = 28 mmHg (appropriate respiratory compensation)."
    },
    {
      question: "A 45-year-old female presents with progressive proximal muscle weakness, ptosis, and diplopia that worsens toward the evening. A diagnostic Tensilon (edrophonium) test rapidly improves her symptoms. What is the underlying pathophysiological mechanism?",
      options: ["Autoantibodies against postsynaptic nicotinic acetylcholine receptors (AChR)", "Autoantibodies against presynaptic voltage-gated calcium channels (VGCC)", "Immune-mediated demyelination of peripheral motor axons", "Trinucleotide repeat expansion in the DMPK gene"],
      answer: 0,
      difficulty: "Expert (NEXT / Neurology)",
      subject: "Neurology",
      explanation: "The clinical presentation is classic for Myasthenia Gravis, characterized by IgG autoantibodies targeting postsynaptic nicotinic Acetylcholine Receptors (AChR) at the neuromuscular junction, leading to receptor degradation and fatigable muscle weakness."
    },
    {
      question: "In pharmacokinetics, if a drug exhibits first-order elimination kinetics with an elimination half-life (t1/2) of 6 hours, what percentage of the initial intravenous bolus dose remains in the body after 24 hours?",
      options: ["6.25%", "12.5%", "3.125%", "25.0%"],
      answer: 0,
      difficulty: "Hard (Pharmacology)",
      subject: "Pharmacology",
      explanation: "24 hours corresponds to 24 / 6 = 4 half-lives. Percentage remaining = (1/2)^4 * 100% = 1/16 * 100% = 6.25%."
    }
  ],
  commerce: [
    {
      question: "Under the Capital Asset Pricing Model (CAPM), if the risk-free rate is 6%, the expected market return is 14%, and a company's stock has a beta coefficient of 1.4, what is the company's theoretical cost of equity capital?",
      options: ["17.20%", "15.60%", "19.60%", "14.80%"],
      answer: 0,
      difficulty: "Hard (CAT / CFA / CA Final)",
      subject: "Corporate Finance",
      explanation: "CAPM formula: Cost of Equity K_e = R_f + Beta * (E(R_m) - R_f) = 6% + 1.4 * (14% - 6%) = 6% + 1.4 * 8% = 6% + 11.2% = 17.20%."
    },
    {
      question: "According to the Modigliani-Miller Theorem with corporate income taxes (Tax Rate = Tc), how does the value of a levered firm (V_L) compare to an identical unlevered firm (V_U) carrying debt D?",
      options: ["V_L = V_U + (Tc * D)", "V_L = V_U - (Tc * D)", "V_L = V_U (Tax invariant)", "V_L = V_U / (1 - Tc)"],
      answer: 0,
      difficulty: "Hard (CFA / Advanced Financial Economics)",
      subject: "Financial Theory",
      explanation: "In Modigliani-Miller Proposition I with corporate taxes, interest expense is tax-deductible. The present value of the debt tax shield equals Tc * D, so V_L = V_U + (Tc * D)."
    }
  ],
  arts: [
    {
      question: "In Indian Constitutional Jurisprudence, which landmark Supreme Court Constitution Bench ruling definitively established the 'Basic Structure Doctrine', restricting Parliament's amending power under Article 368?",
      options: ["Kesavananda Bharati v. State of Kerala (1973)", "Golaknath v. State of Punjab (1967)", "Minerva Mills v. Union of India (1980)", "Maneka Gandhi v. Union of India (1978)"],
      answer: 0,
      difficulty: "Hard (CLAT-PG / UPSC Civil Services)",
      subject: "Constitutional Law",
      explanation: "In Kesavananda Bharati (1973) (13-judge bench, 7-6 verdict), the Supreme Court ruled that while Parliament has wide amending powers under Article 368, it cannot alter or abrogate the Basic Structure of the Indian Constitution."
    },
    {
      question: "In the Law of Torts, under which doctrine is an enterprise engaged in a hazardous or inherently dangerous industry held strictly liable for damages resulting from an escape, with NO exceptions or defenses (such as Act of God or third-party intervention)?",
      options: ["Absolute Liability (M.C. Mehta v. Union of India)", "Strict Liability (Rylands v. Fletcher)", "Res Ipsa Loquitur", "Volenti Non Fit Injuria"],
      answer: 0,
      difficulty: "Hard (CLAT / Law)",
      subject: "Law of Torts",
      explanation: "The Supreme Court of India in M.C. Mehta v. Union of India (Oleum Gas Leak case, 1987) established the doctrine of Absolute Liability, which removed the Rylands v. Fletcher exceptions for hazardous/toxic industrial operations."
    }
  ],
  vocational: [
    {
      question: "In Industrial Automation and PLC programming, what does the 'Scan Cycle' of a Programmable Logic Controller strictly consist of, in chronological execution order?",
      options: ["1. Read Physical Inputs -> 2. Execute Ladder Logic Program -> 3. Update Outputs & Diagnostics", "1. Execute Logic -> 2. Read Inputs -> 3. Write Memory", "1. Write Outputs -> 2. Read Inputs -> 3. Wait for Interrupt", "1. Clock Reset -> 2. Read Sensor Analog -> 3. Power Down"],
      answer: 0,
      difficulty: "Hard (AITT / Industrial Automation)",
      subject: "Electrical & Instrumentation",
      explanation: "The PLC continuous scan cycle performs: 1) Input Scan (samples all input image registers), 2) Logic/Program Scan (processes ladder logic rungs sequentially), 3) Output Scan (energizes/de-energizes physical output coils and handles communication/diagnostics)."
    }
  ]
};

router.get("/mcq", (req, res) => {
  const stream = req.query.stream || "science";
  const exam = req.query.exam || "";
  const requested = Number(req.query.count || 20);
  const count = Math.min(500, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 20));

  const streamBank = ADVANCED_MCQ_BANK[stream] || ADVANCED_MCQ_BANK.science;
  const questions = [];

  for (let i = 0; i < count; i++) {
    const rawQ = streamBank[i % streamBank.length];
    // Randomize the answer options order dynamically on every call!
    const randomizedQ = shuffleQuestion(rawQ);
    questions.push(randomizedQ);
  }

  res.json({
    success: true,
    data: {
      stream,
      exam,
      count,
      unlimitedPractice: true,
      questions,
    },
  });
});

router.get("/pathways/:streamId",(req,res)=>{
  const streamId = req.params.streamId === "medical" ? "medical" : req.params.streamId;
  const modulesList = STREAM_MODULES[streamId] || STREAM_MODULES.science;
  const stream = STREAMS.find(s=>s.id===req.params.streamId) || STREAMS[0];
  const families = CAREER_FAMILIES.filter(f=>
    f.after.some(x=>x.toLowerCase().includes(req.params.streamId==="science"?"12th science":req.params.streamId)) ||
    (req.params.streamId === "medical" && (f.id === "medical" || f.id === "medical-pg"))
  );
  
  res.json({
    success:true,
    data:{
      stream,
      modules: modulesList.map((m,i)=>({
        id:`${streamId}-${i+1}`,
        title: m.title,
        description: m.description,
        topics: m.topics || [],
        duration: m.duration || "4 Weeks",
        resources: m.resources || [],
        checkpoints: m.checkpoints || [],
        position: i+1
      })),
      careerFamilies: families
    }
  });
});

module.exports={router,EXAMS,STREAMS,TED_TALKS,CAREER_FAMILIES,STREAM_MODULES};
