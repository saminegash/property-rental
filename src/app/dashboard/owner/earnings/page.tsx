import React from "react";

export default function OwnerEarningsPage() {
  return (
    <div>
      <h1 className="dashboard-title">Earnings</h1>
      <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💰</div>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Earnings Tracking Coming Soon
        </h2>
        <p className="dashboard-hint" style={{ maxWidth: "500px", margin: "0 auto" }}>
          We are building a comprehensive earnings tracker so you can see your finalized payouts, commission history, and historical performance all in one place.
        </p>
      </div>
    </div>
  );
}
