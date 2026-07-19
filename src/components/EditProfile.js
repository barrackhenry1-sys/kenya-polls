import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

function EditProfile({ session }) {
  const navigate = useNavigate();
  const currentName =
    session?.user?.user_metadata?.full_name || "";
  const [fullName, setFullName] = useState(currentName);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSaved(true);
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
          padding: "clamp(24px,6vw,32px)",
          width: "100%",
          maxWidth: "380px",
          marginTop: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: 8, color: "#1a1a2e" }}>Edit profile</h2>
        <p style={{ color: "#6b6f80", fontSize: 14, marginBottom: 24 }}>
          Update the name shown on your account.
        </p>

        <form onSubmit={handleSave} style={{ textAlign: "left" }}>
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
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
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
            Email
          </label>
          <div
            style={{
              border: "1px solid #e0e1e8",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
              background: "#f7f7fa",
              color: "#9096a8",
              fontSize: 14,
            }}
          >
            {session?.user?.email}
          </div>

          {error && (
            <p style={{ color: "#e0405c", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}
          {saved && (
            <p
              style={{
                color: "#2e8b57",
                fontSize: 13,
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              Profile updated.
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
              marginBottom: 12,
            }}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: 12,
              background: "transparent",
              color: "#534AB7",
              border: "1px solid #534AB7",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Back home
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;