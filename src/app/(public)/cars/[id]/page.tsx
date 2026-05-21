import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ListingGallery from "@/components/shared/ListingGallery";
import { OwnerTrustCard } from "@/components/cars/OwnerTrustCard";
import { PriceSummaryCard } from "@/components/cars/PriceSummaryCard";
import { SimilarCars } from "@/components/cars/SimilarCars";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatEnum(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDeliveryTime(value: string): string {
  const map: Record<string, string> = {
    within_3_hours: "Within 3 hours",
    same_day: "Same day",
    next_day: "Next day",
    custom: "Custom",
  };
  return map[value] || value;
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
    return { title: "Listing Not Found — CarMarket" };
  }

  return {
    title: `${listing.title} — CarMarket`,
    description: `Rent ${listing.title} in ${listing.location || "Ethiopia"}. Browse details, pricing, and availability on CarMarket.`,
  };
}

export default async function CarDetailPage({
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
      vehicle_details (
        make, model, year, transmission, fuel_type, seats, mileage, color, condition,
        vehicle_types ( name )
      ),
      rental_terms (
        daily_price, weekly_price, monthly_price,
        available_with_driver, available_without_driver,
        daily_driver_fee, weekly_driver_fee, monthly_driver_fee,
        security_deposit_amount, minimum_rental_days,
        pickup_available, delivery_available, delivery_fee,
        estimated_delivery_time, rental_notes
      ),
      listing_images ( id, image_url, is_primary, sort_order )
    `
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Extract joined data (Supabase returns arrays for 1:many, objects for 1:1)
  const vdRaw = listing.vehicle_details;
  const vd = Array.isArray(vdRaw) ? vdRaw[0] : vdRaw;
  const rtRaw = listing.rental_terms;
  const rt = Array.isArray(rtRaw) ? rtRaw[0] : rtRaw;
  const images = (
    Array.isArray(listing.listing_images) ? listing.listing_images : []
  ).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  // Fetch owner verification status (using admin client to bypass owner_profiles RLS)
  // We only expose verification_status and owner_type — never private data
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
                {rt?.available_with_driver && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", backgroundColor: "var(--color-primary)", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                    Driver Available
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

            {/* Vehicle specifications Card */}
            {vd && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Vehicle Specifications</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Make & Model</span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{vd.make} {vd.model}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Year</span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{vd.year}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Transmission</span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{formatEnum(vd.transmission)}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Fuel Type</span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{formatEnum(vd.fuel_type)}</span>
                  </div>
                  {vd.seats && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Seats</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{vd.seats}</span>
                    </div>
                  )}
                  {vd.mileage !== null && vd.mileage !== undefined && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Mileage</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{vd.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {vd.color && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Color</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{vd.color}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-muted)", fontWeight: 600 }}>Condition</span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-heading)" }}>{formatEnum(vd.condition)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup & Delivery Card */}
            {rt && (
              <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>Pickup & Delivery</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-heading)", fontWeight: 500 }}>Pickup Available</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{rt.pickup_available ? "Yes" : "No"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-heading)", fontWeight: 500 }}>Delivery Available</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{rt.delivery_available ? "Yes" : "No"}</span>
                  </div>
                  {rt.delivery_available && rt.estimated_delivery_time && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--color-text-heading)", fontWeight: 500 }}>Est. Delivery Time</span>
                      <span style={{ color: "var(--color-text-muted)" }}>{formatDeliveryTime(rt.estimated_delivery_time)}</span>
                    </div>
                  )}
                  {rt.minimum_rental_days > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--color-text-heading)", fontWeight: 500 }}>Min. Rental Days</span>
                      <span style={{ color: "var(--color-text-muted)" }}>{rt.minimum_rental_days} days</span>
                    </div>
                  )}
                </div>

                {rt.rental_notes && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-heading)" }}>Notes from Owner</span>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>{rt.rental_notes}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Owner Trust Card (Mobile typically stacks below description, but here it's part of the main column flow for simplicity, or it can be grouped with pricing) */}
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

            <PriceSummaryCard
              listingId={listing.id}
              dailyPrice={rt?.daily_price}
              weeklyPrice={rt?.weekly_price}
              monthlyPrice={rt?.monthly_price}
              availableWithDriver={!!rt?.available_with_driver}
              availableWithoutDriver={!!rt?.available_without_driver}
              dailyDriverFee={rt?.daily_driver_fee}
              securityDeposit={rt?.security_deposit_amount}
              deliveryAvailable={!!rt?.delivery_available}
              deliveryFee={rt?.delivery_fee}
            />
          </aside>
        </div>

        {/* Similar Cars Section */}
        <SimilarCars 
          currentListingId={listing.id} 
          location={listing.location} 
          listingType={listing.listing_type} 
        />
      </div>
    </main>
  );
}
