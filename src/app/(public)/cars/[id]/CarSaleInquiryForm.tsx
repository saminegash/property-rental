"use client";

import { useState } from "react";
import { submitCarSaleInquiry } from "./actions";

type CarSaleInquiryFormProps = {
  listingId: string;
};

export default function CarSaleInquiryForm({
  listingId,
}: CarSaleInquiryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="auth-card" style={{ marginTop: "1rem", textAlign: "center", padding: "1.5rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
        <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Inquiry Submitted
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Your inquiry has been sent. Our team will review it and get back to you shortly.
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
        Inquire About This Car
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("listing_id", listingId);

    const result = await submitCarSaleInquiry(formData);

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
        Inquire About This Car
      </h3>
      
      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

        <div>
          <label className="form-label" htmlFor="requester_name">
            Full Name
          </label>
          <input
            type="text"
            id="requester_name"
            name="requester_name"
            className="form-input"
            placeholder="Abebe Kebede"
            required
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="requester_phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="requester_phone"
              name="requester_phone"
              className="form-input"
              placeholder="+251 911..."
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="requester_email">
              Email (Optional)
            </label>
            <input
              type="email"
              id="requester_email"
              name="requester_email"
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
            placeholder="I am interested in buying this car..."
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
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
