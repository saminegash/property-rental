"use client";

import { useState } from "react";
import { savePropertyDetails } from "./actions";

type PropertyType = {
  id: string;
  name: string;
};

export type PropertyDetailsData = {
  property_type_id: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  floor: number | null;
  total_floors: number | null;
  furnished_status: string | null;
  property_condition: string | null;
  parking_available: boolean;
  compound_available: boolean;
  water_available: boolean;
  electricity_available: boolean;
  internet_available: boolean;
} | null;

type Props = {
  listingId: string;
  propertyTypes: PropertyType[];
  existingDetails: PropertyDetailsData;
};

export default function PropertyDetailsForm({
  listingId,
  propertyTypes,
  existingDetails,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    // checkbox unchecked isn't included in FormData, so set explicit values
    formData.set("parking_available", formData.get("parking_available") ? "true" : "false");
    formData.set("compound_available", formData.get("compound_available") ? "true" : "false");
    formData.set("water_available", formData.get("water_available") ? "true" : "false");
    formData.set("electricity_available", formData.get("electricity_available") ? "true" : "false");
    formData.set("internet_available", formData.get("internet_available") ? "true" : "false");

    const res = await savePropertyDetails(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>
        Property Details
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Provide specific details about your property to help renters or buyers understand what you offer.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <input type="hidden" name="listing_id" value={listingId} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label" htmlFor="property_type_id">
              Property Type *
            </label>
            <select
              id="property_type_id"
              name="property_type_id"
              className="form-input"
              defaultValue={existingDetails?.property_type_id || ""}
              required
            >
              <option value="" disabled>Select a type</option>
              {propertyTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="area_sqm">
              Area (m²)
            </label>
            <input
              id="area_sqm"
              name="area_sqm"
              type="number"
              className="form-input"
              defaultValue={existingDetails?.area_sqm || ""}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label" htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              className="form-input"
              defaultValue={existingDetails?.bedrooms || ""}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              className="form-input"
              defaultValue={existingDetails?.bathrooms || ""}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label" htmlFor="floor">
              Floor Number
            </label>
            <input
              id="floor"
              name="floor"
              type="number"
              className="form-input"
              defaultValue={existingDetails?.floor ?? ""}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="total_floors">
              Total Floors in Building
            </label>
            <input
              id="total_floors"
              name="total_floors"
              type="number"
              className="form-input"
              defaultValue={existingDetails?.total_floors || ""}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label" htmlFor="property_condition">
              Condition
            </label>
            <select
              id="property_condition"
              name="property_condition"
              className="form-input"
              defaultValue={existingDetails?.property_condition || ""}
            >
              <option value="">Not specified</option>
              <option value="newly_built">Newly Built</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs_repair">Needs Repair</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="furnished_status">
              Furnished Status
            </label>
            <select
              id="furnished_status"
              name="furnished_status"
              className="form-input"
              defaultValue={existingDetails?.furnished_status || ""}
            >
              <option value="">Not specified</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: "0.75rem" }}>
            Amenities
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="parking_available" defaultChecked={existingDetails?.parking_available} />
              Parking Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="compound_available" defaultChecked={existingDetails?.compound_available} />
              Compound Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="water_available" defaultChecked={existingDetails?.water_available} />
              Water Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="electricity_available" defaultChecked={existingDetails?.electricity_available} />
              Electricity Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="internet_available" defaultChecked={existingDetails?.internet_available} />
              Internet Available
            </label>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Saving..." : "Save Details"}
          </button>
          {success && <span style={{ color: "var(--color-success)", fontSize: "0.875rem", fontWeight: 500 }}>✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  );
}
