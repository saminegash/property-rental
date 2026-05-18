"use client";

import { useState } from "react";
import { updateRequestStatus, updateRequestAdminNotes } from "./actions";

type RequestProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type RequestListing = {
  title: string;
  owner_id: string;
};

type EnrichedRequest = {
  id: string;
  listing_id: string;
  renter_id: string | null;
  renter_name: string;
  renter_phone: string;
  renter_email: string | null;
  start_date: string;
  end_date: string;
  needs_driver: boolean;
  needs_delivery: boolean;
  delivery_location: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  listing: RequestListing;
  owner: RequestProfile | null;
  renterProfile: RequestProfile | null;
};

const STATUS_OPTIONS = [
  "new_request",
  "admin_reviewing",
  "owner_contacted",
  "owner_available",
  "owner_unavailable",
  "renter_contacted",
  "awaiting_payment",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "rejected",
  "disputed",
];

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RequestReviewCard({ request }: { request: EnrichedRequest }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsUpdating(true);
    await updateRequestStatus(request.id, e.target.value);
    setIsUpdating(false);
  }

  async function handleNotesSave() {
    setIsUpdating(true);
    await updateRequestAdminNotes(request.id, adminNotes);
    setIsUpdating(false);
  }

  return (
    <div className="review-section">
      <div
        className="review-section__header"
        style={{ cursor: "pointer" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>{request.listing.title}</span>
          <span style={{ color: "var(--color-text-muted)" }}>
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            className="status-badge"
            style={{
              backgroundColor:
                request.status === "new_request"
                  ? "var(--color-primary)"
                  : "var(--color-surface-hover)",
              color: request.status === "new_request" ? "#fff" : "var(--color-text)",
            }}
          >
            {formatStatus(request.status)}
          </span>
          <span>{isExpanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="review-section__body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "1.5rem" }}>
            
            {/* Left Column: Request Details */}
            <div>
              <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Request Details
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span className="review-label">Dates</span>
                  <span className="review-value">
                    {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="review-label">Logistics</span>
                  <span className="review-value">
                    {request.needs_driver ? "Needs Driver" : "Self-Drive"} 
                    {request.needs_delivery && ` • Delivery to: ${request.delivery_location}`}
                  </span>
                </div>
                {request.message && (
                  <div>
                    <span className="review-label">Message</span>
                    <span className="review-value" style={{ fontStyle: "italic" }}>
                      &quot;{request.message}&quot;
                    </span>
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: "0.875rem", marginTop: "1.5rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Renter (Applicant) Info
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span className="review-label">Name</span>
                  <span className="review-value">{request.renter_name} {request.renterProfile ? "(Registered User)" : "(Guest)"}</span>
                </div>
                <div>
                  <span className="review-label">Phone</span>
                  <span className="review-value">{request.renter_phone}</span>
                </div>
                {request.renter_email && (
                  <div>
                    <span className="review-label">Email</span>
                    <span className="review-value">{request.renter_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Owner Details & Admin Controls */}
            <div>
              <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Owner (Target) Info
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span className="review-label">Name</span>
                  <span className="review-value">{request.owner?.full_name || "Unknown"}</span>
                </div>
                <div>
                  <span className="review-label">Phone</span>
                  <span className="review-value">{request.owner?.phone || "Unknown"}</span>
                </div>
                <div>
                  <span className="review-label">Email</span>
                  <span className="review-value">{request.owner?.email || "Unknown"}</span>
                </div>
              </div>

              <h4 style={{ fontSize: "0.875rem", marginTop: "1.5rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Admin Controls
              </h4>
              <div className="auth-field" style={{ marginBottom: "1rem" }}>
                <label className="auth-label">Status Update</label>
                <select
                  value={request.status}
                  onChange={handleStatusChange}
                  disabled={isUpdating}
                  className="auth-input"
                  style={{ padding: "0.5rem" }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {formatStatus(opt)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label">Internal Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="auth-input"
                  rows={3}
                  placeholder="Only visible to admins..."
                />
                <button
                  onClick={handleNotesSave}
                  disabled={isUpdating || adminNotes === (request.admin_notes || "")}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", marginTop: "0.5rem" }}
                >
                  {isUpdating ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
