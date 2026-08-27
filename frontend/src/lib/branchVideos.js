// Free Branch Foundation & Orientation Video Library
// Verified educational masterclasses for prospective scholars exploring their branch

export const BRANCH_FREE_VIDEOS = {
  // ==========================================
  // ENGINEERING & TECHNOLOGY BRANCHES
  // ==========================================
  cse: [
    {
      id: "cse-1",
      title: "Early Computing & Algorithms: Crash Course Computer Science #1",
      instructor: "Carrie Anne Philbin · Crash Course Computer Science",
      duration: "12 min masterclass",
      videoUrl: "https://www.youtube.com/embed/O5nskjZ_GoI",
      description: "From the abacus and mechanical step-reckoners to binary logic gates and Boolean algebra, discover the foundational origins of computational systems.",
      topics: ["Binary Logic & Boolean Algebra", "Mechanical Computation", "Algorithmic Complexity"],
      badge: "Free Foundation"
    },
    {
      id: "cse-2",
      title: "Electronic Computing & Logic Gates: Crash Course Computer Science #2",
      instructor: "Carrie Anne Philbin · Crash Course Computer Science",
      duration: "10 min preview",
      videoUrl: "https://www.youtube.com/embed/LN0ucKNX0hc",
      description: "How relays, vacuum tubes, and silicon transistors compute binary logic operations at the hardware layer.",
      topics: ["Silicon Transistors", "Vacuum Tubes", "Hardware Logic"],
      badge: "Programming Core"
    },
    {
      id: "cse-3",
      title: "Boolean Logic & Logic Gates: Crash Course Computer Science #3",
      instructor: "Carrie Anne Philbin · Crash Course Computer Science",
      duration: "10 min preview",
      videoUrl: "https://www.youtube.com/embed/gI-qXk7XojA",
      description: "AND, OR, NOT, and XOR gate construction and building multi-bit adders from fundamental logic circuits.",
      topics: ["Logic Gate Diagrams", "Truth Tables", "ALU Construction"],
      badge: "Architecture"
    }
  ],

  it: [
    {
      id: "it-1",
      title: "Computer Networking Complete Course: TCP/IP & Infrastructure",
      instructor: "NetworkChuck / freeCodeCamp",
      duration: "35 min preview",
      videoUrl: "https://www.youtube.com/embed/IPvYjXCsTg8",
      description: "Overview of enterprise IT infrastructure, OSI model, IP addressing, DNS resolution, and packet routing.",
      topics: ["TCP/IP & Subnetting", "DNS & Routing", "Virtualization & Cloud"],
      badge: "Free Foundation"
    },
    {
      id: "it-2",
      title: "Electronic Computing & Server Infrastructure",
      instructor: "Crash Course Computer Science #2",
      duration: "10 min preview",
      videoUrl: "https://www.youtube.com/embed/LN0ucKNX0hc",
      description: "Hardware switches, compute pipelines, memory buses, and server rack fundamentals.",
      topics: ["Compute Pipelines", "Memory Buses", "System Architecture"],
      badge: "Systems Core"
    }
  ],

  aids: [
    {
      id: "aids-1",
      title: "AI & Machine Learning Foundations: But What is a Neural Network?",
      instructor: "Grant Sanderson · 3Blue1Brown",
      duration: "19 min masterclass",
      videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
      description: "A visual, mathematical journey into how neural networks learn, gradient descent, weights, biases, and loss optimization.",
      topics: ["Gradient Descent", "Supervised Learning", "Loss Optimization"],
      badge: "Free Foundation"
    },
    {
      id: "aids-2",
      title: "Transformer Models, Self-Attention & Generative AI Architecture",
      instructor: "Grant Sanderson · 3Blue1Brown",
      duration: "25 min masterclass",
      videoUrl: "https://www.youtube.com/embed/wjZofJX0v4M",
      description: "Attention mechanisms, vector embeddings, tokenization, and how large language models generate human-grade reasoning.",
      topics: ["Self-Attention", "Embeddings & Vectors", "Transformer Architecture"],
      badge: "Generative AI"
    }
  ],

  ece: [
    {
      id: "ece-1",
      title: "The History of Electrical Engineering: From Telegraphs to Microchips",
      instructor: "Dr. Shini Somara · Crash Course Engineering #4",
      duration: "10 min masterclass",
      videoUrl: "https://www.youtube.com/embed/3nB1Ntku06w",
      description: "Explore the fundamental principles of electrical engineering, electromagnetic fields, circuit design, and microelectronics.",
      topics: ["Semiconductor Physics", "Circuits & Voltage", "Microchips & Logic"],
      badge: "Free Foundation"
    },
    {
      id: "ece-2",
      title: "Circuit Analysis & Kirchhoff's Loop Laws",
      instructor: "Khan Academy Physics",
      duration: "11 min preview",
      videoUrl: "https://www.youtube.com/embed/R9i-z-d2y3s",
      description: "Understanding voltage drops, Kirchhoff's current/voltage laws, resistors, capacitors, and network circuit modeling.",
      topics: ["Kirchhoff's Laws", "Ohm's Law", "Series & Parallel Circuits"],
      badge: "Circuit Theory"
    }
  ],

  mech: [
    {
      id: "mech-1",
      title: "Mechanical Engineering: Mechanics, CAD & Thermodynamics",
      instructor: "Dr. Shini Somara · Crash Course Engineering #3",
      duration: "11 min masterclass",
      videoUrl: "https://www.youtube.com/embed/A1V-QQ5wFU4",
      description: "Statics, dynamics, stress-strain tensors, finite element analysis (FEA), and industrial robotic kinematics.",
      topics: ["Newtonian Mechanics", "Stress-Strain Analysis", "Robotic Kinematics"],
      badge: "Free Foundation"
    },
    {
      id: "mech-2",
      title: "First & Second Laws of Thermodynamics",
      instructor: "Khan Academy Physics",
      duration: "12 min preview",
      videoUrl: "https://www.youtube.com/embed/0kP18-B5H0c",
      description: "Conservation of energy, enthalpy, entropy, thermodynamic systems, heat engines, and Carnot efficiency.",
      topics: ["First Law of Thermo", "Entropy & Enthalpy", "Carnot Cycles"],
      badge: "Thermal Systems"
    }
  ],

  civil: [
    {
      id: "civil-1",
      title: "Civil Engineering: Structural Design of High-Rise Infrastructure & Bridges",
      instructor: "Crash Course Engineering #2",
      duration: "10 min masterclass",
      videoUrl: "https://www.youtube.com/embed/-xbtnz4wdaA",
      description: "Structural loading analysis, reinforced concrete design, earthquake resistance, and geotechnical foundations.",
      topics: ["Beam Loading & Trusses", "Geotechnical Mechanics", "Seismic Damping"],
      badge: "Free Foundation"
    },
    {
      id: "civil-2",
      title: "Biomedical & Industrial Infrastructure Engineering",
      instructor: "Crash Course Engineering #6",
      duration: "10 min preview",
      videoUrl: "https://www.youtube.com/embed/O6lENrRANxY",
      description: "Modern civil and biomedical engineering applications, urban planning, sanitation, and industrial facility design.",
      topics: ["Urban Planning", "Water Treatment Systems", "Industrial Infrastructure"],
      badge: "Smart Infra"
    }
  ],

  // ==========================================
  // MEDICAL & HEALTH SCIENCE BRANCHES
  // ==========================================
  mbbs: [
    {
      id: "mbbs-1",
      title: "Introduction to Anatomy & Clinical Physiology",
      instructor: "Crash Course Anatomy & Physiology #1",
      duration: "10 min masterclass",
      videoUrl: "https://www.youtube.com/embed/uBGl2BujkPQ",
      description: "Human gross anatomy, anatomical planes, directional terms, homeostasis, and systemic cellular physiology.",
      topics: ["Homeostasis", "Anatomical Terminology", "Systemic Physiology"],
      badge: "Free Foundation"
    },
    {
      id: "mbbs-2",
      title: "Meet the Heart! | Cardiovascular Anatomy & Hemodynamics",
      instructor: "Rishi Desai, MD · Khan Academy Medicine",
      duration: "14 min masterclass",
      videoUrl: "https://www.youtube.com/embed/kYy36761x-c",
      description: "Cardiac chambers, systemic vs pulmonary circulation, heart valve mechanics, cardiac conduction, and blood pressure regulation.",
      topics: ["Cardiac Cycle", "Valvular Mechanics", "Coronary Arteries"],
      badge: "Cardiovascular Core"
    },
    {
      id: "mbbs-3",
      title: "Anatomy of a Neuron & Neurophysiology",
      instructor: "Khan Academy Health & Medicine",
      duration: "12 min preview",
      videoUrl: "https://www.youtube.com/embed/ob5U8zPbAX4",
      description: "Central and peripheral nervous system organization, action potential propagation, myelin sheath, and synaptic neurotransmission.",
      topics: ["Action Potentials", "Synapses & Neurotransmitters", "CNS vs PNS"],
      badge: "Neuroanatomy"
    }
  ],

  bds: [
    {
      id: "bds-1",
      title: "Digestive & Craniofacial Anatomy: Oral Cavity & Tooth Morphology",
      instructor: "Crash Course Anatomy & Physiology #33",
      duration: "11 min masterclass",
      videoUrl: "https://www.youtube.com/embed/yIoTRGfcMqM",
      description: "Craniofacial anatomy, mastication mechanics, enamel/dentin/pulp structure, and oral disease pathology.",
      topics: ["Oral Cavity Anatomy", "Enamel & Dentin", "Mastication Mechanics"],
      badge: "Free Foundation"
    }
  ],

  ayush: [
    {
      id: "ayush-1",
      title: "Human Anatomy & Biological Homeostasis Systems",
      instructor: "Crash Course Anatomy & Physiology #1",
      duration: "10 min masterclass",
      videoUrl: "https://www.youtube.com/embed/uBGl2BujkPQ",
      description: "Innate body systems, systemic physiological balance, tissue restoration, and biological homeostasis principles.",
      topics: ["Cellular Homeostasis", "Physiological Systems", "Biological Balance"],
      badge: "Free Foundation"
    }
  ],

  pharm: [
    {
      id: "pharm-1",
      title: "G Protein-Coupled Receptors & Pharmacodynamics",
      instructor: "Khan Academy Health & Medicine",
      duration: "12 min masterclass",
      videoUrl: "https://www.youtube.com/embed/n5lX950s_t0",
      description: "Mechanisms of drug receptor binding, cellular transmembrane signaling, GPCR cascade, and pharmacokinetics (ADME).",
      topics: ["Receptor Binding & Signaling", "Transmembrane GPCR", "Pharmacodynamics"],
      badge: "Free Foundation"
    }
  ],

  nursing: [
    {
      id: "nursing-1",
      title: "Vital Signs Assessment, Blood Pressure & Clinical Nursing",
      instructor: "RegisteredNurseRN Clinical Skills",
      duration: "15 min masterclass",
      videoUrl: "https://www.youtube.com/embed/R2XMro13dD0",
      description: "Clinical patient assessment, manual blood pressure measurement, Korotkoff sounds, heart rate, and vitals monitoring.",
      topics: ["Blood Pressure Auscultation", "Korotkoff Sounds", "Patient Triage"],
      badge: "Free Foundation"
    }
  ],

  allied: [
    {
      id: "allied-1",
      title: "Physiotherapy & Allied Health: Human Movement & Kinesiology",
      instructor: "Crash Course Anatomy & Physiology #1",
      duration: "10 min masterclass",
      videoUrl: "https://www.youtube.com/embed/uBGl2BujkPQ",
      description: "Musculoskeletal alignment, joint kinematics, tissue repair, and clinical rehabilitative anatomy.",
      topics: ["Joint Mechanics", "Musculoskeletal Planes", "Rehab Biomechanics"],
      badge: "Free Foundation"
    }
  ],

  "medical-pg": [
    {
      id: "medpg-1",
      title: "Cardiovascular Pathology & Clinical Residency Masterclass",
      instructor: "Rishi Desai, MD · Khan Academy Medicine",
      duration: "14 min masterclass",
      videoUrl: "https://www.youtube.com/embed/kYy36761x-c",
      description: "Advanced cardiac hemodynamics, myocardial ischemia localization, valve disease assessment, and clinical rounds preparation.",
      topics: ["Ischemia Localization", "Cardiac Output", "Clinical Diagnostic Strategy"],
      badge: "Free Foundation"
    }
  ]
};

// Helper to retrieve videos safely for any branch ID
export function getBranchFreeVideos(branchId = "cse") {
  return BRANCH_FREE_VIDEOS[branchId] || BRANCH_FREE_VIDEOS.cse;
}

