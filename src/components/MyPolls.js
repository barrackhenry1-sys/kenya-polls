import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function MyPolls() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyPolls() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("created_by", userId)
        .order("id", { ascending: false });

      if (!error) setPolls(data);
      setLoading(false);
    }
    fetchMyPolls();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#534AB7" }}>
        Loading your polls...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e9e9ef",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        justifyContent: "center",
        padding: "clamp(16px, 5vw, 40px) clamp(12px, 4vw, 20px)",
      }}
    >
      <div
        style={{
          background: "#f7f6f2",
          borderRadius: 16,
          overflow: "hidden",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            background: "#12172b",
            padding: "20px 20px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: 13,
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            My Polls
          </h1>
        </div>

        <div style={{ padding: 20 }}>
          {polls.length === 0 ? (
            <p style={{ color: "#6b6f80", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              You haven't created any polls yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {polls.map((poll) => (
                <Link
                  key={poll.id}
                  to={`/poll/${poll.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e3db",
                      borderRadius: 12,
                      padding: "14px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1a1a",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {poll.question}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPolls;