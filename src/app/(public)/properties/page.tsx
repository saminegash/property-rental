import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { PropertyListingCard } from "@/components/properties/PropertyListingCard";

// Landing Page Components
import { PropertyRowSection } from "@/components/properties/PropertyRowSection";
import { PropertyCategoriesSection } from "@/components/properties/PropertyCategoriesSection";
import { PropertyHowItWorksSection } from "@/components/properties/PropertyHowItWorksSection";
import { PropertyOwnerCTASection } from "@/components/properties/PropertyOwnerCTASection";
import { PopularLocationsSection } from "@/components/shared/PopularLocationsSection";

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
  seoTitle?: string;
  seoSubtitle?: string;
  forceFilters?: boolean;
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
  sale_terms: {
    sale_price: number | null;
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

  const hasFilters = !!(params.forceFilters || params.location || params.type || params.property_type || params.min_beds || params.min_price || params.max_price);

  let error = null;
  let filtered: PropertyCard[] = [];

  if (hasFilters) {
    let query = supabase
      .from("listings")
      .select(
        `
        id, title, location, listing_type,
        property_details ( bedrooms, bathrooms, area_sqm, property_types:property_type_id ( name ) ),
        rental_terms ( daily_price, monthly_price ),
        sale_terms ( sale_price ),
        listing_images ( image_url, is_primary )
      `
      )
      .eq("category", "property")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (params.location) {
      query = query.ilike("location", `%${params.location}%`);
    }

    if (params.type === "rent" || params.type === "sale") {
      query = query.eq("listing_type", params.type);
    }

    const { data: listings, error: fetchError } = await query;
    error = fetchError;

    filtered = (listings || []) as unknown as PropertyCard[];

    if (params.property_type) {
      filtered = filtered.filter((l) => {
        const pd = l.property_details?.[0];
        const pt = Array.isArray(pd?.property_types) ? pd?.property_types[0] : pd?.property_types;
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
          const st = l.sale_terms?.[0];
          const price = l.listing_type === "sale"
            ? (st?.sale_price || 0)
            : (rt?.monthly_price || rt?.daily_price || 0);
          return price >= minPrice;
        });
      }
    }

    if (params.max_price) {
      const maxPrice = parseInt(params.max_price, 10);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter((l) => {
          const rt = l.rental_terms?.[0];
          const st = l.sale_terms?.[0];
          const price = l.listing_type === "sale"
            ? (st?.sale_price || 0)
            : (rt?.monthly_price || rt?.daily_price || 0);
          return price <= maxPrice;
        });
      }
    }
  }

  return (
    <div className={hasFilters ? "browse-layout" : ""}>
      {/* ── Page hero ── */}
      <section className="browse-hero">
        <h1 className="browse-hero__title">
          {params.seoTitle ? params.seoTitle : hasFilters ? "Search Results" : "Find Your Perfect Property"}
        </h1>
        <p className="browse-hero__subtitle">
          {params.seoSubtitle ? params.seoSubtitle : "Verified apartments, villas, and commercial spaces across Ethiopia."}
        </p>
      </section>

      {/* ── Search + filter bar ── */}
      <div className="browse-filter-bar" id="filter-bar" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        <form method="GET" action="/properties" className="browse-filter-form" style={{ marginTop: "-2rem", position: "relative", zIndex: 10, background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "var(--radius-xl)", padding: "1.5rem" }}>
          {/* Location */}
          <div className="browse-filter-field">
            <label htmlFor="filter-location" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location
            </label>
            <input
              type="text"
              id="filter-location"
              name="location"
              placeholder="e.g. Bole, CMC"
              defaultValue={params.location ?? ""}
              className="browse-filter-input"
            />
          </div>

          {/* Type */}
          <div className="browse-filter-field">
            <label htmlFor="filter-type" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Purpose
            </label>
            <select
              id="filter-type"
              name="type"
              defaultValue={params.type ?? ""}
              className="browse-filter-select"
            >
              <option value="">Rent or Sale</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="browse-filter-field">
            <label htmlFor="filter-property-type" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Property Type
            </label>
            <select
              id="filter-property-type"
              name="property_type"
              defaultValue={params.property_type ?? ""}
              className="browse-filter-select"
            >
              <option value="">Any Type</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt} value={pt.toLowerCase()}>{pt}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="browse-filter-field">
            <label htmlFor="filter-min" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Price (Birr)
            </label>
            <div className="browse-filter-price-range">
              <input
                type="number"
                id="filter-min"
                name="min_price"
                placeholder="Min"
                defaultValue={params.min_price ?? ""}
                className="browse-filter-input browse-filter-input--half"
                min="0"
              />
              <span className="browse-filter-price-sep">—</span>
              <input
                type="number"
                id="filter-max"
                name="max_price"
                placeholder="Max"
                defaultValue={params.max_price ?? ""}
                className="browse-filter-input browse-filter-input--half"
                min="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="browse-filter-actions">
            <button type="submit" className="browse-filter-btn browse-filter-btn--primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
            {hasFilters && (
              <Link href="/properties" className="browse-filter-btn browse-filter-btn--clear">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {hasFilters ? (
        // ── Search Mode Layout ──
        <>
          <main className="browse-main" style={{ marginTop: "3rem" }}>
            {error && (
              <div className="auth-error" style={{ maxWidth: "600px", margin: "0 auto" }}>
                Failed to load properties: {error.message}
              </div>
            )}

            {!error && filtered.length === 0 && (
              <div className="browse-empty">
                <div className="browse-empty__icon">🏠</div>
                <h2 className="browse-empty__title">No properties found</h2>
                <p className="browse-empty__text">
                  Try adjusting your filters or clearing them to see all available properties.
                </p>
                <Link href="/properties" className="auth-button" style={{ textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
                  Clear all filters
                </Link>
              </div>
            )}

            {filtered.length > 0 && (
              <>
                <p className="browse-count">
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

                    const st = prop.sale_terms?.[0];
                    const displayPrice = prop.listing_type === "sale"
                      ? (st?.sale_price || 0)
                      : (rt?.monthly_price || rt?.daily_price || 0);
                    const propertyTypeName = Array.isArray(pd?.property_types)
                      ? pd?.property_types[0]?.name
                      : pd?.property_types?.name;

                    return (
                      <PropertyListingCard
                        key={prop.id}
                        id={prop.id}
                        title={prop.title}
                        location={prop.location || "Addis Ababa"}
                        image={coverImage || "/placeholder-property.jpg"}
                        price={displayPrice}
                        type={prop.listing_type === "sale" ? "sale" : "rent"}
                        beds={pd?.bedrooms || 0}
                        baths={pd?.bathrooms || 0}
                        area={pd?.area_sqm || 0}
                        propertyType={propertyTypeName || "Property"}
                        href={`/properties/${prop.id}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </>
      ) : (
        // ── Landing Mode Layout ──
        <div className="landing-layout" style={{ marginTop: "3rem" }}>
          <PropertyRowSection
            title="Featured Rentals"
            subtitle="Explore our top-rated properties available for rent."
            filterType="rent"
            viewAllLink="/properties?type=rent"
          />

          <PropertyRowSection
            title="Properties For Sale"
            subtitle="Find your next investment or forever home."
            filterType="sale"
            viewAllLink="/properties?type=sale"
          />

          <PropertyRowSection
            title="Apartments"
            subtitle="Modern living spaces in the heart of the city."
            filterType="Apartment"
            viewAllLink="/properties?property_type=apartment"
          />

          <PropertyRowSection
            title="Houses & Villas"
            subtitle="Spacious properties perfect for families."
            filterType="Villa"
            viewAllLink="/properties?property_type=villa"
          />

          <PropertyRowSection
            title="Commercial Spaces"
            subtitle="Offices and retail spaces to grow your business."
            filterType="Commercial"
            viewAllLink="/properties?property_type=commercial"
          />

          <PropertyRowSection
            title="Land"
            subtitle="Secure the perfect plot for your next big project."
            filterType="Land"
            viewAllLink="/properties?property_type=land"
          />

          <PropertyCategoriesSection />

          <PropertyHowItWorksSection />

          <PopularLocationsSection
            baseRoute="/properties"
            subtitle="Find properties in the most sought-after neighborhoods."
          />

          <PropertyOwnerCTASection />
        </div>
      )}
    </div>
  );
}
