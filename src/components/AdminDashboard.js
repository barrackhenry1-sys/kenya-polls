import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminDashboard() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: "" });
  const [expandedVoters, setExpandedVoters] = useState(null);
  const [voters, setVoters] = useState([]);
  const [votersLoading, setVotersLoading] = useState(false);

  useEffect(() => {
    fetchPolls();
    fetchProfiles();
  }, []);

  async function fetchPolls() {
    setLoading(true);
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setPolls(data);
    setLoading(false);
  }

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name");
    if (!error && data) {
      const map = {};
      data.forEach((p) => {
        map[p.id] = p;
      });
      setProfileMap(map);
    }
  }

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

  function creatorLabel(poll) {
    if (!poll.created_by) return "Unknown (legacy poll)";
    const profile = profileMap[poll.created_by];
    if (!profile) return "Unknown (no profile record)";
    return profile.full_name || profile.email || "Unknown";
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this poll permanently? This cannot be undone."))
      return;
    const { error } = await supabase.from("polls").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    setPolls((prev) => prev.filter((p) => p.id !== id));
  }

  function startEdit(poll) {
    setEditingId(poll.id);
    setEditForm({ question: poll.question });
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from("polls")
      .update({ question: editForm.question })
      .eq("id", id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    setEditingId(null);
    fetchPolls();
  }

  async function toggleVoters(poll) {
    if (expandedVoters === poll.id) {
      setExpandedVoters(null);
      return;
    }
    setExpandedVoters(poll.id);
    setVotersLoading(true);

    const { data, error } = await supabase
      .from("user_votes")
      .select("user_id, option_index, voted_at")
      .eq("poll_id", poll.id)
      .order("voted_at", { ascending: false });

    if (!error && data) {
      const options = parseOptions(poll.options);
      const enriched = data.map((v) => {
        const profile = profileMap[v.user_id];
        return {
          ...v,
          label: profile?.full_name || profile?.email || v.user_id,
          email: profile?.email || "—",
          optionText: options[v.option_index] ?? `Option ${v.option_index + 1}`,
        };
      });
      setVoters(enriched);
    }
    setVotersLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  function totalVotes(votes) {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((a, b) => a + b, 0);
  }

  const grandTotalVotes = polls.reduce((sum, p) => sum + totalVotes(p.votes), 0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6ee7a8",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 14,
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e2e8",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "clamp(16px, 4vw, 32px)",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "#6ee7a8",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              ● system online
            </p>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: "4px 0 0",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Admin Control Panel
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "#161620",
              border: "1px solid #2a2a38",
              color: "#e2e2e8",
              padding: "9px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1f1f2c";
              e.currentTarget.style.borderColor = "#3a3a4a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#161620";
              e.currentTarget.style.borderColor = "#2a2a38";
            }}
          >
            Log out
          </button>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Polls", value: polls.length, color: "#8b7cf0" },
            { label: "Total Votes", value: grandTotalVotes, color: "#f5a623" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#12121a",
                border: "1px solid #202030",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#7a7a8c",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 6px",
                  fontWeight: 700,
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  margin: 0,
                  color: stat.color,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Poll list */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#7a7a8c",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Manage Polls
        </p>

        {polls.map((poll) => (
          <div
            key={poll.id}
            style={{
              background: "#12121a",
              border: "1px solid #202030",
              borderRadius: 12,
              padding: 18,
              marginBottom: 12,
            }}
          >
            {editingId === poll.id ? (
              <div>
                <label
                  style={{
                    fontSize: 11,
                    color: "#7a7a8c",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Question
                </label>
                <input
                  value={editForm.question}
                  onChange={(e) =>
                    setEditForm({ ...editForm, question: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginBottom: 14,
                    padding: 10,
                    borderRadius: 8,
                    background: "#0a0a0f",
                    border: "1px solid #2a2a38",
                    color: "#fff",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => saveEdit(poll.id)}
                    style={{
                      background: "#6ee7a8",
                      color: "#0a0a0f",
                      border: "none",
                      padding: "9px 18px",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      background: "transparent",
                      color: "#7a7a8c",
                      border: "1px solid #2a2a38",
                      padding: "9px 18px",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", margin: "0 0 6px" }}>
                  {poll.question}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: "#8b7cf0",
                    margin: "0 0 4px",
                    fontWeight: 600,
                  }}
                >
                  created by: {creatorLabel(poll)}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: "#7a7a8c",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    margin: "0 0 4px",
                  }}
                >
                  created: {poll.created_at ? new Date(poll.created_at).toLocaleString() : "—"}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#7a7a8c",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    margin: "0 0 14px",
                  }}
                >
                  votes: {totalVotes(poll.votes)}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => startEdit(poll)}
                    style={{
                      background: "#161620",
                      border: "1px solid #2a2a38",
                      color: "#e2e2e8",
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(poll.id)}
                    style={{
                      background: "rgba(224,64,92,0.1)",
                      border: "1px solid rgba(224,64,92,0.4)",
                      color: "#e0405c",
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleVoters(poll)}
                    style={{
                      background: "transparent",
                      border: "1px solid #2a2a38",
                      color: "#8b7cf0",
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {expandedVoters === poll.id ? "Hide voters ▲" : "View voters ▼"}
                  </button>
                </div>
              </div>
            )}

            {expandedVoters === poll.id && (
              <div
                style={{
                  marginTop: 14,
                  background: "#0a0a0f",
                  border: "1px solid #1a1a26",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                {votersLoading ? (
                  <p style={{ fontSize: 12, color: "#7a7a8c", fontFamily: "monospace" }}>
                    loading...
                  </p>
                ) : voters.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#7a7a8c", fontFamily: "monospace" }}>
                    no votes yet
                  </p>
                ) : (
                  <div style={{ maxHeight: 240, overflowY: "auto", fontSize: 12 }}>
                    {voters.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid #161620",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              color: "#e2e2e8",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.email}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0",
                              color: "#7a7a8c",
                              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                              fontSize: 11,
                            }}
                          >
                            {new Date(v.voted_at).toLocaleString()}
                          </p>
                        </div>
                        <span
                          style={{
                            background: "rgba(139,124,240,0.12)",
                            color: "#8b7cf0",
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {v.optionText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;