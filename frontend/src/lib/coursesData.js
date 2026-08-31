// Unified Course & Curriculum Database with Dynamic Progress Engine

export const COURSE_CATALOG = {
  "feat-1": {
    id: "feat-1",
    title: "Advanced Machine Learning & Neural Transformers",
    category: "Software & AI",
    streamId: "science",
    branchId: "cse",
    level: "Advanced",
    instructor: "Dr. Eleanor Vance (Ex-DeepMind)",
    rating: 4.9,
    reviewsCount: "1,420",
    studentsCount: 142,
    price: 1499,
    originalPrice: 2999,
    videoDuration: "3:40 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    trailerImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
    description: "Master modern deep learning, transformer architectures, reinforcement learning, and production MLOps pipelines.",
    curriculumSummary: "3 modules • 14h 20m",
    curriculum: [
      {
        id: "mod-1",
        number: 1,
        title: "Foundations of Deep Learning & PyTorch",
        codeSnippet: "Using Spreadsheet Like An Expert\nimport pandas as pd\ndf = pd.read_csv(\"analytics.csv\")",
        isFreePreview: true,
        duration: "1h 40m",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        assignment: {
          id: 1,
          title: "Using Spreadsheet & Pandas Like An Expert",
          description: "Clean the raw dataset, perform multi-level pivot table transformations, and output executive KPI visualizations.",
          starterCode: "import pandas as pd\nimport numpy as np\n\ndef clean_telemetry(df: pd.DataFrame) -> pd.DataFrame:\n    return df",
          due: "Completed",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-1", title: "Backpropagation & Computational Graphs", duration: "25:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-2", title: "Custom Loss Functions & Optimizers (AdamW)", duration: "30:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-3", title: "PyTorch Tensor Operations & GPU Acceleration", duration: "45:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
        ],
      },
      {
        id: "mod-2",
        number: 2,
        title: "Transformer Architectures & Self-Attention",
        codeSnippet: "PyTorch Attention & Self-Attention\nclass ScaledDotProductAttention(nn.Module):\n    # Causal Multi-Head Matrix",
        isFreePreview: false,
        duration: "2h 30m",
        videoUrl: "https://www.youtube.com/embed/wjZofJX0v4M",
        assignment: {
          id: 2,
          title: "PyTorch Attention Matrix & Scaled Softmax",
          description: "Implement multi-head attention projection and causal mask matrix from scratch in PyTorch.",
          starterCode: "import torch\nimport torch.nn as nn\nimport math\n\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    pass",
          due: "July 30, 2026",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-4", title: "Query, Key, Value Projections & Attention Heads", duration: "30:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/wjZofJX0v4M" },
          { id: "l-5", title: "Positional Encodings & Layer Normalization", duration: "35:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/wjZofJX0v4M" },
        ],
      },
      {
        id: "mod-3",
        number: 3,
        title: "Large Language Models & Distributed Fine-Tuning",
        codeSnippet: "Distributed Fine-Tuning\nfrom transformers import AutoModelForCausalLM\nmodel = AutoModelForCausalLM.from_pretrained(\"gpt2\")",
        isFreePreview: false,
        duration: "3h 15m",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        assignment: {
          id: 3,
          title: "LoRA Low-Rank Adapter Implementation",
          description: "Implement low-rank matrix decomposition (A and B matrices) to fine-tune a causal language model.",
          starterCode: "class LoRALayer(nn.Module):\n    pass",
          due: "August 20, 2026",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-6", title: "LoRA & QLoRA Parameter-Efficient Fine Tuning", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
          { id: "l-7", title: "vLLM Inference Engine & KV Cache Optimization", duration: "40:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/aircAruvnKk" },
        ],
      },
    ],
  },
  "feat-2": {
    id: "feat-2",
    title: "UX/UI Foundations & Scalable Design Systems",
    category: "Design & Product",
    streamId: "arts",
    branchId: "it",
    level: "Intermediate",
    instructor: "Marcus Thorne (Lead UX Architect)",
    rating: 4.8,
    reviewsCount: "1,204",
    studentsCount: 98,
    price: 999,
    originalPrice: 1999,
    videoDuration: "2:14 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
    trailerImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    description: "Design systems, typography grids, accessibility, and high-fidelity interactive prototyping for modern scale.",
    curriculumSummary: "2 modules • 6h 30m",
    curriculum: [
      {
        id: "mod-1",
        number: 1,
        title: "Introduction to UX Design Tokens",
        codeSnippet: ":root {\n  --color-primary: #6366f1;\n  --radius-lg: 16px;\n  --backdrop-blur: 20px;\n}",
        isFreePreview: true,
        duration: "45m",
        videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
        assignment: {
          id: 4,
          title: "Design System Token Architecture",
          description: "Establish semantic typography and color tokens with AAA contrast ratios in Figma & CSS variables.",
          starterCode: ":root {\n  --font-primary: 'Plus Jakarta Sans';\n}",
          due: "Completed",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-1", title: "Design Tokens & Micro-Interactions", duration: "15:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk" },
          { id: "l-2", title: "Information Architecture & Card Sorting", duration: "15:30", isPreview: true, videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk" },
        ],
      },
      {
        id: "mod-2",
        number: 2,
        title: "Advanced Component Variants & Auto-Layout",
        codeSnippet: "Component Architecture (Storybook Sync)\nexport const PrimaryButton = ({ label, icon }) => (\n  <button className=\"btn-primary\">{icon}{label}</button>\n);",
        isFreePreview: false,
        duration: "1h 30m",
        videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
        assignment: {
          id: 5,
          title: "Storybook Component Documentation",
          description: "Create accessible component variants with keyboard navigation and hover transitions.",
          starterCode: "import React from 'react';",
          due: "August 5, 2026",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-3", title: "Component Variants & Auto-Layout 4.0", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk" },
          { id: "l-4", title: "Design System Documentation & Storybook Sync", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk" },
        ],
      },
    ],
  },
  "feat-3": {
    id: "feat-3",
    title: "Clinical Medicine & Diagnostic Reasoning",
    category: "Medical & Health",
    streamId: "medical",
    branchId: "mbbs",
    level: "Intermediate / PG Prep",
    instructor: "Dr. Arvind Swaminathan (MD Cardiology)",
    rating: 4.95,
    reviewsCount: "2,350",
    studentsCount: 102,
    price: 1299,
    originalPrice: 2499,
    videoDuration: "4:10 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/uBGl2BujkPQ",
    trailerImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    description: "Master bedside clinical examination, 12-lead ECG interpretation, emergency casualty triage, and case study audits.",
    curriculumSummary: "2 modules • 11h 45m",
    curriculum: [
      {
        id: "mod-1",
        number: 1,
        title: "Bedside Cardiovascular & Chest Examination",
        codeSnippet: "Clinical Auscultation & S1/S2 Murmurs\n// Mitral Regurgitation: Pan-systolic murmur at apex radiating to axilla",
        isFreePreview: true,
        duration: "1h 00m",
        videoUrl: "https://www.youtube.com/embed/kYy36761x-c",
        assignment: {
          id: 6,
          title: "Auscultation & Heart Murmur Case Study",
          description: "Diagnose systolic vs diastolic heart sounds and document appropriate echocardiogram requisitions.",
          starterCode: "# Clinical diagnosis notes",
          due: "Completed",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-1", title: "Cardiovascular Bedside Auscultation & Heart Murmurs", duration: "25:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/kYy36761x-c" },
          { id: "l-2", title: "Cranial Nerve Neurological Reflex Testing", duration: "35:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/ob5U8zPbAX4" },
        ],
      },
      {
        id: "mod-2",
        number: 2,
        title: "12-Lead ECG Advanced Diagnostic Masterclass",
        codeSnippet: "12-Lead ECG Interpretation\n// Inferior STEMI: ST elevation in Leads II, III, aVF with reciprocal depression in I, aVL",
        isFreePreview: false,
        duration: "1h 30m",
        videoUrl: "https://www.youtube.com/embed/kYy36761x-c",
        assignment: {
          id: 7,
          title: "12-Lead ECG STEMI & Arrhythmia Triage",
          description: "Identify coronary artery occlusion vascular territories from 12-lead ECG strips.",
          starterCode: "# ECG analysis",
          due: "August 12, 2026",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-3", title: "ST-Elevation STEMI Localisation & Mimics", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/kYy36761x-c" },
          { id: "l-4", title: "Arrhythmias, Heart Blocks & Electrolyte Imbalances", duration: "45:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/kYy36761x-c" },
        ],
      },
    ],
  },
  "feat-4": {
    id: "feat-4",
    title: "Distributed Systems & Cloud Architecture",
    category: "Engineering & Cloud",
    streamId: "science",
    branchId: "cse",
    level: "Advanced",
    instructor: "Vikram Malhotra (Principal Cloud Architect)",
    rating: 4.9,
    reviewsCount: "1,890",
    studentsCount: 85,
    price: 1799,
    originalPrice: 3499,
    videoDuration: "3:15 Preview",
    trailerVideoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY",
    trailerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    description: "Scale applications across Kubernetes, microservices, Kafka event streaming, and multi-region cloud systems.",
    curriculumSummary: "2 modules • 18h 00m",
    curriculum: [
      {
        id: "mod-1",
        number: 1,
        title: "Consensus & Distributed Replication",
        codeSnippet: "Raft Consensus State Machine\nclass RaftNode:\n    def request_vote(self, term, candidate_id):\n        # Leader election protocol",
        isFreePreview: true,
        duration: "1h 15m",
        videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY",
        assignment: {
          id: 8,
          title: "Raft Leader Election State Machine",
          description: "Implement heartbeat broadcast and majority vote counting for fault-tolerant consensus.",
          starterCode: "class RaftNode:\n    pass",
          due: "Completed",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-1", title: "CAP Theorem vs PACELC Theorem in Practice", duration: "30:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY" },
          { id: "l-2", title: "Vector Clocks & Two-Phase Commit Protocols", duration: "45:00", isPreview: true, videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY" },
        ],
      },
      {
        id: "mod-2",
        number: 2,
        title: "High-Throughput Event-Driven Systems (Kafka)",
        codeSnippet: "Kafka Partition Consumer\nconsumer = KafkaConsumer('telemetry-stream', group_id='analytics-worker', enable_auto_commit=False)",
        isFreePreview: false,
        duration: "1h 45m",
        videoUrl: "https://www.youtube.com/embed/IPvYjXCsTg8",
        assignment: {
          id: 9,
          title: "Kafka Consumer Offset & Exactly-Once Pipeline",
          description: "Design an idempotent Kafka consumer processing 10,000 events/second.",
          starterCode: "from kafka import KafkaConsumer",
          due: "August 15, 2026",
          maxPoints: 100,
        },
        lessons: [
          { id: "l-3", title: "Kafka Partitions, Consumer Groups & Offsets", duration: "50:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/IPvYjXCsTg8" },
          { id: "l-4", title: "Exactly-Once Semantics & Distributed Caching", duration: "55:00", isPreview: false, videoUrl: "https://www.youtube.com/embed/IPvYjXCsTg8" },
        ],
      },
    ],
  },
};

// Default initial progress state for a fresh student
export const DEFAULT_USER_PROGRESS = {
  activeCourseId: "feat-1",
  enrolledCourseIds: ["feat-1"],
  completedLessons: {},
  submittedAssignments: {},
};

export function getStorageKey(userId) {
  if (userId) return `backlox_scholar_progress_u_${userId}`;
  try {
    const u = localStorage.getItem("backlox_user");
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed?.id) return `backlox_scholar_progress_u_${parsed.id}`;
    }
  } catch {}
  return "backlox_scholar_progress_guest";
}

