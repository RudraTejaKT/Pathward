import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { FALLBACK_BRANCHES } from "../lib/branchDataFallback";
import "./MedicalBranches.css";

const DEMAND_CONFIG = {
  "Very High": { color: "#47d6ff", dotClass: "med-dot-cyan", label: "Very High Demand" },
  High: { color: "#c5c0ff", dotClass: "med-dot-lavender", label: "High Demand" },
  Moderate: { color: "#fde047", dotClass: "med-dot-amber", label: "Steady Demand" },
};

export default function MedicalBranches() {
  const [branches, setBranches] = useState(() =>
    FALLBACK_BRANCHES.filter((b) => b.streamId === "medical")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .getBranches()
      .then((all) => {
        if (all && all.length > 0) {
          const medicalBranches = all.filter((b) => b.streamId === "medical");
          setBranches(medicalBranches);
        }
      })
      .catch(() => {
        // Safe fallback already mounted
      });
  }, []);

  const filteredBranches = branches.filter((b) => {
    if (filter === "ug") return b.id !== "medical-pg";
    if (filter === "pg") return b.id === "medical-pg";
    return true;
  });

  return (
    <div className="med-page-root">
      {/* Background Cosmic Ambient Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Header Section */}
      <header className="med-header">
        <div className="container med-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>MODULE 02 · HEALTHCARE MATRIX</span>
          </div>

          <h1 className="med-header-title gradient-text">
            Medical &amp; Clinical Sciences Universe
          </h1>
          <p className="med-header-sub">
            Explore complete clinical prof-wise roadmaps, case study audits, hospital postings, and medical PG specializations across MBBS, Dental, AYUSH, Pharmacy, Nursing, Allied Health, and residency programs.
          </p>

          {/* Filter Chips */}
          <div className="med-filters-row">
            <button
              className={`med-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Medical Pathways ({branches.length || 7})
            </button>
            <button
              className={`med-filter-btn ${filter === "ug" ? "active" : ""}`}
              onClick={() => setFilter("ug")}
            >
              Undergraduate Degrees (MBBS, BDS, AYUSH, Pharmacy, Nursing)
            </button>
            <button
              className={`med-filter-btn ${filter === "pg" ? "active" : ""}`}
              onClick={() => setFilter("pg")}
            >
              After-MBBS / Medical PG (MD / MS / DNB / DM / MCh)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="med-main-content">
        <div className="container">
          {loading && <p className="mono med-status-text">Loading medical telemetry…</p>}
          {error && <p className="med-status-text error">⚠️ {error}</p>}

          <div className="med-cards-grid">
            {filteredBranches.map((branch) => {
              const demandInfo = DEMAND_CONFIG[branch.demand] || DEMAND_CONFIG["High"];

              return (
                <article className="med-card glass-card" key={branch.id}>
                  <div className="med-card-glow-hover" />
                  <div className="med-card-header">
                    <span className="med-card-badge mono">{branch.short}</span>
                    <div className={`med-card-demand ${demandInfo.dotClass}`}>
                      <span className="demand-dot" />
                      <span className="mono">{demandInfo.label}</span>
                    </div>
                  </div>

                  <h2 className="med-card-title">{branch.name}</h2>
                  <p className="med-card-tagline">{branch.tagline}</p>

                  <div className="med-card-tags">
                    {branch.coreFocus.map((f) => (
                      <span key={f} className="med-mono-tag">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="med-card-footer">
                    <Link to={`/medical/${branch.id}`} className="med-card-cta">
                      Explore Clinical Roadmap &amp; Cases <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
