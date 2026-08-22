// Mock data layer. In production this would live in a real database
// (Postgres/MongoDB) — kept as structured JS objects here so the API
// contract is easy to swap over later without touching route logic.

const streams = [
  {
    id: "engineering",
    name: "Engineering",
    tagline: "Build the systems, machines, and software that run the world",
    description:
      "A 4-year degree (B.E./B.Tech) focused on applying math and science to design and build things — from software to bridges to circuits.",
    avgDuration: "4 years",
    available: true,
  },
  {
    id: "medical",
    name: "Medical & Health Sciences",
    tagline: "Diagnose, treat, and care for people",
    description: "MBBS, BDS, Nursing, Pharmacy and allied health degrees.",
    avgDuration: "4.5–5.5 years",
    available: false,
  },
  {
    id: "commerce",
    name: "Commerce & Finance",
    tagline: "Understand money, markets, and business",
    description: "B.Com, BBA, CA, CFA and finance-track degrees.",
    avgDuration: "3 years",
    available: false,
  },
  {
    id: "design",
    name: "Design",
    tagline: "Shape how products look, feel, and work",
    description: "UX/UI, product design, and industrial design programs.",
    avgDuration: "4 years",
    available: false,
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    tagline: "Study society, language, culture, and ideas",
    description: "Law, psychology, journalism, literature and social science degrees.",
    avgDuration: "3 years",
    available: false,
  },
];

const branches = [
  {
    id: "cse",
    name: "Computer Science & Engineering",
    short: "CSE",
    demand: "Very High",
    tagline: "Software, algorithms, and systems — the broadest IT entry point",
    coreFocus: ["Programming", "Data Structures", "Systems", "Software Engineering"],
  },
  {
    id: "it",
    name: "Information Technology",
    short: "IT",
    demand: "High",
    tagline: "Applied computing — networks, databases, and enterprise software",
    coreFocus: ["Networking", "Databases", "Web Development", "Cloud Infra"],
  },
  {
    id: "aids",
    name: "AI & Data Science",
    short: "AI & DS",
    demand: "Very High",
    tagline: "Machine learning, statistics, and data-driven systems",
    coreFocus: ["Statistics", "Machine Learning", "Data Engineering", "Deep Learning"],
  },
  {
    id: "ece",
    name: "Electronics & Communication",
    short: "ECE",
    demand: "High",
    tagline: "Hardware, embedded systems, and signal processing",
    coreFocus: ["Circuits", "Embedded Systems", "VLSI", "Communication Systems"],
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    short: "Mech",
    demand: "Moderate",
    tagline: "Design and build physical machines and systems",
    coreFocus: ["Thermodynamics", "CAD/CAM", "Robotics", "Manufacturing"],
  },
  {
    id: "civil",
    name: "Civil Engineering",
    short: "Civil",
    demand: "Moderate",
    tagline: "Design and construct infrastructure — buildings, roads, bridges",
    coreFocus: ["Structural Design", "Construction Tech", "Surveying", "Urban Planning"],
  },
];

// Semester-wise / skill-wise roadmap per branch
const roadmaps = {
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
};

// Beginner -> Advanced project suggestions per branch
const projects = {
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
};

// Emerging / in-demand job roles per branch (forward-looking)
const jobs = {
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
};

module.exports = { streams, branches, roadmaps, projects, jobs };
