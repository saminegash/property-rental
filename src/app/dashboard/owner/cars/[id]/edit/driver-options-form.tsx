"use client";

import { useState } from "react";
import { saveDriverOptions } from "./actions";

type DriverOptions = {
  available_with_driver: boolean;
  available_without_driver: boolean;
  daily_driver_fee: number | null;
  weekly_driver_fee: number | null;
  monthly_driver_fee: number | null;
} | null;

type Props = {
  listingId: string;
  existingOptions: DriverOptions;
  pendingPriceChange?: { status: string; admin_feedback?: string } | null;
};

export default function DriverOptionsForm({
  listingId,
  existingOptions,
  pendingPriceChange,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withDriver, setWithDriver] = useState(
    existingOptions?.available_with_driver ?? false
  );
  const [withoutDriver, setWithoutDriver] = useState(
    existingOptions?.available_without_driver ?? true
  );

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await saveDriverOptions(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "2rem auto 0" }}>
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>
        Driver Options
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Specify whether your car is available with or without a driver. Driver
        fees are separate from the rental price and are{" "}
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
          Driver options saved successfully!
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        {/* Availability toggles */}
        <fieldset className="form-group" style={{ border: "none", padding: 0 }}>
          <legend className="form-label" style={{ marginBottom: "0.75rem" }}>
            Availability
          </legend>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="available_without_driver"
                value="true"
                checked={withoutDriver}
                onChange={(e) => setWithoutDriver(e.target.checked)}
                className="form-checkbox__input"
              />
              <span className="form-checkbox__box" />
              <span className="form-checkbox__label">
                Available without driver
                <span className="form-hint" style={{ display: "block" }}>
                  Renters can self-drive the vehicle.
                </span>
              </span>
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                name="available_with_driver"
                value="true"
                checked={withDriver}
                onChange={(e) => setWithDriver(e.target.checked)}
                className="form-checkbox__input"
              />
              <span className="form-checkbox__box" />
              <span className="form-checkbox__label">
                Available with driver
                <span className="form-hint" style={{ display: "block" }}>
                  You or a designated driver will drive the vehicle.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        {/* Driver fee fields — only visible when with-driver is selected */}
        {withDriver && (
          <div className="form-section-nested">
            <p
              className="form-label"
              style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}
            >
              Driver Fees{" "}
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                (Birr)
              </span>
            </p>

            <div className="form-row" style={{ marginBottom: "0" }}>
              <div className="form-group">
                <label htmlFor="daily_driver_fee" className="form-label">
                  Daily Fee
                </label>
                <input
                  id="daily_driver_fee"
                  name="daily_driver_fee"
                  type="number"
                  required
                  className="form-input"
                  min={0}
                  placeholder="e.g. 800"
                  defaultValue={existingOptions?.daily_driver_fee ?? ""}
                />
              </div>
              <div className="form-group">
                <label htmlFor="weekly_driver_fee" className="form-label">
                  Weekly Fee{" "}
                  <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="weekly_driver_fee"
                  name="weekly_driver_fee"
                  type="number"
                  className="form-input"
                  min={0}
                  placeholder="e.g. 5000"
                  defaultValue={existingOptions?.weekly_driver_fee ?? ""}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label htmlFor="monthly_driver_fee" className="form-label">
                  Monthly Fee{" "}
                  <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="monthly_driver_fee"
                  name="monthly_driver_fee"
                  type="number"
                  className="form-input"
                  min={0}
                  placeholder="e.g. 18000"
                  defaultValue={existingOptions?.monthly_driver_fee ?? ""}
                />
              </div>
              <div>{/* spacer for grid alignment */}</div>
            </div>
          </div>
        )}

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
              : existingOptions
                ? "Update Driver Options"
                : "Save Driver Options"}
          </button>
        </div>
      </form>
    </div>
  );
}
