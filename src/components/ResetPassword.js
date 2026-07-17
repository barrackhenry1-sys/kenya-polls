import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Only show the form once Supabase confirms this is a genuine
  // password-recovery session (from the emailed link), not just
  // any logged-in session.
  useEffect(() => {
    // Supabase may parse the recovery token from the URL and fire
    // PASSWORD_RECOVERY before this component mounts and subscribes,
    // so also check the URL hash directly as a fallback.
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8 || !/\d/.test(password)) {
      setError("Password must be at least 8 characters and include a number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/"), 2000);
  }

  if (done) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f2f3f7" }}>
        <p style={{ color: "#1a1a2e", fontWeight: 600 }}>Password updated! Redirecting...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f2f3f7" }}>
        <p style={{ color: "#6b6f80" }}>Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#f2f3f7", padding: "clamp(16px, 5vw, 40px) clamp(12px, 4vw, 20px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px,6vw,32px)", width: "100%", maxWidth: 380, marginTop: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginBottom: 20, color: "#1a1a2e" }}>Set a new password</h2>
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e0e1e8", borderRadius: 8 }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12, border: "1px solid #e0e1e8", borderRadius: 8 }}
          />
          {error && <p style={{ color: "#e0405c", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 13, background: "#4c3fe0", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;