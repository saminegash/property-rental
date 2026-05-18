"use client";

import { useState } from "react";
import { saveVehicleDetails } from "./actions";
import Link from "next/link";

type VehicleType = {
  id: string;
  name: string;
  slug: string;
};

type VehicleDetails = {
  id: string;
  vehicle_type_id: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel_type: string;
  seats: number | null;
  mileage: number | null;
  color: string | null;
  condition: string;
} | null;

type Props = {
  listingId: string;
  listingTitle: string;
  vehicleTypes: VehicleType[];
  existingDetails: VehicleDetails;
};

export default function VehicleDetailsForm({
  listingId,
  listingTitle,
  vehicleTypes,
  existingDetails,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await saveVehicleDetails(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h1 className="dashboard-title">Vehicle Details</h1>
      <p className="dashboard-hint" style={{ marginBottom: "0.5rem" }}>
        {listingTitle}
      </p>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Add the vehicle specifications for your listing.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" role="status">
          Vehicle details saved successfully!
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        {/* Vehicle Type */}
        <div className="form-group">
          <label htmlFor="vehicle_type_id" className="form-label">
            Vehicle Type
          </label>
          <select
            id="vehicle_type_id"
            name="vehicle_type_id"
            required
            className="form-input form-select"
            defaultValue={existingDetails?.vehicle_type_id || ""}
          >
            <option value="" disabled>
              Select a vehicle type
            </option>
            {vehicleTypes.map((vt) => (
              <option key={vt.id} value={vt.id}>
                {vt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Make & Model — side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="make" className="form-label">
              Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Toyota"
              defaultValue={existingDetails?.make || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="model" className="form-label">
              Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Land Cruiser"
              defaultValue={existingDetails?.model || ""}
            />
          </div>
        </div>

        {/* Year & Seats — side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="year" className="form-label">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              className="form-input"
              min={1950}
              max={currentYear + 1}
              placeholder={`e.g. ${currentYear}`}
              defaultValue={existingDetails?.year || ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="seats" className="form-label">
              Seats <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
            </label>
            <input
              id="seats"
              name="seats"
              type="number"
              className="form-input"
              min={1}
              max={50}
              placeholder="e.g. 5"
              defaultValue={existingDetails?.seats ?? ""}
            />
          </div>
        </div>

        {/* Transmission & Fuel Type — side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transmission" className="form-label">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              required
              className="form-input form-select"
              defaultValue={existingDetails?.transmission || ""}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="semi_automatic">Semi-Automatic</option>
              <option value="cvt">CVT</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fuel_type" className="form-label">
              Fuel Type
            </label>
            <select
              id="fuel_type"
              name="fuel_type"
              required
              className="form-input form-select"
              defaultValue={existingDetails?.fuel_type || ""}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="phev">Plug-in Hybrid (PHEV)</option>
            </select>
          </div>
        </div>

        {/* Mileage & Color — side by side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mileage" className="form-label">
              Mileage (km) <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
            </label>
            <input
              id="mileage"
              name="mileage"
              type="number"
              className="form-input"
              min={0}
              placeholder="e.g. 45000"
              defaultValue={existingDetails?.mileage ?? ""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="color" className="form-label">
              Color <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
            </label>
            <input
              id="color"
              name="color"
              type="text"
              className="form-input"
              placeholder="e.g. White"
              defaultValue={existingDetails?.color || ""}
            />
          </div>
        </div>

        {/* Condition */}
        <div className="form-group">
          <label htmlFor="condition" className="form-label">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            required
            className="form-input form-select"
            defaultValue={existingDetails?.condition || ""}
          >
            <option value="" disabled>
              Select condition
            </option>
            <option value="new">New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs_repair">Needs Repair</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <Link
            href="/dashboard/owner"
            className="auth-button auth-button--secondary"
            style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
          >
            ← Back to My Cars
          </Link>
          <button
            type="submit"
            className="auth-button"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : existingDetails
                ? "Update Details"
                : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
