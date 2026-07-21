import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { getAnonId } from "../utils/anonId";

function IframePoll() {
  const { uuid } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [votedOption, setVotedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function parseOptions(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw !== "string") return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
    return raw
      .replace(/^{|}$/g, "")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim());
  }

  async function fetchPoll() {
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("public_uuid", uuid)
      .single();
    if (!error) setPoll(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPoll();

    const storedVote = localStorage.getItem(`kp_vote_${uuid}`);
    if (storedVote !== null) {
      setVoted(true);
      setVotedOption(Number(storedVote));
    }
  }, [uuid]);

  async function handleSubmit() {
    if (selected === null || submitting || !poll) return;
    setSubmitting(true);
    setError(null);

    const voterUuid = getAnonId();

    const { error } = await supabase.rpc("cast_anonymous_vote", {
      p_poll_id: poll.id,
      p_option_idx: selected,
      p_voter_uuid: voterUuid,
    });

    if (error) {
      if (error.message.includes("Already voted")) {
        localStorage.setItem(`kp_vote_${uuid}`, String(selected));
        setVoted(true);
        setVotedOption(selected);
        await fetchPoll();
      } else {
        setError(error.message);
      }
      setSubmitting(false);
      return;
    }

    localStorage.setItem(`kp_vote_${uuid}`, String(selected));
    setVoted(true);
    setVotedOption(selected);
    await fetchPoll();
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: 13 }}>Poll not found.</p>
      </div>
    );
  }

  const options = parseOptions(poll.options);
  const votes = Array.isArray(poll.votes) ? poll.votes : [];
  const total = votes.reduce((a, b) => a + b, 0);

  return (
    <div style={containerStyle}>
      <style>{`
        .kp-option-row {
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }
        .kp-option-row:hover {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.35) !important;
          cursor: pointer;
        }
        .kp-option-row:active {
          transform: scale(0.99);
        }
        .kp-submit-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .kp-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 10px 22px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -3px 6px rgba(124,58,237,0.15);
        }
        .kp-submit-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .kp-submit-btn:hover:not(:disabled)::after {
          left: 130%;
        }
      `}</style>

      <h1 style={questionStyle}>{poll.question}</h1>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt, i) => {
          const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
          const isVotedOption = votedOption === i;

          if (voted) {
            return (
              <div key={i} style={optionRowStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>{opt}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 12.5 }}>{pct}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: isVotedOption ? "#fff" : "rgba(255,255,255,0.5)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="kp-option-row"
              onClick={() => setSelected(i)}
              style={{
                ...optionRowStyle,
                border: selected === i ? "1px solid rgba(255,255,255,0.5)" : optionRowStyle.border,
                background: selected === i ? "rgba(255,255,255,0.06)" : optionRowStyle.background,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  border: selected === i ? "5px solid #7c6cf0" : "none",
                  flexShrink: 0,
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.25)",
                }}
              />
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>{opt}</span>
            </div>
          );
        })}
      </div>

      {!voted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null || submitting}
          className="kp-submit-btn"
          style={{
            ...submitButtonStyle,
            opacity: selected === null || submitting ? 0.6 : 1,
            cursor: selected === null || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit Vote"}
        </button>
      )}

      {error && <p style={{ color: "#ffb4b4", fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

const containerStyle = {
  width: "360px",
  minHeight: "500px",
  maxWidth: "100vw",
  margin: "0 auto",
  background: "#0d0f1a",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  padding: "24px 20px",
  boxSizing: "border-box",
  overflowY: "auto",
};

const questionStyle = {
  color: "#fff",
  fontSize: 17,
  fontWeight: 700,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  letterSpacing: "-0.005em",
  lineHeight: 1.35,
  margin: "4px 0 18px",
  width: "100%",
};

const optionRowStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 14,
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 16,
  padding: "14px 22px 14px 16px",
  background: "rgba(255,255,255,0.03)",
  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.35)",
  boxSizing: "border-box",
};

const submitButtonStyle = {
  marginTop: 20,
  width: "100%",
  padding: "16px 22px 16px 16px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 12.5,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  boxSizing: "border-box",
  boxShadow:
    "0 10px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.15)",
};

export default IframePoll;