import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import RentalRequestForm from "./RentalRequestForm";
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
      id, title, description, location, owner_id,
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

  const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0];

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
  const vehicleTypeRaw = vd?.vehicle_types as unknown;
  const vehicleTypeName = Array.isArray(vehicleTypeRaw)
    ? (vehicleTypeRaw[0] as { name: string } | undefined)?.name
    : (vehicleTypeRaw as { name: string } | null)?.name;

  return (
    <div className="browse-layout">
      {/* Header */}
      <header className="browse-header">
        <div className="browse-header__inner">
          <Link href="/" className="browse-header__logo">
            CarMarket
          </Link>
          <nav className="browse-header__nav">
            <Link href="/cars" className="browse-header__link">
              ← Browse
            </Link>
            <Link href="/login" className="browse-header__link">
              Log in
            </Link>
            <Link
              href="/signup"
              className="auth-button"
              style={{
                textDecoration: "none",
                padding: "0.5rem 1.25rem",
                fontSize: "0.8125rem",
              }}
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="detail-page">
        {/* Image gallery */}
        <section className="detail-gallery">
          {primaryImage ? (
            <div className="detail-gallery__hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(primaryImage as { image_url: string }).image_url}
                alt={listing.title}
                className="detail-gallery__hero-img"
              />
            </div>
          ) : (
            <div className="detail-gallery__hero detail-gallery__placeholder">
              <span style={{ fontSize: "3rem", opacity: 0.3 }}>🚗</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="detail-gallery__thumbs">
              {images.map((img: { id: string; image_url: string; is_primary: boolean }) => (
                <div
                  key={img.id}
                  className={`detail-gallery__thumb ${img.is_primary ? "detail-gallery__thumb--active" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt="Vehicle"
                    className="detail-gallery__thumb-img"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Content columns */}
        <div className="detail-content">
          {/* Left: details */}
          <div className="detail-main">
            {/* Title + badges */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 className="detail-title">{listing.title}</h1>
              {vd && (
                <p className="detail-subtitle">
                  {vd.year} {vd.make} {vd.model}
                  {vehicleTypeName ? ` · ${vehicleTypeName}` : ""}
                </p>
              )}
              {listing.location && (
                <p className="detail-location">📍 {listing.location}</p>
              )}

              <div className="detail-badges">
                <span className="detail-badge" style={{ backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-heading)", border: "1px solid var(--color-border)" }}>
                  ⭐ {ownerRating} Owner Score {ownerReviewCount > 0 ? `(${ownerReviewCount})` : ""}
                </span>
                <span className="detail-badge" style={{ backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)" }}>
                  🚗 Car Rating: Coming Soon
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
                {rt?.available_with_driver && (
                  <span className="detail-badge detail-badge--driver">
                    Driver Available
                  </span>
                )}
                {rt?.available_without_driver && (
                  <span className="detail-badge detail-badge--self">
                    Self-drive
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="detail-section">
                <h2 className="detail-section__title">Description</h2>
                <p className="detail-section__text">{listing.description}</p>
              </div>
            )}

            {/* Vehicle specifications */}
            {vd && (
              <div className="detail-section">
                <h2 className="detail-section__title">Vehicle Specifications</h2>
                <div className="detail-specs-grid">
                  <div className="detail-spec">
                    <span className="detail-spec__label">Make</span>
                    <span className="detail-spec__value">{vd.make}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Model</span>
                    <span className="detail-spec__value">{vd.model}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Year</span>
                    <span className="detail-spec__value">{vd.year}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Transmission</span>
                    <span className="detail-spec__value">{formatEnum(vd.transmission)}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Fuel Type</span>
                    <span className="detail-spec__value">{formatEnum(vd.fuel_type)}</span>
                  </div>
                  {vd.seats && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Seats</span>
                      <span className="detail-spec__value">{vd.seats}</span>
                    </div>
                  )}
                  {vd.mileage !== null && vd.mileage !== undefined && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Mileage</span>
                      <span className="detail-spec__value">{vd.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {vd.color && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Color</span>
                      <span className="detail-spec__value">{vd.color}</span>
                    </div>
                  )}
                  <div className="detail-spec">
                    <span className="detail-spec__label">Condition</span>
                    <span className="detail-spec__value">{formatEnum(vd.condition)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup & Delivery */}
            {rt && (
              <div className="detail-section">
                <h2 className="detail-section__title">Pickup &amp; Delivery</h2>
                <div className="detail-specs-grid">
                  <div className="detail-spec">
                    <span className="detail-spec__label">Pickup</span>
                    <span className="detail-spec__value">{rt.pickup_available ? "✅ Available" : "❌ Not available"}</span>
                  </div>
                  <div className="detail-spec">
                    <span className="detail-spec__label">Delivery</span>
                    <span className="detail-spec__value">{rt.delivery_available ? "✅ Available" : "❌ Not available"}</span>
                  </div>
                  {rt.delivery_available && rt.delivery_fee !== null && rt.delivery_fee !== undefined && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Delivery Fee</span>
                      <span className="detail-spec__value">{rt.delivery_fee.toLocaleString()} Birr</span>
                    </div>
                  )}
                  {rt.delivery_available && rt.estimated_delivery_time && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Est. Delivery</span>
                      <span className="detail-spec__value">{formatDeliveryTime(rt.estimated_delivery_time)}</span>
                    </div>
                  )}
                  {rt.minimum_rental_days > 1 && (
                    <div className="detail-spec">
                      <span className="detail-spec__label">Min. Rental</span>
                      <span className="detail-spec__value">{rt.minimum_rental_days} days</span>
                    </div>
                  )}
                </div>

                {rt.rental_notes && (
                  <div className="detail-notes">
                    <span className="detail-spec__label">Notes from owner</span>
                    <p className="detail-section__text" style={{ marginTop: "0.25rem" }}>{rt.rental_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: pricing sidebar */}
          <aside className="detail-sidebar">
            <div className="detail-price-card">
              {/* Rental Price */}
              <div className="detail-price-hero">
                {rt?.daily_price ? (
                  <>
                    <span className="detail-price-amount">
                      {rt.daily_price.toLocaleString()}
                    </span>
                    <span className="detail-price-currency"> Birr</span>
                    <span className="detail-price-unit"> / day</span>
                  </>
                ) : (
                  <span className="detail-price-unit" style={{ fontSize: "1rem" }}>
                    Contact for price
                  </span>
                )}
              </div>

              {/* Weekly / Monthly pricing */}
              {(rt?.weekly_price || rt?.monthly_price) && (
                <div className="detail-price-alt">
                  {rt?.weekly_price && (
                    <div className="detail-price-alt__row">
                      <span>Weekly</span>
                      <span>{rt.weekly_price.toLocaleString()} Birr</span>
                    </div>
                  )}
                  {rt?.monthly_price && (
                    <div className="detail-price-alt__row">
                      <span>Monthly</span>
                      <span>{rt.monthly_price.toLocaleString()} Birr</span>
                    </div>
                  )}
                </div>
              )}

              {/* Driver fee — separate section */}
              {rt?.available_with_driver && rt.daily_driver_fee && (
                <div className="detail-fee-section">
                  <h4 className="detail-fee-title">Driver Fee</h4>
                  <p className="detail-fee-note">Paid separately to the owner. Not included in rental price.</p>
                  <div className="detail-price-alt">
                    <div className="detail-price-alt__row">
                      <span>Daily</span>
                      <span>{rt.daily_driver_fee.toLocaleString()} Birr</span>
                    </div>
                    {rt.weekly_driver_fee && (
                      <div className="detail-price-alt__row">
                        <span>Weekly</span>
                        <span>{rt.weekly_driver_fee.toLocaleString()} Birr</span>
                      </div>
                    )}
                    {rt.monthly_driver_fee && (
                      <div className="detail-price-alt__row">
                        <span>Monthly</span>
                        <span>{rt.monthly_driver_fee.toLocaleString()} Birr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security deposit */}
              {rt && rt.security_deposit_amount > 0 && (
                <div className="detail-fee-section">
                  <h4 className="detail-fee-title">Security Deposit</h4>
                  <p className="detail-fee-note">Refundable. Collected before handover.</p>
                  <div className="detail-price-alt">
                    <div className="detail-price-alt__row">
                      <span>Deposit</span>
                      <span style={{ fontWeight: 600 }}>{rt.security_deposit_amount.toLocaleString()} Birr</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Form */}
              <RentalRequestForm
                listingId={listing.id}
                availableWithDriver={!!rt?.available_with_driver}
                deliveryAvailable={!!rt?.delivery_available}
              />
            </div>
          </aside>
        </div>
      </main>

      <footer className="browse-footer">
        <p>© {new Date().getFullYear()} CarMarket. All rights reserved.</p>
      </footer>
    </div>
  );
}
