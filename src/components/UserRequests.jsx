import React from "react";

export default function UserRequests() {
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "16px" }}>
      <h2>User Requests</h2>
      <p style={{ color: "#64748B" }}>Fitur untuk melihat permintaan update WI dari operator lapangan.</p>
      <div style={{ padding: "40px", textAlign: "center", border: "2px dashed #E2E8F0", borderRadius: "12px", marginTop: "20px" }}>
        Belum ada permintaan masuk.
      </div>
    </div>
  );
}