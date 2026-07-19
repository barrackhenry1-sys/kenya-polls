import { useState, useEffect } from "react";

function PollCard({ poll, userVote, onVote }) {
  function parseOptions(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw !== "string") return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, fall through to legacy Postgres array parsing
    }
    return raw
      .replace(/^{|}$/g, "")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim());
  }

  const options = parseOptions(poll.options);

  const votes = Array.isArray(poll.votes)
    ? poll.votes
    : typeof poll.votes === "string"
    ? poll.votes.replace(/^{|}$/g, "").split(",").map(Number)
    : [];

  const total = votes.reduce((a, b) => a + b, 0);
  const voted = userVote !== undefined;
  const fmtVotes = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n);

  const fmtDate = (d) => {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Local selection before submitting — not yet sent to the server
  const [selected, setSelected] = useState(userVote ?? null);

  useEffect(() => {
    setSelected(userVote ?? null);
  }, [userVote]);

  function handleSubmit() {
    if (selected === null) return;
    onVote(poll.id, selected);
  }

  function handleChangeVote() {
    onVote(poll.id, null); // unvote, unlocks selection again
  }

  return (
    <div className="poll-card">
      <p className="poll-question">{poll.question}</p>

      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
        const isSelected = selected === i;

        if (voted) {
          return (
            <div key={i} className="poll-option voted">
              <div className="option-row">
                <span>{opt}</span>
                <span className="pct">{pct}%</span>
              </div>
              <div className="mini-bar-bg">
                <div
                  className="mini-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isSelected ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                />
              </div>
            </div>
          );
        }

        return (
          <label
            key={i}
            className="poll-option"
            style={{ display: "block", cursor: "pointer" }}
          >
            <div
              className="option-row"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                checked={isSelected}
                onChange={() => setSelected(i)}
                style={{ width: "16px", height: "16px", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{opt}</span>
            </div>
          </label>
        );
      })}

      {!voted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "12px",
            background: selected === null ? "#e4e4e8" : "#c8c9d1",
            color: selected === null ? "#a6a6b0" : "#33333d",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: selected === null ? "not-allowed" : "pointer",
            boxShadow:
              selected === null
                ? "inset 0 1px 3px rgba(0,0,0,0.06)"
                : "inset 0 1px 3px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.4)",
            transition: "background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease",
          }}
          onMouseEnter={(e) => {
            if (selected === null) return;
            e.currentTarget.style.background = "#b8b9c3";
            e.currentTarget.style.boxShadow =
              "inset 0 1px 4px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(255,255,255,0.4)";
          }}
          onMouseLeave={(e) => {
            if (selected === null) return;
            e.currentTarget.style.background = "#c8c9d1";
            e.currentTarget.style.boxShadow =
              "inset 0 1px 3px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.4)";
          }}
        >
          Submit Vote
        </button>
      )}

      {voted && (
        <button
          onClick={handleChangeVote}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "10px",
            background: "transparent",
            color: "#534AB7",
            border: "1px solid #534AB7",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Change my vote
        </button>
      )}

      <div className="poll-meta">
        <span>Created {fmtDate(poll.created_at)}</span>
        <span>{fmtVotes(total)} votes</span>
      </div>

      {voted && <span className="voted-badge">✓ You voted</span>}
    </div>
  );
}

export default PollCard;