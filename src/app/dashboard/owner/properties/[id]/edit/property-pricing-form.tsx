"use client";

import { useState } from "react";
import { savePropertyPricing } from "./actions";

export type PropertyPricingData = {
  daily_price: number | null;
  monthly_price: number | null;
  security_deposit_amount: number;
  minimum_rental_days: number | null;
} | null;

type Props = {
  listingId: string;
  listingType: string;
  existingPricing: PropertyPricingData;
};

export default function PropertyPricingForm({
  listingId,
  listingType,
  existingPricing,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await savePropertyPricing(formData);
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
        Pricing Details
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        {listingType === "sale"
          ? "Set the sale price for your property. Leave blank if price is on request."
          : "Set your rental rates. Monthly price is typically required for properties."}
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <input type="hidden" name="listing_id" value={listingId} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {listingType === "rent" ? (
            <>
              <div>
                <label className="form-label" htmlFor="monthly_price">
                  Monthly Rent (ETB)
                </label>
                <input
                  id="monthly_price"
                  name="monthly_price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  defaultValue={existingPricing?.monthly_price || ""}
                  placeholder="e.g. 50000"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="daily_price">
                  Daily Rent (ETB) - Optional
                </label>
                <input
                  id="daily_price"
                  name="daily_price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  defaultValue={existingPricing?.daily_price || ""}
                  placeholder="e.g. 2000"
                />
              </div>
            </>
          ) : (
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="monthly_price">
                Sale Price (ETB)
              </label>
              <input
                id="monthly_price"
                name="monthly_price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                defaultValue={existingPricing?.monthly_price || ""}
                placeholder="e.g. 15000000"
              />
            </div>
          )}
        </div>

        {listingType === "rent" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label" htmlFor="security_deposit_amount">
                Security Deposit (ETB)
              </label>
              <input
                id="security_deposit_amount"
                name="security_deposit_amount"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                defaultValue={existingPricing?.security_deposit_amount || 0}
                required
              />
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                Amount to hold for damages. Fully refundable.
              </p>
            </div>

            <div>
              <label className="form-label" htmlFor="minimum_rental_days">
                Minimum Rental Period (Days)
              </label>
              <input
                id="minimum_rental_days"
                name="minimum_rental_days"
                type="number"
                min="1"
                className="form-input"
                defaultValue={existingPricing?.minimum_rental_days || ""}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Saving..." : "Save Pricing"}
          </button>
          {success && (
            <span
              style={{
                color: "var(--color-success)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              ✓ Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
