import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminDashboard() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: "", ends: "" });
  const [expandedLogs, setExpandedLogs] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchPolls();
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
    setEditForm({
      question: poll.question,
      ends: poll.ends ? poll.ends.slice(0, 16) : "",
    });
  }

  async function saveEdit(id) {
    const { error } = await supabase
      .from("polls")
      .update({
        question: editForm.question,
        ends: new Date(editForm.ends).toISOString(),
      })
      .eq("id", id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    setEditingId(null);
    fetchPolls();
  }

  async function toggleLogs(pollId) {
    if (expandedLogs === pollId) {
      setExpandedLogs(null);
      return;
    }
    setExpandedLogs(pollId);
    setLogsLoading(true);
    const { data, error } = await supabase
      .from("vote_logs")
      .select("*")
      .eq("poll_id", pollId)
      .order("created_at", { ascending: false });
    if (!error) setLogs(data);
    setLogsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin");
  }

  if (loading) {
    return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;
  }

  return (
    <div
      style={{ maxWidth: 700, margin: "0 auto", padding: 24, color: "#fff" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1>Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            background: "#6f5ce6",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {polls.map((poll) => (
        <div
          key={poll.id}
          style={{
            background: "#1a1a2e",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {editingId === poll.id ? (
            <div>
              <input
                value={editForm.question}
                onChange={(e) =>
                  setEditForm({ ...editForm, question: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                }}
              />
              <input
                type="datetime-local"
                value={editForm.ends}
                onChange={(e) =>
                  setEditForm({ ...editForm, ends: e.target.value })
                }
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                }}
              />
              <button
                onClick={() => saveEdit(poll.id)}
                style={{ marginRight: 8 }}
              >
                Save
              </button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700 }}>{poll.question}</p>
              <p style={{ fontSize: 13, opacity: 0.7 }}>Ends: {poll.ends}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => startEdit(poll)}>Edit</button>
                <button
                  onClick={() => handleDelete(poll.id)}
                  style={{ color: "#ff6b6b" }}
                >
                  Delete
                </button>
                <button onClick={() => toggleLogs(poll.id)}>
                  {expandedLogs === poll.id ? "Hide votes" : "View votes"}
                </button>
              </div>
            </div>
          )}

          {expandedLogs === poll.id && (
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 12,
              }}
            >
              {logsLoading ? (
                <p>Loading votes...</p>
              ) : logs.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No votes yet.</p>
              ) : (
                <ul style={{ maxHeight: 200, overflowY: "auto", fontSize: 13 }}>
                  {logs.map((log) => (
                    <li key={log.id}>
                      Option {log.option_index + 1} — {log.action} —{" "}
                      {new Date(log.created_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
