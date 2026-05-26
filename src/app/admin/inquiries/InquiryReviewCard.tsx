"use client";

import { useState } from "react";
import { 
  updateInquiryStatus, 
  updateInquiryAdminNotes, 
  updateInquiryOwnerNotes,
  getInquiryHistory
} from "./actions";

type RequestProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type RequestListing = {
  title: string;
  owner_id: string;
};

type EnrichedInquiry = {
  id: string;
  listing_id: string;
  requester_id: string | null;
  requester_name: string;
  requester_phone: string;
  requester_email: string | null;
  request_type: string;
  message: string | null;
  preferred_contact_method: string | null;
  preferred_viewing_date: string | null;
  budget_amount: number | null;
  status: string;
  admin_notes: string | null;
  owner_response_notes: string | null;
  created_at: string;
  listing: RequestListing;
  owner: RequestProfile | null;
  requesterProfile: RequestProfile | null;
};

const STATUS_OPTIONS = [
  "new_request",
  "admin_reviewing",
  "owner_contacted",
  "owner_available",
  "owner_unavailable",
  "requester_contacted",
  "confirmed",
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

type HistoryEvent = {
  id: string;
  old_status: string | null;
  new_status: string;
  is_admin_override: boolean;
  created_at: string;
  note: string | null;
  changed_by_profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function InquiryReviewCard({ request }: { request: EnrichedInquiry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEvent[] | null>(null);
  
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");
  const [ownerNotes, setOwnerNotes] = useState(request.owner_response_notes || "");
  
  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    const result = await updateInquiryStatus(request.id, newStatus);
    
    if (result?.requiresOverride) {
      const reason = window.prompt(
        `${result.error}\n\nThis is an invalid transition. If you are sure you want to proceed, please provide an override reason below:`
      );
      if (reason) {
        const overrideResult = await updateInquiryStatus(request.id, newStatus, reason);
        if (overrideResult?.error) {
          alert(overrideResult.error);
        }
      }
    } else if (result?.error) {
      alert(result.error);
    }
    
    setIsUpdating(false);
  }

  async function handleNotesSave() {
    setIsUpdating(true);
    if (adminNotes !== (request.admin_notes || "")) {
      await updateInquiryAdminNotes(request.id, adminNotes);
    }
    if (ownerNotes !== (request.owner_response_notes || "")) {
      await updateInquiryOwnerNotes(request.id, ownerNotes);
    }
    setIsUpdating(false);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const { data, error } = await getInquiryHistory(request.id);
    if (error) {
      alert("Error loading history: " + error);
    } else {
      setHistory(data || []);
    }
    setHistoryLoading(false);
  }

  return (
    <div className="review-section">
      <div
        className="review-section__header"
        style={{ cursor: "pointer" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 600 }}>[{formatStatus(request.request_type)}]</span>
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
            
            {/* Left Column: Inquiry Details */}
            <div>
              <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Inquiry Details
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span className="review-label">Type</span>
                  <span className="review-value">
                    {formatStatus(request.request_type)}
                  </span>
                </div>
                {request.preferred_viewing_date && (
                  <div>
                    <span className="review-label">Preferred Viewing</span>
                    <span className="review-value">
                      {new Date(request.preferred_viewing_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {request.budget_amount && (
                  <div>
                    <span className="review-label">Budget</span>
                    <span className="review-value">
                      {request.budget_amount.toLocaleString()} ETB
                    </span>
                  </div>
                )}
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
                Requester Info
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <span className="review-label">Name</span>
                  <span className="review-value">{request.requester_name} {request.requesterProfile ? "(Registered User)" : "(Guest)"}</span>
                </div>
                <div>
                  <span className="review-label">Phone</span>
                  <span className="review-value">{request.requester_phone}</span>
                </div>
                {request.requester_email && (
                  <div>
                    <span className="review-label">Email</span>
                    <span className="review-value">{request.requester_email}</span>
                  </div>
                )}
                {request.preferred_contact_method && (
                  <div>
                    <span className="review-label">Prefers to be contacted via</span>
                    <span className="review-value">{request.preferred_contact_method}</span>
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
              
              {/* Quick Status Flow Buttons - Owner */}
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Owner Flow</span>
              </div>
              <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button 
                  onClick={() => handleStatusChange("admin_reviewing")}
                  disabled={isUpdating || request.status === "admin_reviewing"}
                  className="auth-button auth-button--secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", flex: 1 }}
                >
                  Reviewing
                </button>
                <button 
                  onClick={() => handleStatusChange("owner_contacted")}
                  disabled={isUpdating || request.status === "owner_contacted"}
                  className="auth-button auth-button--secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", flex: 1 }}
                >
                  Contacted
                </button>
                <button 
                  onClick={() => handleStatusChange("owner_available")}
                  disabled={isUpdating || request.status === "owner_available"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-success)", flex: 1 }}
                >
                  Available
                </button>
                <button 
                  onClick={() => handleStatusChange("owner_unavailable")}
                  disabled={isUpdating || request.status === "owner_unavailable"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-error)", flex: 1 }}
                >
                  Unavailable
                </button>
              </div>

              {/* Quick Status Flow Buttons - Requester/Resolution */}
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Resolution Flow</span>
              </div>
              <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button 
                  onClick={() => handleStatusChange("requester_contacted")}
                  disabled={isUpdating || request.status === "requester_contacted"}
                  className="auth-button auth-button--secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", flex: 1 }}
                >
                  Contacted
                </button>
                <button 
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={isUpdating || request.status === "confirmed"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-primary)", flex: 1 }}
                >
                  Confirm
                </button>
                <button 
                  onClick={() => handleStatusChange("completed")}
                  disabled={isUpdating || request.status === "completed"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-success)", flex: 1 }}
                >
                  Complete
                </button>
                <button 
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isUpdating || request.status === "cancelled"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-error)", flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusChange("rejected")}
                  disabled={isUpdating || request.status === "rejected"}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", backgroundColor: "var(--color-error)", flex: 1 }}
                >
                  Reject
                </button>
              </div>

              <div className="auth-field" style={{ marginBottom: "1rem" }}>
                <label className="auth-label">All Statuses</label>
                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
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

              <div className="auth-field" style={{ marginBottom: "1rem" }}>
                <label className="auth-label">Owner Response Notes</label>
                <textarea
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  className="auth-input"
                  rows={2}
                  placeholder="Record owner availability context..."
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Internal Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="auth-input"
                  rows={2}
                  placeholder="Only visible to admins..."
                />
                <button
                  onClick={handleNotesSave}
                  disabled={isUpdating || (adminNotes === (request.admin_notes || "") && ownerNotes === (request.owner_response_notes || ""))}
                  className="auth-button"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", marginTop: "0.5rem" }}
                >
                  {isUpdating ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>

          </div>
          
          {/* Status Timeline Section */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", color: "var(--color-text-heading)", margin: 0 }}>
                Status History & Audit Log
              </h4>
              <button 
                onClick={loadHistory} 
                disabled={historyLoading}
                className="auth-button auth-button--secondary"
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", width: "auto" }}
              >
                {historyLoading ? "Loading..." : "Load History"}
              </button>
            </div>
            
            {history !== null && (
              <div style={{ backgroundColor: "var(--color-surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                {history.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                    No status history recorded.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {history.map((event) => (
                      <div key={event.id} style={{ display: "flex", gap: "1rem", borderLeft: "2px solid var(--color-border)", paddingLeft: "1rem", position: "relative" }}>
                        <div style={{ position: "absolute", left: "-5px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: event.is_admin_override ? "var(--color-error)" : "var(--color-primary)" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                {formatStatus(event.old_status || "Unknown")} → {formatStatus(event.new_status)}
                              </span>
                              {event.is_admin_override && (
                                <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,0,0,0.1)", color: "var(--color-error)", padding: "0.125rem 0.375rem", borderRadius: "var(--radius-sm)", fontWeight: "bold" }}>
                                  OVERRIDE
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                            Changed by: {event.changed_by_profile ? `${event.changed_by_profile.full_name} (${event.changed_by_profile.email})` : "System/Unknown"}
                          </div>
                          
                          {event.note && (
                            <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontStyle: "italic", borderLeft: "2px solid var(--color-error)" }}>
                              &quot;{event.note}&quot;
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
