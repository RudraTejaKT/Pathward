import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import "./AIHelpCentre.css";

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "Hello! I am **Octi**, your intelligent academic advisor and career companion 🎓.\n\nI can help you navigate engineering & medical pathways, deconstruct complex concepts (such as Transformer Self-Attention or 12-Lead ECG STEMI localization), solve competitive aptitude MCQs, and track your study milestones. How can I assist your goals today?",
    time: "Just now",
  },
];

const DEFAULT_PROMPT_PILLS = [
  "Guide me on stream selection after 12th",
  "Explain Transformer Self-Attention mechanism",
  "Explain 12-Lead ECG clinical diagnosis",
  "How to unlock courses & certification via Razorpay",
  "Explain DRM & Intellectual Property Protection",
];

function generateOfflineReply(query) {
  const q = query.toLowerCase();
  
  if (q.includes("salary") || q.includes("ctc") || q.includes("package") || q.includes("placement") || q.includes("earn")) {
    return {
      reply: `💼 **Career CTC & Salary Benchmarks (2026 Telemetry)**:
- **AI & Data Science**: ₹22 LPA – ₹52 LPA (Tier-1), ₹8 LPA – ₹16 LPA (Tier-2/3), Top US/Remote: $180k+.
- **Computer Science (CSE)**: ₹18 LPA – ₹48 LPA (Tier-1), Top International: ₹1.2 Cr+.
- **VLSI & Semiconductor (ECE)**: ₹16 LPA – ₹38 LPA (NVIDIA, Qualcomm, Intel, TI).
- **MBBS Specialist (MD/MS)**: ₹18 LPA – ₹36 LPA (Hospital Consultant), ₹60 LPA+ in Super-specialty.
- **Investment Banking & CA**: ₹25 LPA – ₹55 LPA (Front Office / Big 4).`,
      suggestedPills: ["Explore CSE Roadmap", "How to prepare for FAANG Placements", "Compare VLSI vs Software Salaries"],
    };
  }

  if (q.includes("transformer") || q.includes("attention") || q.includes("llm") || q.includes("gpt")) {
    return {
      reply: `🧠 **Transformer Self-Attention Formulation**:
Attention allows each token to dynamically weight context from all other tokens:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

- **Q (Query)**: What the current token seeks.
- **K (Key)**: What each token represents.
- **V (Value)**: The semantic payload.
- **$\\sqrt{d_k}$**: Scaling factor preventing gradient vanishing during Softmax.
- **Multi-Head Attention (MHA)** runs $h$ attention heads in parallel to capture distinct syntax and semantic relationships simultaneously!`,
      suggestedPills: ["Explain RAG Architecture", "Deep Learning Loss Functions", "Encoder vs Decoder LLMs"],
    };
  }

  if (q.includes("ecg") || q.includes("stemi") || q.includes("cardio") || q.includes("heart")) {
    return {
      reply: `🩺 **12-Lead ECG STEMI Localization Protocol**:
- **Anterior Wall Infarct**: ST elevation in leads **V1, V2, V3, V4** (LAD Artery).
- **Inferior Wall Infarct**: ST elevation in leads **II, III, aVF** (RCA Artery).
- **Lateral Wall Infarct**: ST elevation in leads **I, aVL, V5, V6** (LCx Artery).
- **Posterior Wall**: Tall R waves & ST depression in **V1–V3** (Confirm with V7–V9).
- **Emergency Action**: Immediate Aspirin (300mg) + P2Y12 inhibitor + transfer for Primary PCI (Door-to-Balloon < 90 min)!`,
      suggestedPills: ["Cardiology Pharmacology", "Cardiac Action Potential", "NEET-PG Cardiology MCQs"],
    };
  }

  if (q.includes("dsa") || q.includes("algorithm") || q.includes("big o") || q.includes("complexity") || q.includes("dynamic programming")) {
    return {
      reply: `💻 **Data Structures & Algorithms (DSA) Blueprint**:
- **Time Complexities**:
  - $O(1)$: Hash Map lookup, Array index.
  - $O(\\log N)$: Binary Search, AVL tree operations.
  - $O(N \\log N)$: Merge Sort, Quick Sort (Avg), Heap Sort.
  - $O(2^N)$: Recursive exponential subsets.
- **Core Patterns**: Sliding Window, Two Pointers, Fast/Slow Pointers, BFS/DFS, 0/1 Knapsack DP, Topological Sort.`,
      suggestedPills: ["Dynamic Programming Guide", "Graph Algorithms (Dijkstra)", "Top 50 Interview Problems"],
    };
  }

  if (q.includes("branch") || q.includes("stream") || q.includes("pcm") || q.includes("pcb") || q.includes("12th") || q.includes("career")) {
    return {
      reply: `🎓 **Stream & Branch Guidance**:
- **Engineering (PCM)**: Computer Science (CSE), AI & Data Science, Electronics (VLSI/Embedded), and Aerospace are top high-growth pathways (CTC ₹12 LPA - ₹48 LPA).
- **Medical (PCB)**: MBBS, BDS, Pharmacy (Pharm.D), and Allied Health Sciences in our **Medical Universe** section.
- **Commerce & Law**: CA (Chartered Accountancy), Investment Banking, 5-Year Integrated BA/BBA LLB via CLAT.
- Take our **AI Career Aptitude Assessment** to receive personalized scientific stream recommendations!`,
      suggestedPills: ["Take Career Aptitude Test", "Explore 35+ Engineering Branches", "View Medical Universe"],
    };
  }

  if (q.includes("11") || q.includes("pay") || q.includes("razorpay") || q.includes("pro") || q.includes("price") || q.includes("buy")) {
    return {
      reply: `⚡ **Backlox Pro Early Bird Launch Offer (First 100 Scholars)**:
- **Price**: **₹11.00** *(Regular: ~~₹499~~)*
- **Lifetime Access**: Complete 4-Year syllabus roadmaps, unlimited Practice Gym MCQs, verified masterclasses & certificates.
- **Payment Method**: Live Razorpay Checkout via UPI (Google Pay, PhonePe, Paytm), Cards, or NetBanking with instant bank settlement!`,
      suggestedPills: ["Claim ₹11 Launch Offer", "Browse Course Catalog", "Practice MCQ Test Gym"],
    };
  }

  return {
    reply: `🎓 **Octi Academic Advisor**:
I'm here to illuminate your learning journey across Backlox Universe! You can ask me to:
- Deconstruct scientific concepts (*Transformers, STEMI ECG, Big-O Complexity, Thermodynamics*).
- Guide your career pathway & salary benchmarks across 35+ engineering & medical fields.
- Formulate study roadmaps for **JEE, NEET, GATE, CAT, and CLAT**.
- Assist with your course masterclasses and aptitude tests!

What topic would you like to explore?`,
    suggestedPills: [
      "Recommend best stream for me",
      "Explain Transformer Self-Attention",
      "Explain 12-Lead ECG STEMI",
      "Salary benchmarks for AI & CSE",
    ],
  };
}

