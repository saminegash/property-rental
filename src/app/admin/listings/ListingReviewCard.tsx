"use client";

import { useState } from "react";
import { approveListing, rejectListing } from "./actions";

type VehicleDetails = {
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number | null;
  mileage: number | null;
  color: string | null;
  condition: string;
  vehicle_type: { name: string } | null;
};

type RentalTerms = {
  available_with_driver: boolean;
  available_without_driver: boolean;
  daily_driver_fee: number | null;
  weekly_driver_fee: number | null;
  monthly_driver_fee: number | null;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_fee: number | null;
};

type ListingImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

type PendingListing = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
  owner: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
  };
  vehicle_details: VehicleDetails | null;
  rental_terms: RentalTerms | null;
  images: ListingImage[];
};

type Props = {
  listing: PendingListing;
};

function formatEnum(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ListingReviewCard({ listing }: Props) {
  const [status, setStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const primaryImage = listing.images.find((img) => img.is_primary);
  const vd = listing.vehicle_details;
  const rt = listing.rental_terms;

  function toggleSection(section: string) {
    setExpandedSection((prev) => (prev === section ? null : section));
  }

  async function handleApprove() {
    setError(null);
    setLoading(true);

    const result = await approveListing(listing.id);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus("approved");
    }
    setLoading(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await rejectListing(listing.id, rejectReason);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus("rejected");
    }
    setLoading(false);
  }

  if (status === "approved") {
    return (
      <div className="dashboard-card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-success-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="status-badge status-badge--published">Published</span>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>
            <strong>{listing.title}</strong> — approved and now live.
          </span>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="dashboard-card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-error-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="status-badge status-badge--rejected">Rejected</span>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>
            <strong>{listing.title}</strong> — rejected.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Cover image */}
        {primaryImage && (
          <div
            style={{
              width: "120px",
              height: "90px",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "var(--color-surface-hover)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage.image_url}
              alt={listing.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            {listing.title}
          </h3>
          {vd && (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              {vd.year} {vd.make} {vd.model}
              {vd.vehicle_type ? ` · ${vd.vehicle_type.name}` : ""}
            </p>
          )}
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            📍 {listing.location || "No location"} · Submitted{" "}
            {new Date(listing.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Owner Info */}
      <div
        className="review-section"
        style={{ cursor: "pointer" }}
        onClick={() => toggleSection("owner")}
      >
        <div className="review-section__header">
          <span>👤 Owner Info</span>
          <span style={{ fontSize: "0.75rem" }}>{expandedSection === "owner" ? "▲" : "▼"}</span>
        </div>
        {expandedSection === "owner" && (
          <div className="review-section__body">
            <div className="review-grid">
              <div><span className="review-label">Name</span><span className="review-value">{listing.owner.full_name || "—"}</span></div>
              <div><span className="review-label">Email</span><span className="review-value">{listing.owner.email || "—"}</span></div>
              <div><span className="review-label">Phone</span><span className="review-value">{listing.owner.phone || "—"}</span></div>
              <div><span className="review-label">City</span><span className="review-value">{listing.owner.city || "—"}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      {vd && (
        <div
          className="review-section"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection("vehicle")}
        >
          <div className="review-section__header">
            <span>🚗 Vehicle Details</span>
            <span style={{ fontSize: "0.75rem" }}>{expandedSection === "vehicle" ? "▲" : "▼"}</span>
          </div>
          {expandedSection === "vehicle" && (
            <div className="review-section__body">
              <div className="review-grid">
                <div><span className="review-label">Type</span><span className="review-value">{vd.vehicle_type?.name || "—"}</span></div>
                <div><span className="review-label">Make / Model</span><span className="review-value">{vd.make} {vd.model}</span></div>
                <div><span className="review-label">Year</span><span className="review-value">{vd.year}</span></div>
                <div><span className="review-label">Transmission</span><span className="review-value">{formatEnum(vd.transmission)}</span></div>
                <div><span className="review-label">Fuel</span><span className="review-value">{formatEnum(vd.fuel_type)}</span></div>
                <div><span className="review-label">Seats</span><span className="review-value">{vd.seats ?? "—"}</span></div>
                <div><span className="review-label">Mileage</span><span className="review-value">{vd.mileage ? `${vd.mileage.toLocaleString()} km` : "—"}</span></div>
                <div><span className="review-label">Color</span><span className="review-value">{vd.color || "—"}</span></div>
                <div><span className="review-label">Condition</span><span className="review-value">{formatEnum(vd.condition)}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rental Terms */}
      {rt && (
        <div
          className="review-section"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection("rental")}
        >
          <div className="review-section__header">
            <span>📋 Rental Terms</span>
            <span style={{ fontSize: "0.75rem" }}>{expandedSection === "rental" ? "▲" : "▼"}</span>
          </div>
          {expandedSection === "rental" && (
            <div className="review-section__body">
              <div className="review-grid">
                <div><span className="review-label">Self-drive</span><span className="review-value">{rt.available_without_driver ? "✅ Yes" : "❌ No"}</span></div>
                <div><span className="review-label">With driver</span><span className="review-value">{rt.available_with_driver ? "✅ Yes" : "❌ No"}</span></div>
                {rt.available_with_driver && (
                  <>
                    <div><span className="review-label">Daily driver fee</span><span className="review-value">{rt.daily_driver_fee ? `${rt.daily_driver_fee.toLocaleString()} Birr` : "—"}</span></div>
                    <div><span className="review-label">Weekly driver fee</span><span className="review-value">{rt.weekly_driver_fee ? `${rt.weekly_driver_fee.toLocaleString()} Birr` : "—"}</span></div>
                    <div><span className="review-label">Monthly driver fee</span><span className="review-value">{rt.monthly_driver_fee ? `${rt.monthly_driver_fee.toLocaleString()} Birr` : "—"}</span></div>
                  </>
                )}
                <div><span className="review-label">Pickup</span><span className="review-value">{rt.pickup_available ? "✅ Yes" : "❌ No"}</span></div>
                <div><span className="review-label">Delivery</span><span className="review-value">{rt.delivery_available ? "✅ Yes" : "❌ No"}</span></div>
                {rt.delivery_available && rt.delivery_fee !== null && (
                  <div><span className="review-label">Delivery fee</span><span className="review-value">{rt.delivery_fee.toLocaleString()} Birr</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {listing.images.length > 0 && (
        <div
          className="review-section"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection("images")}
        >
          <div className="review-section__header">
            <span>📷 Photos ({listing.images.length})</span>
            <span style={{ fontSize: "0.75rem" }}>{expandedSection === "images" ? "▲" : "▼"}</span>
          </div>
          {expandedSection === "images" && (
            <div className="review-section__body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {listing.images.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      aspectRatio: "4 / 3",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: "var(--color-surface-hover)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt="Listing"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {img.is_primary && (
                      <span
                        style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          fontSize: "0.5625rem",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "9999px",
                          backgroundColor: "var(--color-primary)",
                          color: "#fff",
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "1rem 0", padding: "0.75rem", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)" }}>
          <span style={{ fontWeight: 500, color: "var(--color-text)", display: "block", marginBottom: "0.25rem" }}>Description</span>
          {listing.description}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Action buttons */}
      {!showRejectForm ? (
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="auth-button"
            style={{ flex: 1, backgroundColor: "#059669" }}
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? "Processing..." : "✓ Approve & Publish"}
          </button>
          <button
            type="button"
            className="auth-button"
            style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" }}
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
          >
            ✕ Reject
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
            Rejection reason
          </label>
          <textarea
            className="form-input"
            rows={3}
            style={{ resize: "vertical", minHeight: "80px", width: "100%", marginBottom: "0.75rem" }}
            placeholder="Explain why this listing is being rejected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="auth-button auth-button--secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="auth-button"
              style={{ flex: 1, backgroundColor: "#dc2626" }}
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
