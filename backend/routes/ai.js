const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { supabase } = require("../lib/supabase");

const router = express.Router();

// Curated verified 1080p HD video masterclasses for various domain disciplines
const CURATED_VIDEO_STREAMS = {
  ai: "https://www.youtube.com/embed/aircAruvnKk",
  transformers: "https://www.youtube.com/embed/IHZwWFHWa-w",
  cloud: "https://www.youtube.com/embed/Y6Ev8GIsS3E",
  devops: "https://www.youtube.com/embed/bXb9dJ2bOls",
  medical: "https://www.youtube.com/embed/F_KjW0nI8Hk",
  design: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
  electronics: "https://www.youtube.com/embed/eIho2S0ZahI",
  general: "https://www.youtube.com/embed/_X0mgOOSpLU",
};

function selectVideoForTopic(topic = "") {
  const lower = topic.toLowerCase();
  if (lower.includes("transformer") || lower.includes("llm") || lower.includes("gpt")) return CURATED_VIDEO_STREAMS.transformers;
  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("neural") || lower.includes("deep learning")) return CURATED_VIDEO_STREAMS.ai;
  if (lower.includes("cloud") || lower.includes("distributed") || lower.includes("kubernetes") || lower.includes("kafka")) return CURATED_VIDEO_STREAMS.cloud;
  if (lower.includes("medical") || lower.includes("health") || lower.includes("doctor") || lower.includes("cardiology") || lower.includes("ecg") || lower.includes("anatomy")) return CURATED_VIDEO_STREAMS.medical;
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("figma") || lower.includes("product")) return CURATED_VIDEO_STREAMS.design;
  if (lower.includes("devops") || lower.includes("docker") || lower.includes("api") || lower.includes("backend")) return CURATED_VIDEO_STREAMS.devops;
  return CURATED_VIDEO_STREAMS.ai;
}

