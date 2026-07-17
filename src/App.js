import { useState, useEffect } from "react";
import { Routes, Route, useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "./supabase";
import PollCard from "./components/PollCard";
import CreatePoll from "./components/CreatePoll";
import Landing from "./components/Landing";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import logo from "./assets/logo-v2.png";
import StarBorder from "./components/StarBorder";
import ResetPassword from "./components/ResetPassword";
import MyPolls from "./components/MyPolls";
import ForgotPassword from "./components/ForgotPassword";
import GlareHover from './components/GlareHover';
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
        {/* Header — GlareHover applied here ONLY, nothing outside this block changed */}
        <GlareHover
          width="100%"
          height="auto"
          background="linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%)"
          borderRadius="0px"
          borderColor="rgba(255,255,255,0.08)"
          glareColor="#8ecbff"
          glareOpacity={0.35}
          glareAngle={-30}
          glareSize={300}
          transitionDuration={1400}
          style={{
            display: "block",
            padding: "clamp(20px, 5vw, 32px) 20px clamp(16px, 4vw, 24px)",
            position: "relative",
            boxSizing: "border-box",
            boxShadow:
              "inset 0 2px 12px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.08)",
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
              marginBottom: "clamp(16px, 5vw, 28px)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, paddingRight: 16 }}>
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
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fullName}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                background: "linear-gradient(180deg, #2b2b2f, #131316)",
                border: "1px solid #050506",
                color: "#f2f2f2",
                fontSize: 13,
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "background 0.15s ease, transform 0.15s ease",
                flexShrink: 0,
                marginLeft: "auto",
                paddingLeft: 16,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 4px 10px rgba(0,0,0,0.45)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(180deg, #3a3a3f, #1c1c1f)";
                e.currentTarget.style.transform = "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(180deg, #2b2b2f, #131316)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Sign out
            </button>
          </div>

          <h1 style={{ color: "#fff", fontSize: "clamp(19px, 5vw, 24px)", fontWeight: 700, margin: "0 0 6px", width: "100%" }}>
            Kenya Polls
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0, width: "100%" }}>
            Active polls from across the country
          </p>
        </GlareHover>

        {/* Body — untouched */}
        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 8,
              flexWrap: "wrap",
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

            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/my-polls" style={{ textDecoration: "none" }}>
                <GlareHover
                  width="auto"
                  height="auto"
                  background="transparent"
                  borderRadius="8px"
                  borderColor="#534AB7"
                  glareColor="#ffffff"
                  glareOpacity={0.7}
                  glareAngle={-30}
                  glareSize={260}
                  transitionDuration={1600}
                  style={{
                    display: "inline-block",
                    boxShadow:
                      "inset 0 2px 5px rgba(0,0,0,0.08), 0 4px 10px rgba(83,74,183,0.18)",
                  }}
                >
                  <button
                    style={{
                      background: "transparent",
                      color: "#534AB7",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    My Polls
                  </button>
                </GlareHover>
              </Link>

              <Link to="/create" style={{ textDecoration: "none" }}>
                <GlareHover
                  width="auto"
                  height="auto"
                  background="#534AB7"
                  borderRadius="8px"
                  borderColor="rgba(255,255,255,0.15)"
                  glareColor="#ffffff"
                  glareOpacity={0.55}
                  glareAngle={-30}
                  glareSize={260}
                  transitionDuration={1600}
                  style={{
                    display: "inline-block",
                    boxShadow:
                      "inset 0 2px 5px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.15), 0 6px 14px rgba(83,74,183,0.35)",
                  }}
                >
                  <button
                    style={{
                      background: "transparent",
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
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    + New poll
                  </button>
                </GlareHover>
              </Link>
            </div>
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
            <PollCard
              poll={poll}
              userVote={userVotes[poll.id]}
              onVote={handleVote}
            />
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
  <Route
    path="/forgot-password"
    element={session ? <Navigate to="/" /> : <ForgotPassword />}
  />
  <Route path="/reset-password" element={<ResetPassword />} />

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
    path="/my-polls"
    element={session ? <MyPolls /> : <Navigate to="/welcome" />}
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