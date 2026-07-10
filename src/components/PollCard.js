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

  return (
    <div className="poll-card">
      <p className="poll-question">{poll.question}</p>

      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
        const isSelected = userVote === i;

        return (
          <label
            key={i}
            className={`poll-option${voted ? " voted" : ""}`}
            style={{
              display: "block",
              cursor: "pointer",
            }}
          >
            <div
              className="option-row"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                checked={isSelected}
                onChange={() => {}}
                onClick={() => onVote(poll.id, isSelected ? null : i)}
                style={{ width: "16px", height: "16px", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{opt}</span>
              {voted && <span className="pct">{pct}%</span>}
            </div>

            {voted && (
              <div className="mini-bar-bg" style={{ marginTop: "6px" }}>
                <div
                  className="mini-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isSelected ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                />
              </div>
            )}
          </label>
        );
      })}

      <div className="poll-meta">
        <span>Ends {fmtDate(poll.ends)}</span>
        <span>{fmtVotes(total)} votes</span>
      </div>

      {voted && <span className="voted-badge">✓ You voted</span>}
    </div>
  );
}

export default PollCard;
