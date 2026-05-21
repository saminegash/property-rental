"use client";

import { useState } from "react";
import { createPropertyListing } from "./actions";

export default function NewPropertyPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createPropertyListing(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
      <h1 className="dashboard-title">Add a New Property</h1>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Start by providing the basic details of your property. You can add more specific details and upload photos in the next steps.
      </p>

      {error && (
        <div className="auth-error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-card">
        <div style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" htmlFor="title">
            Property Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            placeholder="e.g. Modern 3-Bedroom Villa in CMC"
            required
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" htmlFor="listing_type">
            Listing Type
          </label>
          <select id="listing_type" name="listing_type" className="form-input" required>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-input"
            placeholder="e.g. CMC, Addis Ababa"
            required
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-input"
            rows={4}
            placeholder="Describe your property..."
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creating..." : "Create Listing & Continue"}
        </button>
      </form>
    </div>
  );
}
