"use client";

import { useState } from "react";
import { submitOwnerOnboarding } from "./actions";
import Link from "next/link";

export default function BecomeOwnerPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownerType, setOwnerType] = useState("individual");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const res = await submitOwnerOnboarding(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 className="dashboard-title">Become an Owner</h1>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Complete your profile to start listing your properties on MyEthioProperties.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <fieldset className="form-group">
          <legend className="form-label" style={{ marginBottom: "0.5rem" }}>
            Owner Type
          </legend>
          <div className="role-options">
            <label htmlFor="type-individual" className="role-option">
              <input
                id="type-individual"
                type="radio"
                name="ownerType"
                value="individual"
                checked={ownerType === "individual"}
                onChange={() => setOwnerType("individual")}
                className="role-radio"
              />
              <span className="role-card">
                <span className="role-name">Individual</span>
                <span className="role-desc">Listing your personal property or car</span>
              </span>
            </label>

            <label htmlFor="type-company" className="role-option">
              <input
                id="type-company"
                type="radio"
                name="ownerType"
                value="rental_company"
                checked={ownerType === "rental_company"}
                onChange={() => setOwnerType("rental_company")}
                className="role-radio"
              />
              <span className="role-card">
                <span className="role-name">Rental Company</span>
                <span className="role-desc">Operating a fleet business</span>
              </span>
            </label>
          </div>
        </fieldset>

        {ownerType !== "individual" && (
          <div className="form-group">
            <label htmlFor="businessName" className="form-label">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Addis Rentals LLC"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="form-input"
            placeholder="+251 91 123 4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            className="form-input"
            placeholder="e.g. Addis Ababa"
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <Link
            href="/dashboard"
            className="auth-button auth-button--secondary"
            style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
          >
            Cancel
          </Link>
          <button type="submit" className="auth-button" style={{ flex: 1 }} disabled={loading}>
            {loading ? "Submitting..." : "Submit Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
