import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import "./AIHelpCentre.css";

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "Hello! I am **Backlox AI**, your intelligent academic advisor and career companion 🎓.\n\nI can help you navigate engineering & medical pathways, deconstruct complex concepts (such as Transformer Self-Attention or 12-Lead ECG STEMI localization), solve competitive aptitude MCQs, and track your study milestones. How can I assist your goals today?",
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
  if (q.includes("branch") || q.includes("stream") || q.includes("pcm") || q.includes("pcb") || q.includes("12th") || q.includes("career")) {
    return {
      reply: `🎓 **Stream & Branch Guidance**:
- **Engineering (PCM)**: Computer Science (CSE), AI & Data Engineering, Electronics (VLSI/Embedded), and Aerospace are top high-growth pathways. Visit the **Engineering Pathways** tab to view semester roadmaps and starting CTC benchmarks (₹12 LPA - ₹38 LPA).
- **Medical (PCB)**: Explore **MBBS, BDS, and Allied Health Sciences** in our **Medical Universe** section with clinical case audits and PG entrance prep.
- **Aptitude Quiz**: Take our **15-question AI Career Aptitude Assessment** to receive personalized scientific stream recommendations!`,
      suggestedPills: ["Take Career Aptitude Test", "Explore Engineering Branches", "View Medical Universe"],
    };
  }
  if (q.includes("drm") || q.includes("screen") || q.includes("record") || q.includes("protect") || q.includes("patent")) {
    return {
      reply: `🔒 **DRM & Intellectual Property Shield**:
Backlox employs an active DRM Shield protecting video masterclasses and proprietary course notes:
1. **Dynamic Scholar Watermarking**: Overlays your verified ID to deter camcorder recording.
2. **Keyboard Shortcut Blocking**: Disables PrintScreen, Ctrl+P, Ctrl+S, and DevTools inspection.
3. **Anti-Capture Enforcement**: Complies with copyright and educational patent protections.`,
      suggestedPills: ["How to enroll in courses?", "Open Study Notes", "Take Stress Test"],
    };
  }
  if (q.includes("stress") || q.includes("meter") || q.includes("breath") || q.includes("relax")) {
    return {
      reply: `⚡ **Cognitive Stress & Focus Meter**:
The Cognitive Stress Meter in your workspace tracks your interaction density and study duration:
- **Radial Gauge**: Visualizes stress levels (0% - 100%) with color-coded safety tiers.
- **60s Box Breathing Tool**: Click **"Recharge Mind"** to activate guided Inhale → Hold → Exhale → Rest cycles that actively reduce mental fatigue.`,
      suggestedPills: ["Start Box Breathing", "Practice MCQs", "Switch Light/Dark Theme"],
    };
  }
  if (q.includes("pay") || q.includes("razorpay") || q.includes("pro") || q.includes("price") || q.includes("buy")) {
    return {
      reply: `💳 **Razorpay Secure Checkout & Plans**:
- **Backlox Lifetime Pro** (₹499): Lifetime unrestricted access to all 35+ engineering & medical branches, courses, and verified certificates.
- **Per-Course Enrollment**: Click **"Enroll with Razorpay"** on any course page. Module 1 is always available as a Free Preview!
- All payments are secured via Razorpay UPI, Cards, NetBanking, and verified with cryptographic HMAC signatures.`,
      suggestedPills: ["View Pro Plans", "Browse Free Preview Courses", "Payment Support"],
    };
  }
  return {
    reply: `🎓 **Backlox AI (Your Academic Companion)**:
I'm here to help with your academic journey across the Backlox Platform! You can practice **Aptitude MCQs** in the Practice Gym, watch interactive video masterclasses, submit coursework assignments, or explore full 4-year career roadmaps.

Let me know what topic you'd like to dive into!`,
    suggestedPills: [
      "Recommend best stream for me",
      "Explain Transformer Self-Attention",
      "Explain 12-Lead ECG STEMI",
      "How to publish a course as instructor?",
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
    window.addEventListener("pathward:open-ai-chat", handleOpenEvent);
    window.addEventListener("pathward:toggle-ai-chat", handleToggleEvent);

    return () => {
      window.removeEventListener("pathward:open-ai-chat", handleOpenEvent);
      window.removeEventListener("pathward:toggle-ai-chat", handleToggleEvent);
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
      {/* Floating Backlox AI Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-help-floating-btn glass-card animate-pulse-glow"
          onClick={() => setIsOpen(true)}
          title="Backlox AI: Your Academic Companion"
        >
          <span className="backlox-ai-avatar-icon">🎓</span>
          <div className="help-btn-text-group">
            <span className="help-btn-label mono">Backlox AI</span>
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
                <h3 className="bot-name">Backlox AI</h3>
                <span className="mono text-xs text-primary">ACADEMIC &amp; CAREER COMPANION</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-help-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close Backlox AI"
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
              placeholder="Ask Backlox AI anything about careers, exams, courses, notes..."
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
