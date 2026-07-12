import { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "./supabase";
import TabBar from "./components/TabBar";
import PollCard from "./components/PollCard";
import ResultsCard from "./components/ResultsCard";
import CreatePoll from "./components/CreatePoll";
import Landing from "./components/Landing";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import logo from "./assets/logo-v2.png";
import StarBorder from "./components/StarBorder";
import "./App.css";

function App() {
  const [pollData, setPollData] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Track login session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load all polls
  useEffect(() => {
    async function fetchPolls() {
      try {
        const { data, error } = await supabase
          .from("polls")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          setError(error.message);
          return;
        }

        setPollData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPolls();
  }, []);

  // Load this user's own votes once logged in
  useEffect(() => {
    async function fetchUserVotes() {
      if (!session) {
        setUserVotes({});
        return;
      }
      const { data, error } = await supabase
        .from("user_votes")
        .select("poll_id, option_index")
        .eq("user_id", session.user.id);

      if (!error && data) {
        const votesMap = {};
        data.forEach((v) => {
          votesMap[v.poll_id] = v.option_index;
        });
        setUserVotes(votesMap);
      }
    }
    fetchUserVotes();
  }, [session]);

  async function handleVote(pollId, optionIdx) {
    if (!session) return;
    const userId = session.user.id;
    const previousVote = userVotes[pollId];

    const poll = pollData.find((p) => p.id === pollId);
    const votes = Array.isArray(poll.votes)
      ? [...poll.votes]
      : poll.votes.replace(/^{|}$/g, "").split(",").map(Number);

    // Unvote
    if (optionIdx === null) {
      if (previousVote === undefined) return;

      votes[previousVote] = Math.max(0, votes[previousVote] - 1);

      await supabase
        .from("user_votes")
        .delete()
        .eq("user_id", userId)
        .eq("poll_id", pollId);
      await supabase.from("polls").update({ votes }).eq("id", pollId);
      await supabase.from("vote_logs").insert({
        poll_id: pollId,
        option_index: previousVote,
        action: "unvote",
      });

      const newUserVotes = { ...userVotes };
      delete newUserVotes[pollId];
      setUserVotes(newUserVotes);

      setPollData((prev) =>
        prev.map((p) => (p.id !== pollId ? p : { ...p, votes }))
      );
      return;
    }

    if (previousVote === optionIdx) return;

    if (previousVote !== undefined) {
      votes[previousVote] = Math.max(0, votes[previousVote] - 1);
    }
    votes[optionIdx] += 1;

    await supabase
      .from("user_votes")
      .upsert(
        { user_id: userId, poll_id: pollId, option_index: optionIdx },
        { onConflict: "user_id,poll_id" }
      );
    await supabase.from("polls").update({ votes }).eq("id", pollId);
    await supabase.from("vote_logs").insert({
      poll_id: pollId,
      option_index: optionIdx,
      action: previousVote !== undefined ? "switch" : "vote",
    });

    setUserVotes((prev) => ({ ...prev, [pollId]: optionIdx }));
    setPollData((prev) =>
      prev.map((p) => (p.id !== pollId ? p : { ...p, votes }))
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function HomeScreen() {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "#9d90f5",
            fontSize: "18px",
            fontWeight: 600,
            background: "#0a0a1a",
          }}
        >
          Loading polls...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: "20px", color: "red", fontSize: "16px", textAlign: "center" }}>
          Error: {error}
        </div>
      );
    }

    const fullName =
      session?.user?.user_metadata?.full_name || session?.user?.email || "";
    const initials = fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#e9e9ef",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
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
          {/* Header */}
          <div
            style={{
              background: "#12172b",
              padding: "20px 20px 16px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: "linear-gradient(to bottom, #E24B4A 50%, #3B6D11 50%)",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#12172b",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {initials}
                </div>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                  {fullName}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign out
              </button>
            </div>

            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "16px 0 4px" }}>
              Kenya Polls
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>
              Active polls from across the country
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#534AB7",
                }}
              >
                ACTIVE POLLS
              </span>
              <Link to="/create" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "#534AB7",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "9px 16px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#453e9c";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#534AB7";
                  }}
                >
                  + New poll
                </button>
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pollData.map((poll) => {
                const voted = userVotes[poll.id] !== undefined;
                return (
                  <StarBorder
                    key={poll.id}
                    as="div"
                    className={`poll-star-card${voted ? " voted" : ""}`}
                    color={voted ? "#534AB7" : "#a89ef0"}
                    speed="4s"
                    thickness={2}
                  >
                    <Link
                      to={`/poll/${poll.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        gap: 12,
                      }}
                    >
                      <span>{poll.question}</span>
                      {voted && (
                        <span
                          style={{
                            background: "#ece9fd",
                            color: "#534AB7",
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          VOTED
                        </span>
                      )}
                    </Link>
                  </StarBorder>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function PollDetailScreen() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("vote");
    const poll = pollData.find((p) => String(p.id) === id);

    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "#9d90f5",
            fontSize: "18px",
            fontWeight: 600,
            background: "#0a0a1a",
          }}
        >
          Loading...
        </div>
      );
    }

    if (!poll) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "#fff",
            gap: "16px",
          }}
        >
          <p>Poll not found.</p>
          <Link to="/" style={{ color: "#9d90f5" }}>
            ← Back to all polls
          </Link>
        </div>
      );
    }

    return (
      <div className="page-wrap">
        <div className="cinematic-bg">
          <div
            className="cinematic-bg-image"
            style={{ background: "linear-gradient(135deg, #1a1a2e, #2d2d5a)" }}
          />
        </div>

        <div className="app">
          <div className="brand-header">
            <Link to="/" className="create-btn">
              ← Back
            </Link>
            <img className="brand-logo" src={logo} alt="Kenya Polls logo" />
          </div>

          <div className="home-body">
            <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

            {activeTab === "vote" && (
              <PollCard
                poll={poll}
                userVote={userVotes[poll.id]}
                onVote={handleVote}
              />
            )}

            {activeTab === "results" && (
              <ResultsCard poll={poll} userVote={userVotes[poll.id]} />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div style={{ color: "#9d90f5", padding: 40, textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public landing + auth pages */}
      <Route
        path="/welcome"
        element={session ? <Navigate to="/" /> : <Landing />}
      />
      <Route
        path="/signin"
        element={session ? <Navigate to="/" /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/" /> : <SignUp />}
      />

      {/* Main app — requires login */}
      <Route
        path="/"
        element={session ? <HomeScreen /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/create"
        element={session ? <CreatePoll /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/poll/:id"
        element={session ? <PollDetailScreen /> : <Navigate to="/welcome" />}
      />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;