export function getStoredProgress(userId) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // If demo student, provide rich sample data
      if (userId === 1 || userId === "1") {
        return {
          activeCourseId: "feat-1",
          enrolledCourseIds: ["feat-1", "feat-2"],
          completedLessons: {
            "feat-1": { "l-1": true, "l-2": true, "l-3": true, "l-4": true, "l-5": true },
            "feat-2": { "l-1": true, "l-2": true },
          },
          submittedAssignments: {
            1: { status: "graded", score: 96, feedback: "Exceptional transformation pipeline with clean seaborn charts." },
          },
        };
      }
      return DEFAULT_USER_PROGRESS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_USER_PROGRESS;
  }
}

export function saveStoredProgress(progress, userId) {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent("backlox:progress-updated", { detail: progress }));
  } catch (err) {
    console.error("Failed to save progress", err);
  }
}

export function enrollCourse(courseId, userId) {
  const current = getStoredProgress(userId);
  if (!current.enrolledCourseIds.includes(courseId)) {
    current.enrolledCourseIds.push(courseId);
  }
  current.activeCourseId = courseId;
  saveStoredProgress(current, userId);
  return current;
}

export function setActiveCourse(courseId, userId) {
  const current = getStoredProgress(userId);
  current.activeCourseId = courseId;
  saveStoredProgress(current, userId);
  return current;
}

