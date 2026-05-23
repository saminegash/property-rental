"use client";

import { useState } from "react";
import { savePickupDelivery } from "./actions";

type PickupDeliveryData = {
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_fee: number | null;
  estimated_delivery_time: string | null;
  rental_notes: string | null;
} | null;

type Props = {
  listingId: string;
  existingData: PickupDeliveryData;
  pendingPriceChange?: { status: string; admin_feedback?: string } | null;
};

const DELIVERY_TIME_OPTIONS = [
  { value: "within_3_hours", label: "Within 3 hours" },
  { value: "same_day", label: "Same day" },
  { value: "next_day", label: "Next day" },
  { value: "custom", label: "Custom (specify in notes)" },
] as const;

export default function PickupDeliveryForm({
  listingId,
  existingData,
  pendingPriceChange,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(
    existingData?.delivery_available ?? false
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await savePickupDelivery(formData);
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
        Pickup &amp; Delivery
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Configure how renters receive the vehicle. Delivery fees are separate
        from the rental price and are{" "}
        <strong style={{ color: "var(--color-text)" }}>
          never included in platform commission
        </strong>
        .
      </p>

      {pendingPriceChange?.status === "pending" && (
        <div style={{ padding: "0.75rem", marginBottom: "1.5rem", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "#92400e" }}>
          <strong>⚠️ Pending Admin Approval:</strong> You have submitted a price modification. Your changes will not appear publicly until approved. Submitting this form again will overwrite your pending request.
        </div>
      )}
      
      {pendingPriceChange?.status === "rejected" && (
        <div style={{ padding: "0.75rem", marginBottom: "1.5rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "#991b1b" }}>
          <strong>❌ Price Edit Rejected:</strong> {pendingPriceChange.admin_feedback || "No reason provided."} Please adjust your pricing and try again.
        </div>
      )}

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" role="status">
          Pickup &amp; delivery options saved successfully!
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        {/* Availability toggles */}
        <fieldset
          className="form-group"
          style={{ border: "none", padding: 0 }}
        >
          <legend className="form-label" style={{ marginBottom: "0.75rem" }}>
            Availability
          </legend>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="pickup_available"
                value="true"
                defaultChecked={existingData?.pickup_available ?? true}
                className="form-checkbox__input"
              />
              <span className="form-checkbox__box" />
              <span className="form-checkbox__label">
                Pickup available
                <span className="form-hint" style={{ display: "block" }}>
                  Renters can pick up the vehicle at the listed location.
                </span>
              </span>
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                name="delivery_available"
                value="true"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="form-checkbox__input"
              />
              <span className="form-checkbox__box" />
              <span className="form-checkbox__label">
                Delivery available
                <span className="form-hint" style={{ display: "block" }}>
                  You can deliver the vehicle to the renter&apos;s location.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        {/* Delivery details — only visible when delivery is enabled */}
        {deliveryEnabled && (
          <div className="form-section-nested">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="delivery_fee" className="form-label">
                  Delivery Fee{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    (Birr)
                  </span>
                </label>
                <input
                  id="delivery_fee"
                  name="delivery_fee"
                  type="number"
                  className="form-input"
                  min={0}
                  placeholder="e.g. 500"
                  defaultValue={existingData?.delivery_fee ?? ""}
                />
                <span className="form-hint">
                  Leave empty for free delivery.
                </span>
              </div>

              <div className="form-group">
                <label
                  htmlFor="estimated_delivery_time"
                  className="form-label"
                >
                  Estimated Delivery Time
                </label>
                <select
                  id="estimated_delivery_time"
                  name="estimated_delivery_time"
                  className="form-input form-select"
                  defaultValue={existingData?.estimated_delivery_time || ""}
                >
                  <option value="">Not specified</option>
                  {DELIVERY_TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Rental Notes */}
        <div className="form-group">
          <label htmlFor="rental_notes" className="form-label">
            Rental Notes{" "}
            <span
              style={{ fontWeight: 400, color: "var(--color-text-muted)" }}
            >
              (optional)
            </span>
          </label>
          <textarea
            id="rental_notes"
            name="rental_notes"
            rows={3}
            className="form-input"
            placeholder="Any special conditions, delivery areas, or instructions for renters..."
            style={{ resize: "vertical", minHeight: "80px" }}
            defaultValue={existingData?.rental_notes || ""}
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: "1.5rem" }}>
          <button
            type="submit"
            className="auth-button"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : existingData
                ? "Update Pickup & Delivery"
                : "Save Pickup & Delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
