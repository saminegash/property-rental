"use client";

import { useState } from "react";
import { updateOwnerStatus, updateAdminNotes } from "./actions";

type OwnerData = {
  id: string;
  user_id: string;
  owner_type: string;
  business_name: string | null;
  verification_status: string;
  admin_notes: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
  };
};

export default function OwnerCard({ owner }: { owner: OwnerData }) {
  const [status, setStatus] = useState(owner.verification_status);
  const [notes, setNotes] = useState(owner.admin_notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateOwnerStatus(owner.id, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Status updated");
    }
    setLoading(false);
  }

  async function handleSaveNotes() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateAdminNotes(owner.id, notes);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Notes saved");
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-card" style={{ padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)" }}>
            {owner.profile.full_name || "Unknown Name"}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {owner.profile.email} • {owner.profile.phone || "No phone"} • {owner.profile.city || "No city"}
          </p>
          <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
            <span style={{ fontWeight: 500 }}>Type:</span> {owner.owner_type}
            {owner.business_name && <span> • <span style={{ fontWeight: 500 }}>Business:</span> {owner.business_name}</span>}
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <select 
            value={status} 
            onChange={handleStatusChange}
            disabled={loading}
            className="form-input"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", width: "auto" }}
          >
            <option value="not_submitted">Not Submitted</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          {loading && <span style={{ fontSize: "0.75rem", color: "var(--color-primary)" }}>Saving...</span>}
        </div>
      </div>

      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Admin Notes (Internal)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input 
            type="text" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            className="form-input" 
            placeholder="Add internal notes about this owner..."
            style={{ flex: 1 }}
          />
          <button 
            onClick={handleSaveNotes}
            disabled={loading || notes === (owner.admin_notes || "")}
            className="auth-button"
            style={{ marginTop: 0, padding: "0.5rem 1rem" }}
          >
            Save
          </button>
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