// AI Course Generation Synthesis Logic
function synthesizeCourseContent(prompt, category = "Software & AI", streamId = "science", level = "Advanced", moduleCount = 4) {
  const topicTitle = prompt.trim() || "Advanced Autonomous Systems & Computing";
  const primaryVideo = selectVideoForTopic(topicTitle);

  const modules = [];
  const moduleTemplates = [
    {
      suffix: "Foundations, Mathematical Frameworks & Architecture",
      desc: "Core theoretical principles, mathematical formulations, and environmental setup.",
      duration: "2h 30m",
      lessons: [
        { title: "Theoretical Foundations & Axiomatic Formulation", duration: "35:00", isPreview: true },
        { title: "Tooling Setup, Architecture Diagrams & Environment", duration: "45:00", isPreview: true },
        { title: "Core Data Structures & Algorithmic Workflows", duration: "70:00", isPreview: true }
      ],
      checkpoint: "Pass the foundational diagnostics checkpoint with 80%+ score."
    },
    {
      suffix: "Deep Implementation & Core Engineering Patterns",
      desc: "Step-by-step modular code development, optimization techniques, and error handling.",
      duration: "3h 15m",
      lessons: [
        { title: "Custom Class Architecture & Pipeline Design", duration: "50:00", isPreview: false },
        { title: "State Management, Vector Computations & Optimization", duration: "65:00", isPreview: false },
        { title: "Handling Edge Cases, Asynchronous Flow & Concurrency", duration: "80:00", isPreview: false }
      ],
      checkpoint: "Construct and run the end-to-end processing pipeline locally."
    },
    {
      suffix: "Production Scaling, System Integration & Auditing",
      desc: "Scaling bottlenecks, containerization, microservices integration, and security audits.",
      duration: "2h 45m",
      lessons: [
        { title: "Containerization (Docker) & Orchestration Blueprints", duration: "45:00", isPreview: false },
        { title: "Performance Benchmarking, Latency Profiling & Memory Caps", duration: "50:00", isPreview: false },
        { title: "Security Protocols, API Gateway Routing & CI/CD", duration: "70:00", isPreview: false }
      ],
      checkpoint: "Deploy a live containerized service with automated unit test suites."
    },
    {
      suffix: "Capstone Project, Industry Case Studies & Deployment",
      desc: "Real-world portfolio capstone build, performance evaluation, and career blueprint.",
      duration: "4h 00m",
      lessons: [
        { title: "Architecture Blueprint Review & Spec Finalization", duration: "40:00", isPreview: false },
        { title: "Full System Implementation & Stress Testing", duration: "110:00", isPreview: false },
        { title: "Publishing Documentation, Schema Definition & Demo", duration: "90:00", isPreview: false }
      ],
      checkpoint: "Submit verified capstone project repository with live demonstration."
    },
    {
      suffix: "Advanced Optimization, Research Frontiers & Specialization",
      desc: "State-of-the-art research papers, novel architectures, and next-generation paradigm shifts.",
      duration: "3h 00m",
      lessons: [
        { title: "Paper Deconstruction: Landmark Discoveries & Benchmarks", duration: "50:00", isPreview: false },
        { title: "Hardware Acceleration (CUDA/TPU/ASIC) & Quantization", duration: "65:00", isPreview: false },
        { title: "Future Trajectories, Governance & Production Blueprints", duration: "65:00", isPreview: false }
      ],
      checkpoint: "Write an architectural evaluation report comparing 3 modern production frameworks."
    }
  ];

  const targetCount = Math.min(5, Math.max(3, Number(moduleCount) || 4));

  for (let i = 0; i < targetCount; i++) {
    const template = moduleTemplates[i % moduleTemplates.length];
    modules.push({
      id: `ai-mod-${i + 1}`,
      position: i + 1,
      title: `Module ${i + 1}: ${topicTitle} — ${template.suffix}`,
      description: template.desc,
      duration: template.duration,
      videoUrl: primaryVideo,
      isFreePreview: i === 0,
      lessons: template.lessons.map((l, lIdx) => ({
        id: `ai-l-${i + 1}-${lIdx + 1}`,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        videoUrl: primaryVideo
      })),
      checkpoint: template.checkpoint
    });
  }

  return {
    id: `course-${Date.now()}`,
    title: `${topicTitle}: Mastery & Systems Engineering`,
    subtitle: `Complete production curriculum covering theory, hands-on architectures, and live deployments.`,
    category,
    streamId,
    level,
    price: 999,
    originalPrice: 2499,
    videoDuration: `${targetCount * 2.5}h Total Content`,
    trailerVideoUrl: primaryVideo,
    trailerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    description: `A masterclass designed to take you from foundational mathematics and domain principles to production-grade implementation of ${topicTitle}. You will master end-to-end architectures, containerized deployments, and diagnostic workflows.`,
    outcomes: [
      `Deconstruct and architect high-performance ${topicTitle} systems from scratch.`,
      `Implement production-grade pipelines with automated error handling and telemetry.`,
      `Deploy scalable services adhering to industry standard reliability and security benchmarks.`,
      `Build a verified portfolio capstone project showcasing deep domain competence.`
    ],
    curriculumSummary: `${targetCount} modules • ${targetCount * 3}h total study time`,
    curriculum: modules
  };
}

// POST /api/ai/generate-course
router.post("/generate-course", async (req, res) => {
  const { topic, category, streamId, level, modulesCount } = req.body || {};

  if (!topic || !topic.trim()) {
    return res.status(400).json({ success: false, message: "Course topic or prompt is required." });
  }

  try {
    const course = synthesizeCourseContent(
      topic.trim(),
      category || "Software & AI Systems",
      streamId || "science",
      level || "Advanced",
      modulesCount || 4
    );

    res.json({
      success: true,
      data: course
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "AI generation failed." });
  }
});

