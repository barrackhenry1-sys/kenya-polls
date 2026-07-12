import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function CreatePoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [ends, setEnds] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Current local datetime formatted for the datetime-local input's min attribute
  function getMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  function handleOptionChange(index, value) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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
    const filledOptions = options.filter((o) => o.trim() !== "");
    if (filledOptions.length < 2) {
      setError("Please enter at least 2 options");
      return;
    }
    if (!ends) {
      setError("Please enter an end date");
      return;
    }

    const endsDate = new Date(ends);
    if (endsDate <= new Date()) {
      setError("End date must be in the future");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("polls").insert({
      question: question.trim(),
      options: filledOptions,
      votes: new Array(filledOptions.length).fill(0),
      ends: endsDate.toISOString(),
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    navigate("/");
  }

  return (
    <div className="create-page">
      <div className="create-card">
        <div className="create-header">
          <div
            className="create-header-image"
            style={{
              background: "linear-gradient(135deg, #6f5ce6, #4c3fe0)",
            }}
          />
          <div className="flag-strip" />
          <div className="create-header-content">
            <button className="back-link" onClick={() => navigate("/")}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to polls
            </button>
            <h1 className="create-title">New poll</h1>
            <p className="create-subtitle">Ask Kenya something important</p>
          </div>
        </div>

        <div className="create-body">
          <div className="create-field">
            <label className="create-label">Question</label>
            <input
              className="create-input"
              type="text"
              placeholder="e.g. Should Nairobi be its own county?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="create-field">
            <label className="create-label">Options</label>
            {options.map((opt, i) => (
              <div key={i} className="option-input-row">
                <input
                  className="create-input"
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
                {options.length > 2 && (
                  <button
                    className="remove-option-btn"
                    onClick={() => removeOption(i)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button className="add-option-btn" onClick={addOption}>
                + Add option
              </button>
            )}
          </div>

          <div className="create-field">
            <label className="create-label">End date</label>
            <input
              className="create-input"
              type="datetime-local"
              min={getMinDateTime()}
              value={ends}
              onChange={(e) => setEnds(e.target.value)}
            />
            <p className="create-hint">
              Voting closes automatically at this time.
            </p>
          </div>

          {error && <p className="create-error">{error}</p>}

          <button
            className="create-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create poll"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePoll;