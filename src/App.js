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
import flagBg from "./assets/kenyan hand.png";
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
        <div
          style={{
            padding: "20px",
            color: "red",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          Error: {error}
        </div>
      );
    }

    const fullName =
      session?.user?.user_metadata?.full_name || session?.user?.email || "";
    const displayName = fullName
      .split(" ")
      .map((w) => w.toUpperCase())
      .join(" ");

    return (
      <div style={{ minHeight: "100vh", background: "#f2f3f7" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #6f5ce6, #8b7cf0)",
            padding: "24px 20px 32px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 6px",
                  position: "relative",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#6f5ce6">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#4c3fe0",
                    border: "2px solid #fff",
                  }}
                />
              </div>
              <p
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  margin: 0,
                }}
              >
                {displayName}
              </p>
            </div>

            <img
              src={logo}
              alt="Kenya Polls logo"
              style={{
                height: 44,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 20,
              }}
            />

            <button
              onClick={handleSignOut}
              style={{
                background: "#1a1a2e",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              SIGN OUT
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <p
                style={{
                  color: "#4c3fe0",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  margin: 0,
                }}
              >
                ACTIVE POLLS
              </p>
              <div style={{ flex: 1, height: 1, background: "#d8d9e3" }} />
            </div>
            <Link to="/create" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#1a1a2e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                + New Poll
              </button>
            </Link>
          </div>

          {pollData.map((poll) => {
            const voted = userVotes[poll.id] !== undefined;
            return (
              <Link
                key={poll.id}
                to={`/poll/${poll.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "18px 20px",
                    marginBottom: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: voted ? "1px solid #ded9fb" : "1px solid #eceef3",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#1a1a2e",
                      flex: 1,
                    }}
                  >
                    {poll.question}
                  </span>
                  {voted && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#ece9fd",
                        color: "#4c3fe0",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        marginLeft: 12,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4c3fe0"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      VOTED
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
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
            style={{ backgroundImage: `url(${flagBg})` }}
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
