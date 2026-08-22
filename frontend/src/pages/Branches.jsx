import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import PathTrail from "../components/PathTrail.jsx";
import "./Branches.css";

const JOURNEY_STAGES = ["12th grade", "Stream", "Branch", "Courses", "Projects", "IT Job"];

const DEMAND_COLOR = {
  "Very High": "var(--teal)",
  High: "var(--steel)",
  Moderate: "var(--amber)",
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getBranches()
      .then(setBranches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="branches-hero">
        <div className="container">
          <PathTrail stages={JOURNEY_STAGES} activeIndex={2} />
          <p className="mono branches-hero__eyebrow">ENGINEERING</p>
          <h1 className="branches-hero__title">Which branch fits you?</h1>
          <p className="branches-hero__sub">
            Every branch below unpacks into a semester-wise roadmap, a project list, and the job
            roles it's currently opening doors to.
          </p>
        </div>
      </section>

      <section className="branches-list">
        <div className="container">
          {loading && <p className="mono">Loading branches…</p>}
          {error && <p className="mono" style={{ color: "var(--rust)" }}>{error}</p>}

          <div className="branches-grid">
            {branches.map((branch) => (
              <Link to={`/engineering/${branch.id}`} className="branch-card" key={branch.id}>
                <div className="branch-card__header">
                  <span className="branch-card__short mono">{branch.short}</span>
                  <span
                    className="branch-card__demand"
                    style={{ color: DEMAND_COLOR[branch.demand] || "var(--ink-soft)" }}
                  >
                    ● {branch.demand} demand
                  </span>
                </div>
                <h3>{branch.name}</h3>
                <p className="branch-card__tagline">{branch.tagline}</p>
                <div className="branch-card__tags">
                  {branch.coreFocus.map((f) => (
                    <span key={f} className="branch-card__tag mono">
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
