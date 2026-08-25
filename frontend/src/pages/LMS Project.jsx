import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./MedicalBranches.css";

const DEMAND_COLOR = {
    "Very High": "#0d9488", // teal-600
    High: "#475569", // slate-600
    Moderate: "#d97706", // amber-600
};

export default function MedicalBranches() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        api
            .getBranches()
            .then((all) => {
                const medicalBranches = all.filter((b) => b.streamId === "medical");
                setBranches(medicalBranches);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredBranches = branches.filter((b) => {
        if (filter === "ug") return b.id !== "medical-pg";
        if (filter === "pg") return b.id === "medical-pg";
        return true;
    });

    return (
        <div className="med-page-root">
            {/* Header Section */}
            <header className="med-header">
                <div className="med-header-inner">
                    <div className="med-header-eyebrow">
                        Medical &amp; Health Sciences Universe
                    </div>
                    <h1 className="med-header-title">
                        Choose your healthcare pathway.
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
                            Undergraduate Degrees (MBBS, BDS, AYUSH, Pharmacy, Nursing, Allied)
                        </button>
                        <button
                            className={`med-filter-btn ${filter === "pg" ? "active" : ""}`}
                            onClick={() => setFilter("pg")}
                        >
                            After-MBBS / Medical PG (MD/MS/DNB/DM/MCh)
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="med-main-content">
                <div className="med-container">
                    {loading && <p className="med-status-text">Loading medical pathways…</p>}
                    {error && <p className="med-status-text error">{error}</p>}

                    <div className="med-cards-grid">
                        {filteredBranches.map((branch) => (
                            <article className="med-card" key={branch.id}>
                                <div className="med-card-header">
                                    <span className="med-card-badge">{branch.short}</span>
                                    <div
                                        className="med-card-demand"
                                        style={{ color: DEMAND_COLOR[branch.demand] || "#0d9488" }}
                                    >
                                        <span
                                            className="demand-dot"
                                            style={{
                                                backgroundColor:
                                                    branch.demand === "Very High" ? "#14b8a6" : "#94a3b8",
                                            }}
                                        />
                                        {branch.demand} demand
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

                                <Link to={`/medical/${branch.id}`} className="med-card-cta">
                                    Explore Prof Roadmap &amp; Cases <span>→</span>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
