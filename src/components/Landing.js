import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-v2.png";

function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f2f3f7",
        padding: "clamp(16px, 5vw, 40px) clamp(12px, 4vw, 20px)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <img
          src={logo}
          alt="Kenya Polls logo"
          style={{ height: "clamp(56px, 18vw, 80px)", margin: "0 auto 24px", display: "block" }}
        />
        <h1
          style={{ color: "#1a1a2e", fontSize: "clamp(19px, 5.5vw, 22px)", marginBottom: "12px" }}
        >
          Voice of the People
        </h1>
        <p style={{ color: "#6b6f80", fontSize: "14px", marginBottom: "32px" }}>
          Empowering every Kenyan through real-time polling and community
          insights.
        </p>
        <button
          onClick={() => navigate("/signup")}
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
            marginBottom: "12px",
          }}
        >
          Get Started →
        </button>
        <button
          onClick={() => navigate("/signin")}
          style={{
            width: "100%",
            padding: "13px",
            background: "#fff",
            color: "#4c3fe0",
            border: "2px solid #4c3fe0",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
        <p style={{ marginTop: "24px", fontSize: "11px", color: "#a0a3b1" }}>
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default Landing;