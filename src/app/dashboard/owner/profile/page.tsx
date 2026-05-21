import React from "react";

export default function OwnerProfilePage() {
  return (
    <div>
      <h1 className="dashboard-title">Profile & Verification</h1>
      <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Verification Management Coming Soon
        </h2>
        <p className="dashboard-hint" style={{ maxWidth: "500px", margin: "0 auto" }}>
          This section will allow you to securely upload IDs, business licenses, and manage your public owner profile details to build trust with users.
        </p>
      </div>
    </div>
  );
}
