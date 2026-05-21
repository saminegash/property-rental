"use client";

import { useState } from "react";
import { saveRentPricing, saveSalePricing } from "./actions";

export type PricingTerms = {
  monthly_price?: number | null;
  security_deposit_amount?: number | null;
  sale_price?: number | null;
  is_negotiable?: boolean;
};

type Props = {
  listingId: string;
  listingType: "rent" | "sale";
  existingTerms: PricingTerms | null;
};

export default function PropertyPricingForm({ listingId, listingType, existingTerms }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    let res;
    if (listingType === "rent") {
      res = await saveRentPricing(formData);
    } else {
      res = await saveSalePricing(formData);
    }

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "2rem auto" }}>
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>
        {listingType === "rent" ? "Rental Terms" : "Sale Terms"}
      </h2>
      
      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        {listingType === "rent" ? (
          <>
            <div className="form-group">
              <label className="form-label">Monthly Rent (ETB)</label>
              <input
                type="number"
                name="monthly_price"
                className="form-input"
                defaultValue={existingTerms?.monthly_price || ""}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Security Deposit (ETB) <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span></label>
              <input
                type="number"
                name="security_deposit_amount"
                className="form-input"
                defaultValue={existingTerms?.security_deposit_amount || ""}
                min="0"
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Sale Price (ETB)</label>
              <input
                type="number"
                name="sale_price"
                className="form-input"
                defaultValue={existingTerms?.sale_price || ""}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  name="is_negotiable"
                  defaultChecked={existingTerms?.is_negotiable}
                />
                Price is negotiable
              </label>
            </div>
          </>
        )}

        {error && <div className="auth-error" style={{ marginTop: "1rem" }}>{error}</div>}
        {success && <div className="form-success" style={{ marginTop: "1rem" }}>Pricing saved!</div>}

        <button type="submit" className="auth-button" disabled={loading} style={{ marginTop: "1.5rem" }}>
          {loading ? "Saving..." : "Save Pricing"}
        </button>
      </form>
    </div>
  );
}
