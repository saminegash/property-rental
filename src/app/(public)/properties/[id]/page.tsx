import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import PropertyRequestForm from "./PropertyRequestForm";
import ListingGallery from "@/components/shared/ListingGallery";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatEnum(value: string): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("title, location")
    .eq("id", id)
    .single();

  if (!listing) {
    return { title: "Property Not Found — MyEthioProperties" };
  }

  return {
    title: `${listing.title} — MyEthioProperties`,
    description: `View details for ${listing.title} in ${listing.location || "Ethiopia"} on MyEthioProperties.`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS ensures only published listings are returned for public users
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
      id, title, description, location, owner_id, listing_type,
      property_details (
        bedrooms, bathrooms, area_sqm, floor, total_floors,
        furnished_status, parking_available, compound_available,
        water_available, electricity_available, internet_available,
        property_condition,
        property_types ( name )
      ),
      rental_terms (
        daily_price, weekly_price, monthly_price,
        security_deposit_amount, minimum_rental_days,
        rental_notes
      ),
      listing_images ( id, image_url, is_primary, sort_order )
    `
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Extract joined data
  const pdRaw = listing.property_details;
  const pd = Array.isArray(pdRaw) ? pdRaw[0] : pdRaw;
  const rtRaw = listing.rental_terms;
  const rt = Array.isArray(rtRaw) ? rtRaw[0] : rtRaw;
  const images = (
    Array.isArray(listing.listing_images) ? listing.listing_images : []
  ).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  // Fetch owner verification status (using admin client to bypass owner_profiles RLS)
  const adminClient = createAdminClient();
  const { data: ownerProfile } = await adminClient
    .from("owner_profiles")
    .select("verification_status, owner_type, business_name")
    .eq("user_id", listing.owner_id)
    .single();

  const isVerified = ownerProfile?.verification_status === "verified";

  // Fetch owner reviews
  const { data: reviews } = await supabase
    .from("rental_reviews")
    .select("overall_rating")
    .eq("reviewee_id", listing.owner_id)
    .eq("reviewee_role", "owner");

  const ownerRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1) 
    : "New";
  const ownerReviewCount = reviews?.length || 0;
  
  const propertyTypeRaw = pd?.property_types as unknown;
  const propertyTypeName = Array.isArray(propertyTypeRaw)
    ? (propertyTypeRaw[0] as { name: string } | undefined)?.name
    : (propertyTypeRaw as { name: string } | null)?.name;

  return (
    <main className="detail-page">
      <div className="detail-container">
        {/* Image gallery */}
        <ListingGallery images={images} title={listing.title} />

        {/* Content columns */}
        <div className="detail-content">
          {/* Left: details */}
          <div className="detail-main">
            {/* Title + badges */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 className="detail-title">{listing.title}</h1>
              {pd && (
                <p className="detail-subtitle">
                  {propertyTypeName ? propertyTypeName : "Property"}
                  {pd.area_sqm ? ` · ${pd.area_sqm} m²` : ""}
                </p>
              )}
              {listing.location && (
                <p className="detail-location">📍 {listing.location}</p>
              )}

              <div className="detail-badges">
                <span className="detail-badge" style={{ backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-heading)", border: "1px solid var(--color-border)" }}>
                  ⭐ {ownerRating} Owner Score {ownerReviewCount > 0 ? `(${ownerReviewCount})` : ""}
                </span>

                {isVerified && (
                  <span className="detail-badge detail-badge--verified">
                    ✓ Verified Owner
                  </span>
                )}
                {ownerProfile?.owner_type === "rental_company" && ownerProfile.business_name && (
                  <span className="detail-badge detail-badge--company">
                    {ownerProfile.business_name}
                  </span>
                )}
                <span className="detail-badge" style={{ backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                  {listing.listing_type === "rent" ? "For Rent" : "For Sale"}
                </span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="detail-section">
                <h2 className="detail-section__title">Description</h2>
                <p className="detail-section__text">{listing.description}</p>
              </div>
            )}

            {/* Property specifications */}
            {pd && (
              <div className="detail-section">
                <h2 className="detail-section__title">Property Details</h2>
                <div className="detail-specs-grid">
                  <div className="detail-spec">
                    <span className="detail-spec__label">Bedrooms</span>
                    <span className="detail-spec__value">{pd.bedrooms || "-"}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Bathrooms</span>
                    <span className="detail-spec__value">{pd.bathrooms || "-"}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Area</span>
                    <span className="detail-spec__value">{pd.area_sqm ? `${pd.area_sqm} m²` : "-"}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Condition</span>
                    <span className="detail-spec__value">{formatEnum(pd.property_condition) || "-"}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Furnished</span>
                    <span className="detail-spec__value">{formatEnum(pd.furnished_status) || "-"}</span>
                  </div>
                  {pd.floor != null && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Floor</span>
                      <span className="detail-spec__value">{pd.floor} {pd.total_floors ? `of ${pd.total_floors}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {pd && (
              <div className="detail-section">
                <h2 className="detail-section__title">Amenities</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.9375rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.parking_available ? "var(--color-text)" : "var(--color-text-muted)", textDecoration: pd.parking_available ? "none" : "line-through" }}>
                    <span>🚗</span> Parking
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.compound_available ? "var(--color-text)" : "var(--color-text-muted)", textDecoration: pd.compound_available ? "none" : "line-through" }}>
                    <span>🌳</span> Compound
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.water_available ? "var(--color-text)" : "var(--color-text-muted)", textDecoration: pd.water_available ? "none" : "line-through" }}>
                    <span>💧</span> Water
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.electricity_available ? "var(--color-text)" : "var(--color-text-muted)", textDecoration: pd.electricity_available ? "none" : "line-through" }}>
                    <span>⚡</span> Electricity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.internet_available ? "var(--color-text)" : "var(--color-text-muted)", textDecoration: pd.internet_available ? "none" : "line-through" }}>
                    <span>🌐</span> Internet
                  </div>
                </div>
              </div>
            )}

            {/* Rental Notes (if rent) */}
            {listing.listing_type === "rent" && rt?.rental_notes && (
              <div className="detail-section">
                <h2 className="detail-section__title">Rental Notes</h2>
                <p className="detail-section__text">{rt.rental_notes}</p>
              </div>
            )}
          </div>

          {/* Right: Booking/Pricing Card */}
          <div className="detail-sidebar">
            <div className="detail-booking-card">
              {listing.listing_type === "rent" && rt ? (
                <>
                  <div className="detail-price-main">
                    <span className="detail-price-amount">
                      {rt.monthly_price ? rt.monthly_price.toLocaleString() : rt.daily_price ? rt.daily_price.toLocaleString() : "-"}
                      <span style={{ fontSize: "1rem" }}> ETB</span>
                    </span>
                    <span className="detail-price-period">
                      /{rt.monthly_price ? "month" : "day"}
                    </span>
                  </div>

                  <div className="detail-price-breakdown">
                    {rt.daily_price && rt.monthly_price && (
                      <div className="detail-price-row">
                        <span className="detail-price-label">Daily rate</span>
                        <span className="detail-price-value">{rt.daily_price.toLocaleString()} ETB</span>
                      </div>
                    )}
                    
                    {rt.security_deposit_amount > 0 && (
                      <div className="detail-price-row">
                        <span className="detail-price-label">Security deposit (refundable)</span>
                        <span className="detail-price-value">{rt.security_deposit_amount.toLocaleString()} ETB</span>
                      </div>
                    )}
                    
                    {rt.minimum_rental_days && (
                      <div className="detail-price-row" style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--color-border-light)" }}>
                        <span className="detail-price-label" style={{ fontWeight: 600 }}>Minimum rent period</span>
                        <span className="detail-price-value" style={{ fontWeight: 600 }}>{rt.minimum_rental_days} days</span>
                      </div>
                    )}
                  </div>
                </>
              ) : listing.listing_type === "sale" ? (
                <div className="detail-price-main">
                  <span className="detail-price-amount">Price on Request</span>
                </div>
              ) : null}

              {/* Request Form */}
              <PropertyRequestForm
                listingId={listing.id}
                type={listing.listing_type as "rent" | "sale"}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
