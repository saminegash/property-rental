"use client";

import { useState } from "react";
import { submitRentalRequest } from "./actions";

type RentalRequestFormProps = {
  listingId: string;
  availableWithDriver: boolean;
  deliveryAvailable: boolean;
};

export default function RentalRequestForm({
  listingId,
  availableWithDriver,
  deliveryAvailable,
}: RentalRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [needsDriver, setNeedsDriver] = useState(false);
  const [needsDelivery, setNeedsDelivery] = useState(false);

  if (success) {
    return (
      <div className="auth-card" style={{ marginTop: "1rem", textAlign: "center", padding: "1.5rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
        <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Request Submitted
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Your rental request has been sent. Our team will review it and get back to you shortly.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="auth-button"
        style={{
          display: "block",
          width: "100%",
          marginTop: "1.5rem",
          cursor: "pointer",
        }}
      >
        Request Rental
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("listing_id", listingId);
    formData.append("needs_driver", needsDriver.toString());
    formData.append("needs_delivery", needsDelivery.toString());

    const result = await submitRentalRequest(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
      <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Rental Request
      </h3>
      
      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="start_date">Start Date *</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className="auth-input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="end_date">End Date *</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              className="auth-input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="renter_name">Full Name *</label>
          <input
            type="text"
            id="renter_name"
            name="renter_name"
            className="auth-input"
            required
            placeholder="Abebe Kebede"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="renter_phone">Phone Number *</label>
          <input
            type="tel"
            id="renter_phone"
            name="renter_phone"
            className="auth-input"
            required
            placeholder="0911234567"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="renter_email">Email Address (Optional)</label>
          <input
            type="email"
            id="renter_email"
            name="renter_email"
            className="auth-input"
            placeholder="abebe@example.com"
          />
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          {availableWithDriver && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-text)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={needsDriver}
                onChange={(e) => setNeedsDriver(e.target.checked)}
              />
              Include a driver
            </label>
          )}

          {deliveryAvailable && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-text)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={needsDelivery}
                onChange={(e) => setNeedsDelivery(e.target.checked)}
              />
              Deliver to my location
            </label>
          )}
        </div>

        {needsDelivery && (
          <div className="auth-field">
            <label className="auth-label" htmlFor="delivery_location">Delivery Location *</label>
            <input
              type="text"
              id="delivery_location"
              name="delivery_location"
              className="auth-input"
              required={needsDelivery}
              placeholder="e.g. Bole Airport, Addis Ababa"
            />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label" htmlFor="message">Message (Optional)</label>
          <textarea
            id="message"
            name="message"
            className="auth-input"
            rows={3}
            placeholder="Any special requests or details..."
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="auth-button auth-button--secondary"
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="auth-button"
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
