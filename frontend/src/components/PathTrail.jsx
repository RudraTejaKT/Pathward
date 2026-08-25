import "./PathTrail.css";

// The signature element: a connected trail of stages representing
// the student's journey. `activeIndex` marks how far along they are.
export default function PathTrail({ stages, activeIndex }) {
  return (
    <div className="path-trail" role="list" aria-label="Your journey">
      {stages.map((stage, i) => {
        const state =
          i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
        return (
          <div className="path-trail__item" key={stage} role="listitem">
            <div className={`path-trail__node path-trail__node--${state}`}>
              <span className="path-trail__index mono">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <span className={`path-trail__label path-trail__label--${state}`}>{stage}</span>
            {i < stages.length - 1 && (
              <div className={`path-trail__connector path-trail__connector--${state}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
