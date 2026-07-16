import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import logo from "../assets/logo-v2.png";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/");
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#f2f3f7",
        padding: "clamp(12px, 4vw, 20px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "clamp(16px, 5vw, 40px) clamp(12px, 4vw, 20px)",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <img
          src={logo}
          alt="Kenya Polls logo"
          style={{ height: "clamp(44px, 12vw, 56px)", margin: "0 auto 8px", display: "block" }}
        />
        <p style={{ color: "#6b6f80", fontSize: "13px", marginBottom: "28px" }}>
          Kenya's Voice, Decided Together
        </p>

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Email Address
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: "10px",
              padding: "10px 12px",
              marginBottom: "18px",
              gap: "10px",
            }}
          >
            <input
              type="email"
              placeholder="e.g. johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
          </div>

          <label
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Password
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: "10px",
              padding: "10px 12px",
              marginBottom: "8px",
              gap: "10px",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer", fontSize: "12px", color: "#9096a8", flexShrink: 0 }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {error && (
            <p
              style={{
                color: "#e0405c",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "#4c3fe0",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "13px", color: "#6b6f80" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#4c3fe0", fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;