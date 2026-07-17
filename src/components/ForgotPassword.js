import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import logo from "../assets/logo-v2.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Enter your email address");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
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
          padding: "clamp(24px,6vw,32px)",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="Kenya Polls logo"
          style={{ height: "clamp(44px, 12vw, 56px)", margin: "0 auto 8px", display: "block" }}
        />
        <p style={{ color: "#6b6f80", fontSize: "13px", marginBottom: "24px" }}>
          Kenya's Voice, Decided Together
        </p>

        {sent ? (
          <>
            <h2 style={{ marginBottom: 12, color: "#1a1a2e", textAlign: "left" }}>Check your email</h2>
            <p style={{ color: "#6b6f80", fontSize: 14, marginBottom: 24, lineHeight: 1.5, textAlign: "left" }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to
              reset your password. Follow the link in that email to continue.
            </p>
            <Link
              to="/signin"
              style={{
                display: "block",
                textAlign: "center",
                padding: "13px",
                background: "#4c3fe0",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 8, color: "#1a1a2e", textAlign: "left" }}>Reset your password</h2>
            <p style={{ color: "#6b6f80", fontSize: 14, marginBottom: 24, textAlign: "left" }}>
              Enter the email address linked to your account and we'll send you a
              link to reset your password.
            </p>
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
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

              {error && (
                <p style={{ color: "#e0405c", fontSize: "13px", marginBottom: "12px" }}>
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
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p style={{ marginTop: "20px", fontSize: "13px", color: "#6b6f80", textAlign: "center" }}>
              Remembered it?{" "}
              <Link to="/signin" style={{ color: "#4c3fe0", fontWeight: 600 }}>
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;