export function toggleLessonCompletion(courseId, lessonId, isComplete, userId) {
  const current = getStoredProgress(userId);
  if (!current.completedLessons[courseId]) {
    current.completedLessons[courseId] = {};
  }
  current.completedLessons[courseId][lessonId] = isComplete;
  saveStoredProgress(current, userId);
  return current;
}

export function computeCourseProgress(course, completedLessonsMap = {}) {
  if (!course || !course.curriculum) {
    return { totalLessons: 0, completedLessons: 0, percent: 0, modules: [] };
  }

  let totalCourseLessons = 0;
  let completedCourseLessons = 0;

  const modules = course.curriculum.map((mod) => {
    const modLessons = mod.lessons || [];
    const modTotal = modLessons.length;
    const modCompleted = modLessons.filter((l) => !!completedLessonsMap[l.id]).length;
    const modPercent = modTotal === 0 ? 0 : Math.round((modCompleted / modTotal) * 100);

    totalCourseLessons += modTotal;
    completedCourseLessons += modCompleted;

    let status = "not-started";
    let statusLabel = "Not Started";
    if (modPercent === 100) {
      status = "completed";
      statusLabel = "Completed";
    } else if (modPercent > 0) {
      status = "in-progress";
      statusLabel = "In Progress";
    }

    return {
      ...mod,
      totalLessons: modTotal,
      completedLessons: modCompleted,
      percent: modPercent,
      status,
      statusLabel,
    };
  });

  const overallPercent =
    totalCourseLessons === 0 ? 0 : Math.round((completedCourseLessons / totalCourseLessons) * 100);

  return {
    totalLessons: totalCourseLessons,
    completedLessons: completedCourseLessons,
    percent: overallPercent,
    modules,
  };
}