// POST /api/ai/publish-generated-course
// Inserts the generated course and modules directly into SQLite & Supabase
router.post("/publish-generated-course", requireAuth, async (req, res) => {
  const { course } = req.body || {};
  if (!course || !course.title) {
    return res.status(400).json({ success: false, message: "Course payload is required" });
  }

  try {
    // 1. Insert course into SQLite
    const pricePaise = Math.round(Number(course.price || 999) * 100);
    const courseInfo = db
      .prepare(
        `INSERT INTO courses (instructor_id, title, description, category, stream_id, price_paise, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'published')`
      )
      .run(
        req.user.id,
        course.title,
        course.description || "",
        course.category || "General",
        course.streamId || "science",
        pricePaise
      );

    const newCourseId = courseInfo.lastInsertRowid;

    // 2. Insert modules into SQLite
    if (Array.isArray(course.curriculum)) {
      const insertModStmt = db.prepare(
        `INSERT INTO course_modules (course_id, title, description, video_url, resource_url, position)
         VALUES (?, ?, ?, ?, ?, ?)`
      );

      for (let i = 0; i < course.curriculum.length; i++) {
        const mod = course.curriculum[i];
        insertModStmt.run(
          newCourseId,
          mod.title,
          mod.description || "",
          mod.videoUrl || "",
          "",
          i + 1
        );
      }
    }

    // 3. Non-blocking sync to Supabase Cloud
    if (supabase) {
      supabase
        .from("courses")
        .upsert({
          id: String(newCourseId),
          title: course.title,
          instructor_id: req.user.id,
          category: course.category,
          stream_id: course.streamId,
          price: Number(course.price || 999),
          description: course.description,
          status: "published",
          trailer_video_url: course.trailerVideoUrl || "",
        })
        .then(() => console.log("⚡ AI Course synced to Supabase Cloud:", course.title))
        .catch((e) => console.log("ℹ️ Supabase course sync notice:", e.message));
    }

    res.status(201).json({
      success: true,
      data: {
        id: newCourseId,
        message: `Course "${course.title}" published with ${course.curriculum?.length || 0} modules!`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to publish generated course" });
  }
});

// POST /api/ai/summarize-content
// Generates contextual lecture summaries, formulas, and flashcard takeaways based on the video/topic
router.post("/summarize-content", async (req, res) => {
  const { topic = "", title = "Lecture Video", moduleName = "" } = req.body || {};
  const query = `${title} ${topic} ${moduleName}`.toLowerCase();

  let summaryData = {
    title: title || "Lecture Key Takeaways",
    executiveSummary: `This lecture provides a comprehensive deep dive into ${title}. It establishes foundational mathematical principles, explores concrete architectural trade-offs, and details practical deployment and diagnostic workflows.`,
    keyTakeaways: [
      `Mastered core mechanisms and formal formulations underlying ${title}.`,
      `Identified standard production failure modes, concurrency bottlenecks, and optimization patterns.`,
      `Synthesized hands-on testing workflows and verification checklists for real-world projects.`,
    ],
    formulasAndRules: [
      `Axiom 1: Always minimize state mutation and isolate non-deterministic dependencies.`,
      `Formula: Expected Latency $E[T] = T_{\\text{proc}} + \\frac{\\rho}{1 - \\rho} \\cdot T_{\\text{service}}$ under Poisson arrival queues.`,
      `Safety Protocol: Verify cryptographic signature / clinical baseline before proceeding with state transition.`,
    ],
    examFlashcards: [
      {
        question: `What is the primary architectural advantage of ${title}?`,
        answer: `Enables decoupled asynchronous throughput and deterministic fault isolation without centralized bottlenecking.`,
      },
      {
        question: `How should edge-case failures be handled during execution?`,
        answer: `Implement exponential backoff retry policies, fallback degraded modes, and structured telemetry logging.`,
      },
    ],
  };

  if (query.includes("cardio") || query.includes("ecg") || query.includes("med") || query.includes("triage")) {
    summaryData = {
      title: title || "Clinical Medicine & ECG Takeaways",
      executiveSummary: `Mastered systematic 12-lead ECG interpretation, localization of ST-elevation myocardial infarctions (STEMI), and acute emergency resuscitation protocols.`,
      keyTakeaways: [
        `Systematic ECG audit sequence: Rate → Rhythm (P-wave morphology) → Axis → Intervals (PR, QRS, QTc) → ST-T segments.`,
        `Inferior STEMI (Leads II, III, aVF; RCA occlusion) requires avoiding nitrates if RV infarction is suspected.`,
        `Immediate ABCDE emergency casualty triage takes precedence before confirmatory biomarker assays.`,
      ],
      formulasAndRules: [
        `Bazett's Formula for Corrected QT: $QTc = \\frac{QT}{\\sqrt{RR}}$ (Normal: < 450ms in males, < 460ms in females).`,
        `Winter's Formula for Metabolic Acidosis: $Expected\\ pCO_2 = 1.5 \\times [HCO_3^-] + 8 \\pm 2$.`,
        `Anion Gap $= [Na^+] - ([Cl^-] + [HCO_3^-])$ (Normal: 8 - 12 mEq/L).`,
      ],
      examFlashcards: [
        {
          question: `In acute STEMI, what is the door-to-balloon time benchmark for primary PCI?`,
          answer: `Under 90 minutes from presentation to cardiac catheterization lab inflation.`,
        },
        {
          question: `What is the classic ECG finding in acute pericarditis vs STEMI?`,
          answer: `Diffuse concave upward ST elevation with PR segment depression across multiple non-contiguous leads.`,
        },
      ],
    };
  } else if (query.includes("transformer") || query.includes("attention") || query.includes("neural") || query.includes("ai")) {
    summaryData = {
      title: title || "Transformer & Neural Architecture Takeaways",
      executiveSummary: `Deconstructs self-attention mechanisms, multi-head projections, positional embeddings, and residual normalization layers in transformer architectures.`,
      keyTakeaways: [
        `Scaled Dot-Product Attention: $Attention(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ solves vanishing gradient issues with large projection dimensions.`,
        `Multi-Head Attention allows the model to jointly attend to information at different representation subspaces.`,
        `Rotary Positional Embeddings (RoPE) and LayerNorm pre-layernorm placements significantly stabilize deep model training.`,
      ],
      formulasAndRules: [
        `Computational Complexity: $O(N^2 \\cdot d)$ memory and FLOPs where $N$ is context sequence length and $d$ is embedding dimension.`,
        `AdamW Weight Decay: $\\theta_{t+1} = \\theta_t - \\eta_t \\left( \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon} + \\lambda \\theta_t \\right)$.`,
      ],
      examFlashcards: [
        {
          question: `Why is scaling factor $\\sqrt{d_k}$ used in dot-product attention?`,
          answer: `For large $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients.`,
        },
        {
          question: `What is the key difference between FlashAttention and standard self-attention?`,
          answer: `FlashAttention utilizes GPU SRAM tiling and kernel fusion to compute exact softmax without materializing the $N \\times N$ intermediate attention matrix in High Bandwidth Memory (HBM).`,
        },
      ],
    };
  }

  res.json({ success: true, data: summaryData });
});

// POST /api/ai/help-assistant
// Universal AI Campus Assistant & 24/7 Help Centre
router.post("/help-assistant", async (req, res) => {
  const { query = "", history = [] } = req.body || {};
  const q = query.toLowerCase();

  let reply = "";
  let suggestedPills = [];

  if (q.includes("branch") || q.includes("stream") || q.includes("pcm") || q.includes("pcb") || q.includes("12th")) {
    reply = `🎓 **Stream & Branch Guidance**:
- **Engineering (PCM)**: Computer Science (CSE), AI & Data Engineering, Electronics (ECE), and Aerospace are high-demand pathways. Start in the **Engineering Pathways** tab to view semester roadmaps and salary benchmarks.
- **Medical (PCB)**: Explore **MBBS, BDS, and Allied Health Sciences** in our **Medical Universe** section with clinical case audits and PG entrance prep.
- **Aptitude Quiz**: You can take our **15-question AI Career Aptitude Assessment** to receive personalized scientific stream recommendations!`;
    suggestedPills = ["Take Career Aptitude Test", "Explore Engineering Branches", "View Medical Universe"];
  } else if (q.includes("drm") || q.includes("screen") || q.includes("record") || q.includes("protect") || q.includes("patent")) {
    reply = `🔒 **DRM & Intellectual Property Shield**:
Backlox employs an active DRM Shield that protects video masterclasses and proprietary course notes:
1. **Dynamic Scholar Watermarking**: Overlays your verified ID to deter camcorder recording.
2. **Keyboard Shortcut Blocking**: Disables \`PrintScreen\`, \`Ctrl+P\` (Print), \`Ctrl+S\` (Save), and DevTools inspection.
3. **Anti-Capture Enforcement**: Complies with copyright and educational patent protections.`;
    suggestedPills = ["How to enroll in courses?", "Open Study Notes", "Take Stress Test"];
  } else if (q.includes("stress") || q.includes("meter") || q.includes("breath") || q.includes("relax")) {
    reply = `⚡ **Cognitive Stress & Focus Meter**:
The Cognitive Stress Meter in the bottom-left monitor tracks your session interaction density and study duration:
- **Radial Gauge**: Visualizes stress levels ($0\\% - 100\\%$) with color-coded safety tiers.
- **60s Box Breathing Tool**: Click **"Recharge Mind"** to activate guided Inhale $\\rightarrow$ Hold $\\rightarrow$ Exhale $\\rightarrow$ Rest cycles that actively reduce fatigue.`;
    suggestedPills = ["Start Box Breathing", "Practice MCQs", "Switch Light/Dark Theme"];
  } else if (q.includes("note") || q.includes("save") || q.includes("notes")) {
    reply = `📝 **Smart Study Notes Pad**:
You can record timestamped lecture notes directly while watching video masterclasses:
- Click **"📝 Take Notes"** on any course page to open the collapsible drawer.
- Notes are automatically tagged with the current module and synced to your profile.
- You can export notes anytime to Markdown or PDF!`;
    suggestedPills = ["View My Notes", "Open Course Catalog", "Summarize Lecture with AI"];
  } else if (q.includes("pay") || q.includes("razorpay") || q.includes("pro") || q.includes("price") || q.includes("buy")) {
    reply = `💳 **Razorpay Secure Checkout & Plans**:
- **Backlox Lifetime Pro** (₹499): Lifetime unrestricted access to all 35+ engineering, medical, and competitive prep courses.
- **Per-Course Enrollment**: Click **"⚡ Enroll with Razorpay"** on any course page. Module 1 is always available as a Free Preview!
- All payments are secured via Razorpay UPI, Cards, NetBanking, and verified with cryptographic HMAC signatures.`;
    suggestedPills = ["View Pro Plans", "Browse Free Preview Courses", "Payment Support"];
  } else {
    reply = `🎓 **Octi (Your Academic Companion)**:
Hey there, Scholar! I'm Octi, your dedicated academic companion across the Backlox Universe. I can illuminate career pathways, break down salary benchmarks, summarize complex video lectures, solve competitive exam MCQs (JEE, NEET, GATE, CAT, CLAT), and keep your study journey on track!

What can I help you explore today?`;
    suggestedPills = [
      "Recommend best stream for me",
      "Explain Transformer Self-Attention",
      "Explain 12-Lead ECG STEMI",
      "How to publish a course as instructor?",
    ];
  }

  res.json({
    success: true,
    data: {
      reply,
      suggestedPills,
    },
  });
});

module.exports = router;
