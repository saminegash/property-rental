"use client";

import { useState } from "react";
import { approveListing, rejectListing, suspendListing, saveAdminNotes, approvePriceChange, rejectPriceChange } from "./actions";
import ListingGallery from "@/components/shared/ListingGallery";

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

type PropertyDetails = {
  property_type: { name: string } | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  floor: number | null;
  total_floors: number | null;
  furnished_status: string | null;
  parking_available: boolean;
  compound_available: boolean;
  water_available: boolean;
  electricity_available: boolean;
  internet_available: boolean;
  property_condition: string | null;
};

type RentalTerms = {
  daily_price: number | null;
  weekly_price: number | null;
  monthly_price: number | null;
  security_deposit_amount: number;
  minimum_rental_days: number;
  available_with_driver: boolean;
  available_without_driver: boolean;
  daily_driver_fee: number | null;
  weekly_driver_fee: number | null;
  monthly_driver_fee: number | null;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_fee: number | null;
};

type SaleTerms = {
  sale_price: number | null;
  is_negotiable: boolean;
};

type ListingImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
};

type PendingPriceChange = {
  id: string;
  proposed_terms: Partial<RentalTerms & SaleTerms>;
  created_at: string;
};

type PendingListing = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  listing_type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  owner: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
  };
  vehicle_details: VehicleDetails | null;
  property_details: PropertyDetails | null;
  rental_terms: RentalTerms | null;
  sale_terms: SaleTerms | null;
  pending_price_change: PendingPriceChange | null;
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
    "pending" | "approved" | "rejected" | "suspended"
  >("pending");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [adminNotes, setAdminNotes] = useState(listing.admin_notes || "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const primaryImage = listing.images.find((img) => img.is_primary);
  const vd = listing.vehicle_details;
  const pd = listing.property_details;
  const rt = listing.rental_terms;
  const st = listing.sale_terms;

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

  async function handleSuspend() {
    if (!suspendReason.trim()) {
      setError("Please provide a suspension reason");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await suspendListing(listing.id, suspendReason);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus("suspended");
    }
    setLoading(false);
  }

  async function handleSaveNotes() {
    setNotesSaved(false);
    const result = await saveAdminNotes(listing.id, adminNotes);
    if (result.error) {
      setError(result.error);
    } else {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  }

  async function handleApprovePrice() {
    if (!listing.pending_price_change) return;
    setError(null);
    setLoading(true);

    const result = await approvePriceChange(
      listing.pending_price_change.id,
      listing.id,
      listing.listing_type,
      listing.pending_price_change.proposed_terms
    );

    if (result.error) {
      setError(result.error);
    } else {
      setStatus("approved");
    }
    setLoading(false);
  }

  async function handleRejectPrice() {
    if (!listing.pending_price_change) return;
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await rejectPriceChange(listing.pending_price_change.id, rejectReason);
    if (result.error) {
      setError(result.error);
    } else {
      setStatus("rejected");
    }
    setLoading(false);
  }

  // Post-action states
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

  if (status === "suspended") {
    return (
      <div className="dashboard-card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-warning-border, #f59e0b)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="status-badge status-badge--rejected">Suspended</span>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>
            <strong>{listing.title}</strong> — suspended.
          </span>
        </div>
      </div>
    );
  }

  const pt = listing.pending_price_change?.proposed_terms;

  return (
    <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
      {listing.pending_price_change && (
        <div style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#e0f2fe",
          border: "1px solid #bae6fd",
          borderRadius: "var(--radius-md)",
        }}>
          <h3 style={{ fontSize: "1rem", color: "#0369a1", marginBottom: "0.5rem" }}>⚠️ Price Change Pending Approval</h3>
          <p style={{ fontSize: "0.875rem", color: "#0c4a6e", marginBottom: "1rem" }}>
            The owner has submitted a price update for this published listing.
          </p>
          <div style={{ backgroundColor: "#f0f9ff", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "#0369a1" }}>
            <strong>Proposed Terms:</strong>
            <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0 }}>
              {listing.listing_type === "rent" ? (
                <>
                  {pt?.daily_price && <li>Daily Price: {pt.daily_price} ETB</li>}
                  {pt?.weekly_price && <li>Weekly Price: {pt.weekly_price} ETB</li>}
                  {pt?.monthly_price && <li>Monthly Price: {pt.monthly_price} ETB</li>}
                  {pt?.security_deposit_amount !== undefined && <li>Security Deposit: {pt.security_deposit_amount} ETB</li>}
                  {pt?.daily_driver_fee && <li>Daily Driver Fee: {pt.daily_driver_fee} ETB</li>}
                  {pt?.delivery_fee !== undefined && <li>Delivery Fee: {pt.delivery_fee} ETB</li>}
                </>
              ) : (
                <>
                  {pt?.sale_price && <li>Sale Price: {pt.sale_price} ETB</li>}
                  {pt?.is_negotiable !== undefined && <li>Negotiable: {pt.is_negotiable ? "Yes" : "No"}</li>}
                </>
              )}
            </ul>
          </div>
        </div>
      )}

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
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
            <span className="status-badge status-badge--pending" style={{ fontSize: "0.6875rem" }}>
              {formatEnum(listing.category)}
            </span>
            <span className="status-badge status-badge--draft" style={{ fontSize: "0.6875rem" }}>
              {formatEnum(listing.listing_type)}
            </span>
          </div>
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

      {/* Image count warning */}
      {listing.images.length < 5 && (
        <div style={{
          padding: "0.5rem 0.75rem",
          marginBottom: "1rem",
          backgroundColor: "#fef3cd",
          border: "1px solid #ffc107",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8125rem",
          color: "#856404",
        }}>
          ⚠️ Only {listing.images.length} photo{listing.images.length !== 1 ? "s" : ""} uploaded. Minimum required: 5.
        </div>
      )}

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
              <div className="dashboard-card" style={{ padding: "1.25rem", gridColumn: "1 / -1" }}>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
                  {listing.category === "vehicle" ? "Vehicle Specifications" : "Property Details"}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                  {listing.category === "vehicle" && vd && (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Make & Model</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{vd.make} {vd.model}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Year</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{vd.year}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Type</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{vd.vehicle_type?.name || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Transmission</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{formatEnum(vd.transmission)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Fuel</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{formatEnum(vd.fuel_type)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Condition</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{formatEnum(vd.condition)}</div>
                      </div>
                    </>
                  )}

                  {listing.category === "property" && pd && (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Property Type</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.property_type?.name || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Bedrooms</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.bedrooms || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Bathrooms</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.bathrooms || "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Area</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.area_sqm ? `${pd.area_sqm} m²` : "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Furnished Status</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.furnished_status ? formatEnum(pd.furnished_status) : "-"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Condition</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{pd.property_condition ? formatEnum(pd.property_condition) : "-"}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing & Terms */}
      {(rt || st) && (
        <div
          className="review-section"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection("pricing")}
        >
          <div className="review-section__header">
            <span>💰 Pricing & Terms</span>
            <span style={{ fontSize: "0.75rem" }}>{expandedSection === "pricing" ? "▲" : "▼"}</span>
          </div>
          {expandedSection === "pricing" && (
            <div className="review-section__body">
              <div className="review-grid">
                {listing.listing_type === "rent" && rt && (
                  <>
                    <div><span className="review-label">Daily price</span><span className="review-value">{rt.daily_price ? `${rt.daily_price.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Weekly price</span><span className="review-value">{rt.weekly_price ? `${rt.weekly_price.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Monthly price</span><span className="review-value">{rt.monthly_price ? `${rt.monthly_price.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Security deposit</span><span className="review-value">{rt.security_deposit_amount ? `${rt.security_deposit_amount.toLocaleString()} ETB` : "0"}</span></div>
                    <div><span className="review-label">Min rental days</span><span className="review-value">{rt.minimum_rental_days}</span></div>
                    {rt.daily_price && (
                      <div><span className="review-label">Commission (5%)</span><span className="review-value">{`${Math.round(rt.daily_price * 0.05).toLocaleString()} ETB/day`}</span></div>
                    )}
                  </>
                )}
                {listing.listing_type === "sale" && st && (
                  <>
                    <div><span className="review-label">Sale Price</span><span className="review-value">{st.sale_price ? `${st.sale_price.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Negotiable</span><span className="review-value">{st.is_negotiable ? "✅ Yes" : "❌ No"}</span></div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver & Delivery (Only for vehicles for rent) */}
      {listing.category === "vehicle" && listing.listing_type === "rent" && rt && (
        <div
          className="review-section"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection("rental")}
        >
          <div className="review-section__header">
            <span>📋 Driver & Delivery</span>
            <span style={{ fontSize: "0.75rem" }}>{expandedSection === "rental" ? "▲" : "▼"}</span>
          </div>
          {expandedSection === "rental" && (
            <div className="review-section__body">
              <div className="review-grid">
                <div><span className="review-label">Self-drive</span><span className="review-value">{rt.available_without_driver ? "✅ Yes" : "❌ No"}</span></div>
                <div><span className="review-label">With driver</span><span className="review-value">{rt.available_with_driver ? "✅ Yes" : "❌ No"}</span></div>
                {rt.available_with_driver && (
                  <>
                    <div><span className="review-label">Daily driver fee</span><span className="review-value">{rt.daily_driver_fee ? `${rt.daily_driver_fee.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Weekly driver fee</span><span className="review-value">{rt.weekly_driver_fee ? `${rt.weekly_driver_fee.toLocaleString()} ETB` : "—"}</span></div>
                    <div><span className="review-label">Monthly driver fee</span><span className="review-value">{rt.monthly_driver_fee ? `${rt.monthly_driver_fee.toLocaleString()} ETB` : "—"}</span></div>
                  </>
                )}
                <div><span className="review-label">Pickup</span><span className="review-value">{rt.pickup_available ? "✅ Yes" : "❌ No"}</span></div>
                <div><span className="review-label">Delivery</span><span className="review-value">{rt.delivery_available ? "✅ Yes" : "❌ No"}</span></div>
                {rt.delivery_available && rt.delivery_fee !== null && (
                  <div><span className="review-label">Delivery fee</span><span className="review-value">{rt.delivery_fee.toLocaleString()} ETB</span></div>
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
            <div className="review-section__body" style={{ padding: "0" }}>
              <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <ListingGallery images={listing.images} title={listing.title} />
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

      {/* Admin Notes */}
      <div style={{ margin: "1rem 0" }}>
        <label className="form-label" style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.8125rem" }}>
          🗒️ Admin Notes <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(internal, not visible to owner)</span>
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <textarea
            className="form-input"
            rows={2}
            style={{ resize: "vertical", minHeight: "60px", flex: 1, fontSize: "0.8125rem" }}
            placeholder="Add internal notes about this listing..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <button
            type="button"
            className="auth-button auth-button--secondary"
            style={{ alignSelf: "flex-end", fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
            onClick={handleSaveNotes}
          >
            {notesSaved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Action buttons */}
      {listing.pending_price_change ? (
        !showRejectForm ? (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="auth-button"
              style={{ flex: "1 1 auto", backgroundColor: "#059669" }}
              onClick={handleApprovePrice}
              disabled={loading}
            >
              {loading ? "Processing..." : "✓ Approve Price Change"}
            </button>
            <button
              type="button"
              className="auth-button"
              style={{ flex: "1 1 auto", backgroundColor: "transparent", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" }}
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
            >
              ✕ Reject Price Change
            </button>
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
              Rejection reason <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(visible to owner)</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              style={{ resize: "vertical", minHeight: "80px", width: "100%", marginBottom: "0.75rem" }}
              placeholder="Explain why this price change is being rejected..."
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
                onClick={handleRejectPrice}
                disabled={loading || !rejectReason.trim()}
              >
                {loading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        )
      ) : !showRejectForm && !showSuspendForm ? (
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="auth-button"
            style={{ flex: "1 1 auto", backgroundColor: "#059669" }}
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? "Processing..." : "✓ Approve & Publish"}
          </button>
          <button
            type="button"
            className="auth-button"
            style={{ flex: "1 1 auto", backgroundColor: "transparent", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" }}
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
          >
            ✕ Reject
          </button>
          <button
            type="button"
            className="auth-button"
            style={{ flex: "1 1 auto", backgroundColor: "transparent", border: "1px solid #f59e0b", color: "#92400e" }}
            onClick={() => setShowSuspendForm(true)}
            disabled={loading}
          >
            ⏸ Suspend
          </button>
        </div>
      ) : showRejectForm ? (
        <div style={{ marginTop: "1rem" }}>
          <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
            Rejection reason <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(visible to owner)</span>
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
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
            Suspension reason <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(visible to owner)</span>
          </label>
          <textarea
            className="form-input"
            rows={3}
            style={{ resize: "vertical", minHeight: "80px", width: "100%", marginBottom: "0.75rem" }}
            placeholder="Explain why this listing is being suspended..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="auth-button auth-button--secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setShowSuspendForm(false);
                setSuspendReason("");
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="auth-button"
              style={{ flex: 1, backgroundColor: "#f59e0b", color: "#fff" }}
              onClick={handleSuspend}
              disabled={loading || !suspendReason.trim()}
            >
              {loading ? "Suspending..." : "Confirm Suspension"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
