"use client";

import { useState } from "react";
import { createPropertyListing } from "./actions";
import Link from "next/link";

export default function NewPropertyPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const res = await createPropertyListing(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h1 className="dashboard-title">List New Property</h1>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Start by entering the basic listing details. You&apos;ll add property specifications and pricing next.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="listing_type" className="form-label">
            Listing Type
          </label>
          <select id="listing_type" name="listing_type" className="form-input" required>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Property Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="form-input"
            placeholder="e.g. Modern 3-Bedroom Villa in Bole"
          />
          <span className="form-hint">A clear title helps buyers/renters find your property.</span>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="form-input"
            placeholder="Describe the property, its features, and any conditions..."
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            className="form-input"
            placeholder="e.g. Bole, Addis Ababa"
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <Link
            href="/dashboard/owner/properties"
            className="auth-button auth-button--secondary"
            style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="auth-button"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
