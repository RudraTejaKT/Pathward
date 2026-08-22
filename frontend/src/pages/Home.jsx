import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import PathTrail from "../components/PathTrail.jsx";
import "./Home.css";

const JOURNEY_STAGES = ["12th grade", "Stream", "Branch", "Courses", "Projects", "IT Job"];

export default function Home() {
  const [streams, setStreams] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getStreams()
      .then(setStreams)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (stream) => {
    if (!stream.available) return;
    navigate(`/${stream.id}`);
  };

  const filteredStreams = streams.filter((stream) => {
    const searchable = `${stream.name} ${stream.tagline} ${stream.description}`.toLowerCase();
    return searchable.includes(query.toLowerCase().trim());
  });

  return (
    <main>
      <section className="hero">
        <div className="container hero__content">
          <p className="hero__eyebrow mono">PATHWARD / EXPLORE</p>
          <h1 className="hero__title">Explore your academic future</h1>
          <p className="hero__sub">
            Find a clear route from your next decision to the skills, projects, and roles that
            make your future feel possible.
          </p>
          <form className="hero__search" onSubmit={(event) => event.preventDefault()}>
            <span className="hero__search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a stream, branch, or career path..."
              aria-label="Search academic paths"
            />
            <button type="submit">Search <span aria-hidden="true">↗</span></button>
          </form>
        </div>
      </section>

      <section className="journey-strip">
        <div className="container">
          <PathTrail stages={JOURNEY_STAGES} activeIndex={0} />
        </div>
      </section>

      <section className="streams">
        <div className="container">
          <div className="streams__header">
            <div>
              <h2 className="streams__heading">Academic pathways</h2>
              <p className="streams__note">Curated routes for the next stage of your journey.</p>
            </div>
            <button className="streams__view-all" onClick={() => setQuery("")}>View all paths <span aria-hidden="true">›</span></button>
          </div>

          {loading && <p className="mono streams__status">Loading streams…</p>}
          {error && <p className="mono streams__status streams__status--error">{error}</p>}

          <div className="streams__grid">
            {filteredStreams.map((stream, index) => (
              <button
                key={stream.id}
                className={`stream-card ${!stream.available ? "stream-card--locked" : ""}`}
                onClick={() => handleSelect(stream)}
                disabled={!stream.available}
              >
                <div className={`stream-card__visual stream-card__visual--${index % 4}`}>
                  <span className="stream-card__icon" aria-hidden="true">{["⌘", "◌", "▱", "✦"][index % 4]}</span>
                  <span className="stream-card__duration mono">{stream.avgDuration}</span>
                </div>
                <div className="stream-card__body">
                  <h3>{stream.name}</h3>
                  <p className="stream-card__tagline">{stream.tagline}</p>
                  <p className="stream-card__desc">{stream.description}</p>
                  <span className="stream-card__cta">
                    {stream.available ? "Explore pathway ↗" : "Coming soon"}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {!loading && !filteredStreams.length && <p className="streams__empty">No pathways match “{query}”.</p>}
        </div>
      </section>

      <section className="assessment container">
        <div>
          <p className="assessment__eyebrow mono">YOUR NEXT MOVE</p>
          <h2>Not sure where to start?</h2>
          <p>Begin with Engineering and build a practical roadmap from branch selection to your first IT role.</p>
        </div>
        <button onClick={() => navigate("/engineering")}>Start exploring <span aria-hidden="true">↗</span></button>
      </section>
    </main>
  );
}
