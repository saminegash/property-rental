import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ListingGallery from "@/components/shared/ListingGallery";
import { OwnerTrustCard } from "@/components/cars/OwnerTrustCard";
import { PropertyPriceSummaryCard } from "@/components/properties/PropertyPriceSummaryCard";
import { SimilarProperties } from "@/components/properties/SimilarProperties";
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
        property_type_id, bedrooms, bathrooms, area_sqm, floor, total_floors,
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
    <main className="detail-page" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
      <div className="detail-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Image gallery */}
        <div style={{ marginTop: "1.5rem", marginBottom: "2rem", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          <ListingGallery images={images} title={listing.title} />
        </div>

        {/* Content columns */}
        <div className="detail-content" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          
          {/* Left: details */}
          <div className="detail-main" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Title + basic info */}
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                  {listing.listing_type === "sale" ? "For Sale" : "For Rent"}
                </span>
                {propertyTypeName && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", backgroundColor: "var(--color-primary)", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                    {propertyTypeName}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                {listing.title}
              </h1>
              {listing.location && (
                <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {listing.location}
                </p>
              )}
            </div>

            {/* Description Card */}
            {listing.description && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Description</h2>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{listing.description}</p>
              </div>
            )}

            {/* Property Details Card */}
            {pd && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Property Details</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1.25rem" }}>
                  {pd.bedrooms != null && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Bedrooms</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{pd.bedrooms}</span>
                    </div>
                  )}
                  {pd.bathrooms != null && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Bathrooms</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{pd.bathrooms}</span>
                    </div>
                  )}
                  {pd.area_sqm != null && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Area</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{pd.area_sqm} m²</span>
                    </div>
                  )}
                  {pd.property_condition && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Condition</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{formatEnum(pd.property_condition)}</span>
                    </div>
                  )}
                  {pd.furnished_status && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Furnished</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{formatEnum(pd.furnished_status)}</span>
                    </div>
                  )}
                  {pd.floor != null && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Floor</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{pd.floor} {pd.total_floors ? `of ${pd.total_floors}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Card */}
            {pd && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Amenities</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.9375rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.parking_available ? "var(--color-text-heading)" : "var(--color-text-muted)", textDecoration: pd.parking_available ? "none" : "line-through" }}>
                    <span>🚗</span> Parking
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.compound_available ? "var(--color-text-heading)" : "var(--color-text-muted)", textDecoration: pd.compound_available ? "none" : "line-through" }}>
                    <span>🌳</span> Compound
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.water_available ? "var(--color-text-heading)" : "var(--color-text-muted)", textDecoration: pd.water_available ? "none" : "line-through" }}>
                    <span>💧</span> Water
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.electricity_available ? "var(--color-text-heading)" : "var(--color-text-muted)", textDecoration: pd.electricity_available ? "none" : "line-through" }}>
                    <span>⚡</span> Electricity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: pd.internet_available ? "var(--color-text-heading)" : "var(--color-text-muted)", textDecoration: pd.internet_available ? "none" : "line-through" }}>
                    <span>🌐</span> Internet
                  </div>
                </div>
              </div>
            )}

            {/* Rental Notes (if rent) */}
            {listing.listing_type === "rent" && rt?.rental_notes && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Rental Notes</h2>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{rt.rental_notes}</p>
              </div>
            )}
            
            {/* Owner Trust Card (Mobile stacked) */}
            <div className="mobile-only-trust-card" style={{ display: "block" }}>
              <OwnerTrustCard
                isVerified={isVerified}
                ownerRating={ownerRating}
                ownerReviewCount={ownerReviewCount}
                ownerType={ownerProfile?.owner_type}
                businessName={ownerProfile?.business_name}
              />
            </div>
            
          </div>

          {/* Right: pricing sidebar */}
          <aside className="detail-sidebar" style={{ width: "100%" }}>
            <div className="desktop-only-trust-card" style={{ display: "none" }}>
              <OwnerTrustCard
                isVerified={isVerified}
                ownerRating={ownerRating}
                ownerReviewCount={ownerReviewCount}
                ownerType={ownerProfile?.owner_type}
                businessName={ownerProfile?.business_name}
              />
            </div>

            <PropertyPriceSummaryCard
              listingId={listing.id}
              listingType={listing.listing_type as "rent" | "sale"}
              dailyPrice={rt?.daily_price}
              monthlyPrice={rt?.monthly_price}
              securityDeposit={rt?.security_deposit_amount}
              minimumRentalDays={rt?.minimum_rental_days}
            />
          </aside>
        </div>

        {/* Similar Properties Section */}
        <SimilarProperties 
          currentListingId={listing.id} 
          location={listing.location} 
          listingType={listing.listing_type} 
          propertyTypeId={pd?.property_type_id}
        />
      </div>
    </main>
  );
}
