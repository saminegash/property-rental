import Link from "next/link";
import { createListing } from "../actions";

export default function NewListingPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Create New Listing</h1>
          <p className="dashboard-hint">Fill in the details below. Your listing will be sent for admin review.</p>
        </div>
        <Link href="/dashboard/owner/listings" style={{ fontSize: "0.875rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Listings
        </Link>
      </div>

      <div className="dashboard-card" style={{ padding: "2rem" }}>
        <form action={createListing}>
          <ListingFormFields />

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
            <button type="submit" className="auth-button" style={{ marginTop: 0 }}>
              Submit for Review
            </button>
            <Link href="/dashboard/owner/listings" className="auth-button auth-button--secondary" style={{ textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-light)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
        <strong>Note:</strong> Image uploads are not yet supported through this form. Contact admin to add images to your listing after creation.
      </div>
    </div>
  );
}

function ListingFormFields({ defaults }: { defaults?: Record<string, string | number | null> }) {
  const d = defaults || {};

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      {/* Title — full width */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label className="form-label" htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="form-input"
          placeholder="e.g. 3-Bedroom Apartment in Bole"
          defaultValue={(d.title as string) || ""}
        />
      </div>

      {/* Description — full width */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-input"
          rows={4}
          placeholder="Describe your property — amenities, condition, nearby landmarks..."
          defaultValue={(d.description as string) || ""}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="form-label" htmlFor="property_type">Property Type *</label>
        <select id="property_type" name="property_type" required className="form-input" defaultValue={(d.property_type as string) || ""}>
          <option value="" disabled>Select type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="condominium">Condominium</option>
          <option value="studio">Studio</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
          <option value="warehouse">Warehouse</option>
          <option value="vehicle">Vehicle</option>
        </select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="form-label" htmlFor="listing_type">Listing Type *</label>
        <select id="listing_type" name="listing_type" required className="form-input" defaultValue={(d.listing_type as string) || ""}>
          <option value="" disabled>Select type</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="form-label" htmlFor="price">Price (ETB) *</label>
        <input
          id="price"
          name="price"
          type="number"
          required
          min="0"
          className="form-input"
          placeholder="e.g. 50000"
          defaultValue={d.price != null ? String(d.price) : ""}
        />
      </div>

      {/* City */}
      <div>
        <label className="form-label" htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          className="form-input"
          placeholder="e.g. Addis Ababa"
          defaultValue={(d.city as string) || ""}
        />
      </div>

      {/* Sub-city */}
      <div>
        <label className="form-label" htmlFor="sub_city">Sub-city / Area</label>
        <input
          id="sub_city"
          name="sub_city"
          type="text"
          className="form-input"
          placeholder="e.g. Bole"
          defaultValue={(d.sub_city as string) || ""}
        />
      </div>

      {/* Bedrooms */}
      <div>
        <label className="form-label" htmlFor="bedrooms">Bedrooms</label>
        <input
          id="bedrooms"
          name="bedrooms"
          type="number"
          min="0"
          className="form-input"
          placeholder="e.g. 3"
          defaultValue={d.bedrooms != null ? String(d.bedrooms) : ""}
        />
      </div>

      {/* Bathrooms */}
      <div>
        <label className="form-label" htmlFor="bathrooms">Bathrooms</label>
        <input
          id="bathrooms"
          name="bathrooms"
          type="number"
          min="0"
          className="form-input"
          placeholder="e.g. 2"
          defaultValue={d.bathrooms != null ? String(d.bathrooms) : ""}
        />
      </div>

      {/* Area */}
      <div>
        <label className="form-label" htmlFor="area_sqm">Area (m²)</label>
        <input
          id="area_sqm"
          name="area_sqm"
          type="number"
          min="0"
          className="form-input"
          placeholder="e.g. 120"
          defaultValue={d.area_sqm != null ? String(d.area_sqm) : ""}
        />
      </div>
    </div>
  );
}

// Export for reuse in the edit page
export { ListingFormFields };
