"use client";

import { useState } from "react";
import { updateOwnerStatus } from "./actions";

type OwnerData = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  business_name: string | null;
  verification_status: string;
  joined_at: string;
};

export default function OwnerCard({ owner }: { owner: OwnerData }) {
  const [status, setStatus] = useState(owner.verification_status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateOwnerStatus(owner.user_id, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Status updated");
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)" }}>
            {owner.full_name || "Unknown Name"}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {owner.email} • {owner.phone || "No phone"} • {owner.city || "No city"}
          </p>
          {owner.business_name && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
              <span style={{ fontWeight: 500 }}>Business:</span> {owner.business_name}
            </div>
          )}
          <p style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Owner since {new Date(owner.joined_at).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <select 
            value={status} 
            onChange={handleStatusChange}
            disabled={loading}
            className="form-input"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", width: "auto" }}
          >
            <option value="unverified">Unverified</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="suspended">Suspended</option>
          </select>
          {loading && <span style={{ fontSize: "0.75rem", color: "var(--color-primary)" }}>Saving...</span>}
        </div>
      </div>

      {(error || success) && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "0.5rem", 
          fontSize: "0.875rem", 
          borderRadius: "var(--radius-sm)",
          backgroundColor: error ? "var(--color-error-bg)" : "var(--color-success-bg)",
          color: error ? "var(--color-error-text)" : "var(--color-success-text)",
          border: `1px solid ${error ? "var(--color-error-border)" : "var(--color-success-border)"}`
        }}>
          {error || success}
        </div>
      )}
    </div>
  );
}
