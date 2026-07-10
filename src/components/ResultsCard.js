function ResultsCard({ poll }) {
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
  const maxVotes = votes.length > 0 ? Math.max(...votes) : 0;
  const fmtVotes = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n);

  return (
    <div className="results-card">
      <p className="results-question">{poll.question}</p>

      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
        const isWinner = votes[i] === maxVotes;

        return (
          <div key={i} className="result-row">
            <div className="result-label">
              <span>
                {opt} {isWinner ? "🏆" : ""}
              </span>
              <span className="result-pct">{pct}%</span>
            </div>
            <div className="result-bar-bg">
              <div className="result-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}

      <div className="results-meta">
        <span>{fmtVotes(total)} votes</span>
      </div>
    </div>
  );
}

export default ResultsCard;
