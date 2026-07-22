import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "../supabase";

function UserLatestPoll() {
  const { userId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | found | not_found
  const [publicUuid, setPublicUuid] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatestPoll() {
      const { data, error } = await supabase
        .from("polls")
        .select("public_uuid")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setStatus("not_found");
        return;
      }

      setPublicUuid(data.public_uuid);
      setStatus("found");
    }

    fetchLatestPoll();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#fff", fontSize: 13 }}>No polls found for this user.</p>
      </div>
    );
  }

  return <Navigate to={`/iframe/${publicUuid}`} replace />;
}

const containerStyle = {
  width: "360px",
  minHeight: "500px",
  maxWidth: "100vw",
  margin: "0 auto",
  background: "#0d0f1a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  boxSizing: "border-box",
};

export default UserLatestPoll;