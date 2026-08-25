import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import "./AIHelpCentre.css";

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "👋 Welcome to the **Pathward AI Campus Assistant & Help Centre**! How can I assist with your stream pathways, competitive entrance exams (JEE, NEET, GATE, CAT), course enrollment, or study tools today?",
    time: "Just now",
  },
];

const DEFAULT_PROMPT_PILLS = [
  "Recommend best stream after 12th",
  "Explain Transformer Self-Attention",
  "Explain 12-Lead ECG STEMI",
  "How to unlock courses via Razorpay?",
  "DRM & Anti-Screen Capture Protection",
];

export default function AIHelpCentre() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [pills, setPills] = useState(DEFAULT_PROMPT_PILLS);
  const chatEndRef = useRef(null);

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
        text: res?.reply || "I am processing your query. Please check your network or try another question.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res?.suggestedPills && res.suggestedPills.length > 0) {
        setPills(res.suggestedPills);
      }
    } catch {
      const errorMsg = {
        sender: "bot",
        text: "⚠️ Could not connect to AI service. Please ensure the backend server is active on http://localhost:4000.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-help-centre-root">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-help-floating-btn glass-card animate-pulse-glow"
          onClick={() => setIsOpen(true)}
          title="24/7 AI Campus Help Centre"
        >
          <span className="sparkle-icon">✨</span>
          <span className="material-symbols-outlined help-icon">smart_toy</span>
          <span className="help-btn-label mono">AI HELP</span>
        </button>
      )}

      {/* Chat Window Modal / Widget */}
      {isOpen && (
        <div className="ai-help-window glass-card animate-slide-up">
          <div className="ai-help-header">
            <div className="ai-help-title-box">
              <div className="bot-avatar-wrap">
                <span className="material-symbols-outlined">psychology</span>
                <span className="online-indicator" />
              </div>
              <div>
                <h3 className="bot-name">Pathward AI Assistant</h3>
                <span className="mono text-xs text-primary">24/7 CAMPUS HELP CENTRE</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-help-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close AI Assistant"
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
              placeholder="Ask anything about branches, exams, courses, notes..."
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
