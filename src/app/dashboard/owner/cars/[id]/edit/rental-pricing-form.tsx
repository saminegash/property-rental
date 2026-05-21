"use client";

import { useState } from "react";
import { saveRentalPricing } from "./actions";

type RentalPricingData = {
  daily_price: number | null;
  weekly_price: number | null;
  monthly_price: number | null;
  security_deposit_amount: number;
  minimum_rental_days: number;
} | null;

type Props = {
  listingId: string;
  existingPricing: RentalPricingData;
  pendingPriceChange?: {
    status: string;
    admin_feedback: string | null;
  } | null;
};

export default function RentalPricingForm({
  listingId,
  existingPricing,
  pendingPriceChange,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await saveRentalPricing(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div
      className="dashboard-card"
      style={{ maxWidth: "640px", margin: "2rem auto 0" }}
    >
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>
        Rental Pricing
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Set your rental rates. Daily price is required. Weekly and monthly rates
        are optional discounts for longer rentals.
      </p>

      {pendingPriceChange && pendingPriceChange.status === "pending" && (
        <div style={{
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#e0f2fe",
          borderLeft: "4px solid var(--color-primary)",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          fontSize: "0.875rem",
          color: "#0369a1",
        }}>
          <strong>Pending Approval:</strong> You have submitted a price change that is awaiting admin review. You can overwrite it by submitting this form again.
        </div>
      )}
      
      {pendingPriceChange && pendingPriceChange.status === "rejected" && (
        <div style={{
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#fef2f2",
          borderLeft: "4px solid var(--color-error)",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          fontSize: "0.875rem",
          color: "#991b1b",
        }}>
          <strong>Price Change Rejected:</strong> {pendingPriceChange.admin_feedback || "The admin rejected your recent price change proposal."}
        </div>
      )}

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" role="status">
          Pricing saved successfully!
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        {/* Daily Price — required */}
        <div className="form-group">
          <label htmlFor="daily_price" className="form-label">
            Daily Rental Price (ETB)
          </label>
          <input
            id="daily_price"
            name="daily_price"
            type="number"
            required
            className="form-input"
            min={1}
            placeholder="e.g. 3000"
            defaultValue={existingPricing?.daily_price ?? ""}
          />
          <span className="form-hint">
            This is the base price per day. Commission (5%) is calculated on
            this amount only.
          </span>
        </div>

        {/* Weekly & Monthly — optional, side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weekly_price" className="form-label">
              Weekly Price (ETB){" "}
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                (optional)
              </span>
            </label>
            <input
              id="weekly_price"
              name="weekly_price"
              type="number"
              className="form-input"
              min={1}
              placeholder="e.g. 18000"
              defaultValue={existingPricing?.weekly_price ?? ""}
            />
            <span className="form-hint">Discounted rate for 7+ days</span>
          </div>
          <div className="form-group">
            <label htmlFor="monthly_price" className="form-label">
              Monthly Price (ETB){" "}
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                (optional)
              </span>
            </label>
            <input
              id="monthly_price"
              name="monthly_price"
              type="number"
              className="form-input"
              min={1}
              placeholder="e.g. 60000"
              defaultValue={existingPricing?.monthly_price ?? ""}
            />
            <span className="form-hint">Discounted rate for 30+ days</span>
          </div>
        </div>

        {/* Security Deposit & Minimum Days — side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="security_deposit_amount" className="form-label">
              Security Deposit (ETB)
            </label>
            <input
              id="security_deposit_amount"
              name="security_deposit_amount"
              type="number"
              required
              className="form-input"
              min={0}
              placeholder="e.g. 15000"
              defaultValue={existingPricing?.security_deposit_amount ?? ""}
            />
            <span className="form-hint">
              Refundable unless damage or dispute
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="minimum_rental_days" className="form-label">
              Minimum Rental Days
            </label>
            <input
              id="minimum_rental_days"
              name="minimum_rental_days"
              type="number"
              required
              className="form-input"
              min={1}
              max={365}
              placeholder="e.g. 1"
              defaultValue={existingPricing?.minimum_rental_days ?? 1}
            />
          </div>
        </div>

        {/* Pricing note */}
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "var(--color-primary-light, #E8F0FE)",
            borderRadius: "var(--radius-md)",
            marginTop: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Pricing transparency:</strong> Driver fees, delivery
            fees, security deposits, and all other charges are shown separately
            to renters. Platform commission (5%) applies only to the base rental
            price.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            className="auth-button"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : existingPricing
                ? "Update Pricing"
                : "Save Pricing"}
          </button>
        </div>
      </form>
    </div>
  );
}
