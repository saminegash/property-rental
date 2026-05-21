"use client";

import { useState } from "react";
import { savePropertyDetails } from "./actions";

export type PropertyType = {
  id: string;
  name: string;
};

export type PropertyDetails = {
  property_type_id?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  floor?: number | null;
  furnished_status?: string | null;
  property_condition?: string | null;
  parking_available?: boolean;
  compound_available?: boolean;
  water_available?: boolean;
  electricity_available?: boolean;
  internet_available?: boolean;
};

type Props = {
  listingId: string;
  propertyTypes: PropertyType[];
  existingDetails: PropertyDetails | null;
};

export default function PropertyDetailsForm({ listingId, propertyTypes, existingDetails }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await savePropertyDetails(formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "2rem auto" }}>
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>Property Details</h2>
      <form action={handleSubmit} className="auth-form">
        <input type="hidden" name="listing_id" value={listingId} />

        <div className="form-group">
          <label className="form-label">Property Type</label>
          <select name="property_type_id" className="form-input" defaultValue={existingDetails?.property_type_id || ""} required>
            <option value="" disabled>Select Type</option>
            {propertyTypes.map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <input type="number" name="bedrooms" className="form-input" defaultValue={existingDetails?.bedrooms || ""} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <input type="number" name="bathrooms" className="form-input" defaultValue={existingDetails?.bathrooms || ""} min="0" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Area (sqm)</label>
            <input type="number" name="area_sqm" className="form-input" defaultValue={existingDetails?.area_sqm || ""} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Floor</label>
            <input type="number" name="floor" className="form-input" defaultValue={existingDetails?.floor || ""} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Furnished Status</label>
            <select name="furnished_status" className="form-input" defaultValue={existingDetails?.furnished_status || ""} required>
              <option value="" disabled>Select Status</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi Furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Condition</label>
            <select name="property_condition" className="form-input" defaultValue={existingDetails?.property_condition || ""} required>
              <option value="" disabled>Select Condition</option>
              <option value="newly_built">Newly Built</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs_repair">Needs Repair</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label className="form-label">Amenities</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="parking_available" defaultChecked={existingDetails?.parking_available} /> Parking
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="compound_available" defaultChecked={existingDetails?.compound_available} /> Compound
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="water_available" defaultChecked={existingDetails?.water_available} /> Water
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="electricity_available" defaultChecked={existingDetails?.electricity_available} /> Electricity
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="internet_available" defaultChecked={existingDetails?.internet_available} /> Internet
            </label>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="form-success">Details saved!</div>}

        <button type="submit" className="auth-button" disabled={loading} style={{ marginTop: "1.5rem" }}>
          {loading ? "Saving..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}
