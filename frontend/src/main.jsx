import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f19",
          color: "#f8fafc",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          padding: "24px",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "500px",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#818cf8", marginBottom: "12px" }}>
              Backlox System Notice
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
              {this.state.error?.message || "An unexpected error occurred while initializing the view."}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Reset Session & Reload Home →
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </GlobalErrorBoundary>
    </StrictMode>
  );
}
