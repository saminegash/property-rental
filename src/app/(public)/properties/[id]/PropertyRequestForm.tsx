"use client";

import { useState } from "react";
import { submitPropertyRequest } from "./actions";

type PropertyRequestFormProps = {
  listingId: string;
  type: "rent" | "sale";
};

export default function PropertyRequestForm({
  listingId,
  type,
}: PropertyRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="auth-card" style={{ marginTop: "1rem", textAlign: "center", padding: "1.5rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
        <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Request Submitted
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Your {type === "sale" ? "inquiry" : "request"} has been sent. Our team will review it and get back to you shortly.
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
        {type === "sale" ? "Inquire About This Property" : "Request to Rent"}
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("listing_id", listingId);

    const result = await submitPropertyRequest(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="auth-card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        {type === "sale" ? "Inquire About This Property" : "Request to Rent"}
      </h3>
      
      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {type === "rent" ? (
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="start_date">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="form-input"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="end_date">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                className="form-input"
                required
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="preferred_date">
                Preferred Viewing Date (Optional)
              </label>
              <input
                type="date"
                id="preferred_date"
                name="preferred_date"
                className="form-input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="budget">
                Budget ETB (Optional)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                className="form-input"
                placeholder="e.g. 5000000"
              />
            </div>
          </div>
        )}

        <div>
          <label className="form-label" htmlFor="renter_name">
            {type === "sale" ? "Full Name" : "Full Name"}
          </label>
          <input
            type="text"
            id="renter_name"
            name="renter_name"
            className="form-input"
            placeholder="Abebe Kebede"
            required
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="renter_phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="renter_phone"
              name="renter_phone"
              className="form-input"
              placeholder="+251 911..."
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="renter_email">
              Email (Optional)
            </label>
            <input
              type="email"
              id="renter_email"
              name="renter_email"
              className="form-input"
              placeholder="abebe@example.com"
            />
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="message">
            Message (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            className="form-input"
            rows={3}
            placeholder={type === "sale" ? "I am interested in buying this property..." : "Any special requests or questions..."}
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
            style={{ flex: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
