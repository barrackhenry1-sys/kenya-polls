import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot — real users never fill this
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validPassword(pw) {
    return pw.length >= 8 && /\d/.test(pw);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);

    // Honeypot check — bots tend to fill every field, humans never see this one
    if (website.trim() !== "") {
      return; // silently drop, no error shown to the bot
    }

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validPassword(password)) {
      setError("Password must be at least 8 characters and include a number");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
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
        padding: "clamp(16px, 5vw, 40px) clamp(12px, 4vw, 20px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "380px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #6f5ce6, #4c3fe0)",
            padding: "clamp(24px, 7vw, 36px) clamp(16px, 5vw, 24px)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Create your account
          </h1>
        </div>

        <form
          onSubmit={handleSignUp}
          style={{
            padding: "clamp(18px, 6vw, 28px) clamp(18px, 6vw, 28px) clamp(20px, 6vw, 32px)",
          }}
        >
          {/* Honeypot field — hidden from real users via CSS, bots fill it anyway */}
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoComplete="off"
            tabIndex="-1"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              opacity: 0,
            }}
          />

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: 6,
            }}
          >
            Full Name
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9096a8"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
          </div>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: 6,
            }}
          >
            Email Address
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9096a8"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
          </div>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 4,
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9096a8"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9096a8"
              strokeWidth="2"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={() => setShowPassword(!showPassword)}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p style={{ fontSize: 11, color: "#9096a8", marginBottom: 16 }}>
            At least 8 characters, including a number
          </p>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a2e",
              display: "block",
              marginBottom: 6,
            }}
          >
            Confirm Password
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e1e8",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9096a8"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                color: "#1a1a2e",
                minWidth: 0,
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13,
              color: "#6b6f80",
              marginBottom: 20,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <span>
              I agree to the{" "}
              <span style={{ color: "#4c3fe0", fontWeight: 600 }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span style={{ color: "#4c3fe0", fontWeight: 600 }}>
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {error && (
            <p style={{ color: "#e0405c", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              background: "#4c3fe0",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? "Creating..." : "Create Account"}
            {!loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>

          <p
            style={{
              marginTop: 20,
              fontSize: 13,
              color: "#6b6f80",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link to="/signin" style={{ color: "#4c3fe0", fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;