export function saveCustomCourse(course) {
  try {
    const raw = localStorage.getItem("backlox_custom_courses");
    const map = raw ? JSON.parse(raw) : {};
    map[course.id] = course;
    localStorage.setItem("backlox_custom_courses", JSON.stringify(map));
    COURSE_CATALOG[course.id] = course;
    window.dispatchEvent(new CustomEvent("backlox:courses-updated", { detail: course }));
  } catch (err) {
    console.error("Failed to save custom course", err);
  }
}

export function loadSavedCustomCourses() {
  try {
    const raw = localStorage.getItem("backlox_custom_courses");
    if (!raw) return {};
    const map = JSON.parse(raw);
    Object.assign(COURSE_CATALOG, map);
    return map;
  } catch {
    return {};
  }
}

export function formatVideoEmbedUrl(url = "") {
  if (!url || typeof url !== "string") return "https://www.youtube.com/embed/aircAruvnKk";
  const trimmed = url.trim();

  // If already embed url
  if (trimmed.includes("youtube.com/embed/")) {
    const clean = trimmed.split("?")[0];
    return `${clean}?autoplay=1&rel=0&enablejsapi=1`;
  }
  // If youtube.com/shorts/ format
  if (trimmed.includes("youtube.com/shorts/")) {
    const videoId = trimmed.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("/")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
  }
  // If youtube.com/watch?v= format
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const videoId = u.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
    } catch {
      const videoId = trimmed.split("v=")[1]?.split("&")[0]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
    }
  }
  // If youtu.be/ format
  if (trimmed.includes("youtu.be/")) {
    const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0]?.split("/")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
  }
  return trimmed;
}

// Auto-hydrate on bundle load
loadSavedCustomCourses();
