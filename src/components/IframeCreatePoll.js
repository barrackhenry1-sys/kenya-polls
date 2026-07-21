import { useState } from "react";
import { supabase } from "../supabase";
import starLogo from "../assets/star.logo.webp";
import { getAnonId } from "../utils/anonId";

function IframeCreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdPoll, setCreatedPoll] = useState(null);

  function handleOptionChange(index, value) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  }

  function addOption() {
    if (options.length < 6) setOptions([...options, ""]);
  }

  function removeOption(index) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit() {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }
    const filled = options.filter((o) => o.trim() !== "");
    if (filled.length < 2) {
      setError("Please enter at least 2 options");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from("polls")
      .insert({
        question: question.trim(),
        options: filled,
        votes: new Array(filled.length).fill(0),
        created_by: null,
        creator_uuid: getAnonId(),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setCreatedPoll(data);
    setSubmitting(false);
  }

  if (createdPoll) {
    const voteUrl = `${window.location.origin}/iframe/${createdPoll.public_uuid}`;
    return (
      <div style={containerStyle}>
        <div style={logoWrapStyle}>
          <img src={starLogo} alt="The Star" style={{ width: "100%", maxWidth: 160 }} />
        </div>

        <h1 style={{ ...questionStyle, marginBottom: 16 }}>Poll created! 🎉</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 16, width: "100%" }}>
          Share this link so people can vote:
        </p>
        <div style={linkBoxStyle}>{voteUrl}</div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(voteUrl);
            alert("Link copied!");
          }}
          style={submitButtonStyle}
        >
          Copy Link
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={logoWrapStyle}>
        <img src={starLogo} alt="The Star" style={{ width: "100%", maxWidth: 160 }} />
      </div>

      <h1 style={questionStyle}>Create a poll</h1>

      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={inputStyle}
      />

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                style={removeButtonStyle}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 6 && (
        <button onClick={addOption} style={addOptionButtonStyle}>
          + Add option
        </button>
      )}

      {error && <p style={{ color: "#ffb4b4", fontSize: 12, marginTop: 4 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          ...submitButtonStyle,
          opacity: submitting ? 0.6 : 1,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Creating..." : "Create Poll"}
      </button>
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
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "24px 20px",
  boxSizing: "border-box",
  overflowY: "auto",
  gap: 12,
};

const logoWrapStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  marginBottom: 8,
};

const questionStyle = {
  color: "#fff",
  fontSize: 22,
  fontWeight: 800,
  lineHeight: 1.25,
  margin: "0 0 8px",
  width: "100%",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontSize: 14.5,
  fontWeight: 600,
  boxSizing: "border-box",
  outline: "none",
};

const removeButtonStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#fff",
  width: 36,
  height: 36,
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: 16,
  flexShrink: 0,
};

const addOptionButtonStyle = {
  width: "100%",
  background: "transparent",
  border: "1px dashed rgba(255,255,255,0.3)",
  color: "#fff",
  padding: 12,
  borderRadius: 16,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

const linkBoxStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 16,
  padding: 14,
  fontSize: 11.5,
  color: "#fff",
  wordBreak: "break-all",
  boxSizing: "border-box",
};

const submitButtonStyle = {
  marginTop: 8,
  width: "100%",
  padding: 16,
  background: "#fff",
  color: "#7c3aed",
  border: "none",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  boxSizing: "border-box",
};

export default IframeCreatePoll;