import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Branches.css";

const DEMAND_CONFIG = {
  "Very High": { color: "#c5c0ff", dotClass: "demand-lavender", label: "Very High Demand", salary: "₹16-28 LPA" },
  High: { color: "#a5e7ff", dotClass: "demand-cyan", label: "High Demand", salary: "₹12-20 LPA" },
  Moderate: { color: "#fde047", dotClass: "demand-amber", label: "Steady Demand", salary: "₹8-15 LPA" },
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    api
      .getBranches()
      .then((all) => {
        const engBranches = all.filter((b) => !b.streamId || b.streamId === "engineering");
        setBranches(engBranches);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.short.toLowerCase().includes(search.toLowerCase()) ||
        b.coreFocus.some((f) => f.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (activeFilter === "circuit") return ["cse", "it", "aids", "ece"].includes(b.id);
      if (activeFilter === "core") return ["mech", "civil", "chem", "eee"].includes(b.id);
      return true;
    });
  }, [branches, search, activeFilter]);

  return (
    <div className="eng-page-root">
      {/* Background Glows */}
      <div className="cosmic-ambient-glows">
        <div className="glow-top-right" />
        <div className="glow-bottom-left" />
      </div>

      {/* Header Section */}
      <header className="eng-header">
        <div className="container eng-header-inner">
          <div className="cyber-pill">
            <span className="pulsing-dot" />
            <span>MODULE 01 · ENGINEERING MATRIX</span>
          </div>

          <h1 className="eng-header-title gradient-text">Engineering Command Center</h1>
          <p className="eng-header-sub">
            Explore complete 8-semester course roadmaps, real-world project blueprints, and hiring tech stacks across modern Indian engineering domains.
          </p>

          {/* Search & Filter Controls */}
          <div className="eng-controls-row">
            <div className="eng-search-box">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search branch, tech stack, or specialization (e.g. AI, VLSI, Robotics)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="eng-search-input"
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            <div className="eng-filter-pills">
              <button
                className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Branches ({branches.length})
              </button>
              <button
                className={`filter-pill ${activeFilter === "circuit" ? "active" : ""}`}
                onClick={() => setActiveFilter("circuit")}
              >
                Software &amp; AI (CSE / IT / ECE)
              </button>
              <button
                className={`filter-pill ${activeFilter === "core" ? "active" : ""}`}
                onClick={() => setActiveFilter("core")}
              >
                Core &amp; Heavy Tech (Mech / Civil)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="eng-main-content">
        <div className="container">
          {loading && <p className="mono eng-status-text">Loading branch telemetry…</p>}
          {error && <p className="eng-status-text error">⚠️ {error}</p>}

          <div className="eng-cards-grid">
            {filteredBranches.map((branch) => {
              const demandInfo = DEMAND_CONFIG[branch.demand] || DEMAND_CONFIG["High"];

              return (
                <article className="eng-branch-card glass-card" key={branch.id}>
                  <div className="eng-card-glow-hover" />
                  <div className="eng-card-header">
                    <span className="eng-branch-badge mono">{branch.short}</span>
                    <div className={`eng-demand-indicator ${demandInfo.dotClass}`}>
                      <span className="eng-demand-dot" />
                      <span className="eng-demand-text mono">{demandInfo.label}</span>
                    </div>
                  </div>

                  <h2 className="eng-card-title">{branch.name}</h2>
                  <p className="eng-card-tagline">{branch.tagline}</p>

                  <div className="eng-card-tags">
                    {branch.coreFocus.map((f) => (
                      <span key={f} className="eng-tag">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="eng-card-footer">
                    <span className="salary-pill mono">Avg: {demandInfo.salary}</span>
                    <Link to={`/engineering/${branch.id}`} className="eng-card-cta">
                      Launch Roadmap →
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