export default function AIHelpCentre() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [pills, setPills] = useState(DEFAULT_PROMPT_PILLS);
  const chatEndRef = useRef(null);

  // Listen for global chat trigger events
  useEffect(() => {
    function handleOpenEvent() {
      setIsOpen(true);
    }
    function handleToggleEvent() {
      setIsOpen((prev) => !prev);
    }
    window.addEventListener("backlox:open-ai-chat", handleOpenEvent);
    window.addEventListener("backlox:toggle-ai-chat", handleToggleEvent);

    return () => {
      window.removeEventListener("backlox:open-ai-chat", handleOpenEvent);
      window.removeEventListener("backlox:toggle-ai-chat", handleToggleEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSendMessage(customText) {
    const textToSend = typeof customText === "string" ? customText : inputVal;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: "user",
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await api.askHelpAssistant({
        query: textToSend.trim(),
        history: messages.slice(-4),
      });

      const botMsg = {
        sender: "bot",
        text: res?.reply || generateOfflineReply(textToSend).reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res?.suggestedPills && res.suggestedPills.length > 0) {
        setPills(res.suggestedPills);
      }
    } catch {
      // Use instant fallback
      const fallback = generateOfflineReply(textToSend);
      const botMsg = {
        sender: "bot",
        text: fallback.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (fallback.suggestedPills) {
        setPills(fallback.suggestedPills);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-help-centre-root">
      {/* Floating Octi Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-help-floating-btn glass-card animate-pulse-glow"
          onClick={() => setIsOpen(true)}
          title="Octi: Your Academic Companion"
        >
          <span className="backlox-ai-avatar-icon">🎓</span>
          <div className="help-btn-text-group">
            <span className="help-btn-label mono">Octi</span>
            <span className="help-btn-sub mono">Advisor</span>
          </div>
        </button>
      )}

      {/* Chat Window Modal / Widget */}
      {isOpen && (
        <div className="ai-help-window glass-card animate-slide-up">
          <div className="ai-help-header">
            <div className="ai-help-title-box">
              <div className="bot-avatar-wrap backlox-avatar-wrap">
                <span className="backlox-header-icon">🎓</span>
                <span className="online-indicator" />
              </div>
              <div>
                <h3 className="bot-name">Octi</h3>
                <span className="mono text-xs text-primary">ACADEMIC &amp; CAREER ADVISOR</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-help-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Octi"
            >
              ✕
            </button>
          </div>

          {/* Messages Thread */}
          <div className="ai-help-messages-thread">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`chat-msg-row ${m.sender === "user" ? "chat-msg--user" : "chat-msg--bot"}`}
              >
                <div className="chat-bubble glass-card">
                  <div className="chat-text" style={{ whiteSpace: "pre-line" }}>
                    {m.text}
                  </div>
                  <span className="chat-time mono">{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg-row chat-msg--bot">
                <div className="chat-bubble glass-card typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="ai-quick-pills-row">
            {pills.map((pill, pIdx) => (
              <button
                type="button"
                key={pIdx}
                className="ai-quick-pill mono"
                onClick={() => handleSendMessage(pill)}
                disabled={loading}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-help-input-form"
          >
            <input
              type="text"
              placeholder="Ask Octi anything about careers, exams, courses, notes..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="cyber-btn cyber-btn--primary" disabled={loading || !inputVal.trim()}>
              <span className="material-symbols-outlined send-icon">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
