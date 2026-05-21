import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { PropertyListingCard } from "@/components/properties/PropertyListingCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Properties — MyEthioProperties",
  description:
    "Browse verified rental and sale properties in Ethiopia. Apartments, villas, condominiums, and more.",
};

// ── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  location?: string;
  type?: "rent" | "sale" | string;
  property_type?: string;
  min_beds?: string;
  min_price?: string;
  max_price?: string;
};

type PropertyCard = {
  id: string;
  title: string;
  location: string | null;
  listing_type: string;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    property_types: { name: string } | null;
  }[];
  rental_terms: {
    daily_price: number | null;
    monthly_price: number | null;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  "Apartment", "Villa", "Condominium", "Studio", "Office",
  "Commercial", "Warehouse", "Land", "Guest House",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BrowsePropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build Supabase query — RLS ensures only published listings are returned
  let query = supabase
    .from("listings")
    .select(
      `
      id, title, location, listing_type,
      property_details ( bedrooms, bathrooms, area_sqm, property_types:property_type_id ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      listing_images ( image_url, is_primary )
    `
    )
    .eq("category", "property")
    .order("created_at", { ascending: false });

  // Apply location filter
  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }

  // Apply listing type filter
  if (params.type === "rent" || params.type === "sale") {
    query = query.eq("listing_type", params.type);
  }

  const { data: listings, error } = await query;

  let filtered = (listings || []) as unknown as PropertyCard[];

  // Post-query JS filters for joined fields
  if (params.property_type) {
    filtered = filtered.filter((l) => {
      const pt = l.property_details?.[0]?.property_types;
      return pt && pt.name.toLowerCase() === params.property_type!.toLowerCase();
    });
  }

  if (params.min_beds) {
    const minBeds = parseInt(params.min_beds, 10);
    if (!isNaN(minBeds)) {
      filtered = filtered.filter((l) => (l.property_details?.[0]?.bedrooms ?? 0) >= minBeds);
    }
  }

  if (params.min_price) {
    const minPrice = parseInt(params.min_price, 10);
    if (!isNaN(minPrice)) {
      filtered = filtered.filter((l) => {
        const rt = l.rental_terms?.[0];
        const price = rt?.monthly_price || rt?.daily_price || 0;
        return price >= minPrice;
      });
    }
  }

  if (params.max_price) {
    const maxPrice = parseInt(params.max_price, 10);
    if (!isNaN(maxPrice)) {
      filtered = filtered.filter((l) => {
        const rt = l.rental_terms?.[0];
        const price = rt?.monthly_price || rt?.daily_price || 0;
        return price <= maxPrice;
      });
    }
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
          Browse Properties
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)" }}>
          Find verified apartments, villas, and more across Ethiopia.
        </p>
      </div>

      {/* Filters */}
      <form
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          padding: "1.25rem",
          backgroundColor: "var(--color-surface-alt)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Location */}
        <div style={{ flex: "1 1 180px" }}>
          <label htmlFor="location" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Bole, CMC"
            defaultValue={params.location || ""}
            className="form-input"
            style={{ width: "100%", fontSize: "0.875rem" }}
          />
        </div>

        {/* Type */}
        <div style={{ flex: "0 1 140px" }}>
          <label htmlFor="type" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={params.type || ""}
            className="form-input"
            style={{ width: "100%", fontSize: "0.875rem" }}
          >
            <option value="">All</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        {/* Property Type */}
        <div style={{ flex: "0 1 160px" }}>
          <label htmlFor="property_type" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Property Type
          </label>
          <select
            id="property_type"
            name="property_type"
            defaultValue={params.property_type || ""}
            className="form-input"
            style={{ width: "100%", fontSize: "0.875rem" }}
          >
            <option value="">All</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt.toLowerCase()}>{pt}</option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button
            type="submit"
            className="auth-button"
            style={{ height: "40px", padding: "0 1.5rem", fontSize: "0.875rem" }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Property type chips */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {PROPERTY_TYPES.map((pt) => (
          <Link
            key={pt}
            href={`/properties?property_type=${pt.toLowerCase()}`}
            className="popular-location-chip"
            style={{
              backgroundColor: params.property_type?.toLowerCase() === pt.toLowerCase() ? "var(--color-primary-light)" : undefined,
              borderColor: params.property_type?.toLowerCase() === pt.toLowerCase() ? "var(--color-primary)" : undefined,
              color: params.property_type?.toLowerCase() === pt.toLowerCase() ? "var(--color-primary)" : undefined,
            }}
          >
            <span className="popular-location-chip__text">{pt}</span>
          </Link>
        ))}
      </div>

      {/* Results */}
      {error ? (
        <div className="auth-error" role="alert">
          Error loading properties: {error.message}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </p>
          <div className="featured-properties__grid">
            {filtered.map((prop) => {
              const pd = prop.property_details?.[0];
              const rt = prop.rental_terms?.[0];
              const coverImage =
                prop.listing_images?.find((img) => img.is_primary)?.image_url ||
                prop.listing_images?.[0]?.image_url ||
                "";

              const displayPrice = rt?.monthly_price || rt?.daily_price || 0;

              return (
                <PropertyListingCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  location={prop.location || "Addis Ababa"}
                  image={coverImage}
                  price={displayPrice}
                  type={prop.listing_type === "sale" ? "sale" : "rent"}
                  beds={pd?.bedrooms ?? 0}
                  baths={pd?.bathrooms ?? 0}
                  area={pd?.area_sqm ?? 0}
                  href={`/properties/${prop.id}`}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🏠</div>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            No properties found
          </h2>
          <p style={{ color: "var(--color-text-muted)", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            {params.location || params.property_type
              ? "Try adjusting your filters or search in a different location."
              : "Properties are being onboarded. Check back soon or list your own property."}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard/become-owner" className="auth-button" style={{ textDecoration: "none" }}>
              List Your Property
            </Link>
            {(params.location || params.property_type) && (
              <Link href="/properties" className="auth-button auth-button--secondary" style={{ textDecoration: "none" }}>
                Clear Filters
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
