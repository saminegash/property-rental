import React from "react";

export default function OwnerAnalyticsPage() {
  return (
    <div>
      <h1 className="dashboard-title">Analytics</h1>
      <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Listing Analytics Coming Soon
        </h2>
        <p className="dashboard-hint" style={{ maxWidth: "500px", margin: "0 auto" }}>
          Soon you will be able to see exactly how many people are viewing your listings, clicking your phone number, and submitting requests across all your properties and vehicles.
        </p>
      </div>
    </div>
  );
}
