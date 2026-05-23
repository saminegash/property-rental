"use client";

import { useState } from "react";
import { 
  updateRequestStatus, 
  updateRequestAdminNotes, 
  updateRequestOwnerNotes,
  generateCommission,
  updateCommissionStatus,
  generateSecurityDeposit,
  updateSecurityDeposit
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

type RequestCommission = {
  id: string;
  commission_base_amount: number;
  commission_amount: number;
  commission_status: string;
  rental_days: number | null;
};

type RequestRentalTerm = {
  listing_id: string;
  security_deposit_amount: number;
};

type RequestSecurityDeposit = {
  id: string;
  deposit_amount: number;
  deposit_status: string;
  payment_method: string | null;
  admin_notes: string | null;
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
  owner_response_notes: string | null;
  created_at: string;
  listing: RequestListing;
  owner: RequestProfile | null;
  renterProfile: RequestProfile | null;
  commission: RequestCommission | null;
  rentalTerm: RequestRentalTerm | null;
  securityDeposit: RequestSecurityDeposit | null;
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
  const [ownerNotes, setOwnerNotes] = useState(request.owner_response_notes || "");
  
  const [depositPaymentMethod, setDepositPaymentMethod] = useState(request.securityDeposit?.payment_method || "");
  const [depositNotes, setDepositNotes] = useState(request.securityDeposit?.admin_notes || "");

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    const result = await updateRequestStatus(request.id, newStatus);
    
    if (result?.requiresOverride) {
      const reason = window.prompt(
        `${result.error}\n\nThis is an invalid transition. If you are sure you want to proceed, please provide an override reason below:`
      );
      if (reason) {
        const overrideResult = await updateRequestStatus(request.id, newStatus, reason);
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
      await updateRequestAdminNotes(request.id, adminNotes);
    }
    if (ownerNotes !== (request.owner_response_notes || "")) {
      await updateRequestOwnerNotes(request.id, ownerNotes);
    }
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
                Financials & Commission
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr", backgroundColor: "var(--color-surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                {!request.commission ? (
                  <div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                      Commission has not been generated for this request yet.
                    </p>
                    <button
                      onClick={async () => {
                        setIsUpdating(true);
                        await generateCommission(request.id);
                        setIsUpdating(false);
                      }}
                      disabled={isUpdating}
                      className="auth-button auth-button--secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                    >
                      {isUpdating ? "Calculating..." : "Calculate Commission (5%)"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span className="review-label">Rental Days</span>
                      <span className="review-value" style={{ fontWeight: 500 }}>
                        {request.commission.rental_days || "N/A"} days
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span className="review-label">Rental Base (excl. fees)</span>
                      <span className="review-value" style={{ fontWeight: 500 }}>
                        {request.commission.commission_base_amount.toLocaleString()} Birr
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
                      <span className="review-label" style={{ color: "var(--color-primary)" }}>Platform Commission (5%)</span>
                      <span className="review-value" style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                        {request.commission.commission_amount.toLocaleString()} Birr
                      </span>
                    </div>
                    <div>
                      <span className="review-label" style={{ display: "block", marginBottom: "0.25rem" }}>Commission Status</span>
                      <select
                        value={request.commission.commission_status}
                        onChange={async (e) => {
                          setIsUpdating(true);
                          await updateCommissionStatus(request.commission!.id, e.target.value);
                          setIsUpdating(false);
                        }}
                        disabled={isUpdating}
                        className="auth-input"
                        style={{ padding: "0.375rem 0.5rem", fontSize: "0.8125rem" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="collected">Collected</option>
                        <option value="waived">Waived</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <h4 style={{ fontSize: "0.875rem", marginTop: "1.5rem", marginBottom: "0.5rem", color: "var(--color-text-heading)" }}>
                Security Deposit Tracking
              </h4>
              <div className="review-grid" style={{ gridTemplateColumns: "1fr", backgroundColor: "var(--color-surface-hover)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                {!request.securityDeposit ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <span className="review-label">Required Deposit</span>
                      <span className="review-value" style={{ fontWeight: 500 }}>
                        {request.rentalTerm?.security_deposit_amount?.toLocaleString() || "0"} Birr
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        setIsUpdating(true);
                        await generateSecurityDeposit(request.id);
                        setIsUpdating(false);
                      }}
                      disabled={isUpdating}
                      className="auth-button auth-button--secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                    >
                      {isUpdating ? "Initializing..." : "Initialize Deposit Tracking"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
                      <span className="review-label">Required Deposit</span>
                      <span className="review-value" style={{ fontWeight: 500 }}>
                        {request.securityDeposit.deposit_amount.toLocaleString()} Birr
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: "0.75rem" }}>
                      <span className="review-label" style={{ display: "block", marginBottom: "0.25rem" }}>Deposit Status</span>
                      <select
                        value={request.securityDeposit.deposit_status}
                        onChange={async (e) => {
                          setIsUpdating(true);
                          await updateSecurityDeposit(request.securityDeposit!.id, { deposit_status: e.target.value });
                          setIsUpdating(false);
                        }}
                        disabled={isUpdating}
                        className="auth-input"
                        style={{ padding: "0.375rem 0.5rem", fontSize: "0.8125rem" }}
                      >
                        <option value="not_required">Not Required</option>
                        <option value="pending">Pending</option>
                        <option value="collected">Collected</option>
                        <option value="refunded">Refunded</option>
                        <option value="partially_refunded">Partially Refunded</option>
                        <option value="withheld">Withheld</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <span className="review-label" style={{ display: "block", marginBottom: "0.25rem" }}>Payment Method</span>
                      <input
                        type="text"
                        value={depositPaymentMethod}
                        onChange={(e) => setDepositPaymentMethod(e.target.value)}
                        placeholder="e.g. Bank Transfer, Cash..."
                        className="auth-input"
                        style={{ padding: "0.375rem 0.5rem", fontSize: "0.8125rem" }}
                      />
                    </div>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <span className="review-label" style={{ display: "block", marginBottom: "0.25rem" }}>Deposit Notes</span>
                      <textarea
                        value={depositNotes}
                        onChange={(e) => setDepositNotes(e.target.value)}
                        placeholder="Internal notes about this deposit..."
                        className="auth-input"
                        rows={2}
                        style={{ padding: "0.375rem 0.5rem", fontSize: "0.8125rem" }}
                      />
                    </div>

                    <button
                      onClick={async () => {
                        setIsUpdating(true);
                        await updateSecurityDeposit(request.securityDeposit!.id, { 
                          payment_method: depositPaymentMethod,
                          admin_notes: depositNotes 
                        });
                        setIsUpdating(false);
                      }}
                      disabled={isUpdating || (depositPaymentMethod === (request.securityDeposit.payment_method || "") && depositNotes === (request.securityDeposit.admin_notes || ""))}
                      className="auth-button"
                      style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                    >
                      {isUpdating ? "Saving..." : "Save Deposit Details"}
                    </button>
                  </>
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

              {/* Quick Status Flow Buttons - Renter/Resolution */}
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Renter & Resolution Flow</span>
              </div>
              <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button 
                  onClick={() => handleStatusChange("renter_contacted")}
                  disabled={isUpdating || request.status === "renter_contacted"}
                  className="auth-button auth-button--secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", flex: 1 }}
                >
                  Contacted
                </button>
                <button 
                  onClick={() => handleStatusChange("awaiting_payment")}
                  disabled={isUpdating || request.status === "awaiting_payment"}
                  className="auth-button auth-button--secondary"
                  style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", flex: 1 }}
                >
                  Awaiting Pay
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
        </div>
      )}
    </div>
  );
}
