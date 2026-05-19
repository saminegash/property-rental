import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Cars — CarMarket",
  description:
    "Browse available rental cars in Ethiopia. Find the perfect vehicle for your trip.",
};

type ListingCard = {
  id: string;
  title: string;
  location: string | null;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
    transmission: string;
    fuel_type: string;
    seats: number | null;
    condition: string;
  }[];
  rental_terms: {
    daily_price: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    security_deposit_amount: number;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
};

function formatEnum(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function BrowseCarsPage() {
  const supabase = await createClient();

  // RLS only returns published listings for public/anon users
  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
      id, title, location,
      vehicle_details ( make, model, year, transmission, fuel_type, seats, condition ),
      rental_terms ( daily_price, available_with_driver, available_without_driver, security_deposit_amount ),
      listing_images ( image_url, is_primary )
    `
    )
    .eq("category", "vehicle")
    .eq("listing_type", "rent")
    .order("created_at", { ascending: false });

  return (
    <div className="browse-layout">


      {/* Hero */}
      <section className="browse-hero">
        <h1 className="browse-hero__title">
          Find your perfect rental car
        </h1>
        <p className="browse-hero__subtitle">
          Browse vehicles available for rent across Ethiopia. No account required to browse.
        </p>
      </section>

      {/* Main content */}
      <main className="browse-main">
        {error && (
          <div className="auth-error" style={{ maxWidth: "600px", margin: "0 auto" }}>
            Failed to load listings: {error.message}
          </div>
        )}

        {!error && (!listings || listings.length === 0) && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: "var(--color-text-muted)",
            }}
          >
            <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
              No cars available right now
            </p>
            <p style={{ fontSize: "0.875rem" }}>
              Check back soon — new listings are added regularly.
            </p>
          </div>
        )}

        {listings && listings.length > 0 && (
          <>
            <p
              className="browse-count"
            >
              {listings.length} car{listings.length !== 1 ? "s" : ""} available
            </p>

            <div className="car-grid">
              {(listings as unknown as ListingCard[]).map((listing) => {
                const vd = listing.vehicle_details?.[0];
                const rt = listing.rental_terms?.[0];
                const primaryImg = listing.listing_images?.find(
                  (img) => img.is_primary
                );
                const fallbackImg = listing.listing_images?.[0];
                const coverImage = primaryImg || fallbackImg;

                return (
                  <Link
                    key={listing.id}
                    href={`/cars/${listing.id}`}
                    className="car-card"
                  >
                    {/* Image */}
                    <div className="car-card__image">
                      {coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverImage.image_url}
                          alt={listing.title}
                          className="car-card__img"
                        />
                      ) : (
                        <div className="car-card__placeholder">
                          <span>🚗</span>
                        </div>
                      )}

                      {/* Driver badge */}
                      {rt && (
                        <div className="car-card__badges">
                          {rt.available_with_driver && (
                            <span className="car-card__badge">Driver available</span>
                          )}
                          {rt.available_without_driver && (
                            <span className="car-card__badge car-card__badge--alt">Self-drive</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="car-card__body">
                      <h3 className="car-card__title">{listing.title}</h3>

                      {vd && (
                        <p className="car-card__subtitle">
                          {vd.year} {vd.make} {vd.model}
                        </p>
                      )}

                      {/* Specs row */}
                      {vd && (
                        <div className="car-card__specs">
                          <span>{formatEnum(vd.transmission)}</span>
                          <span className="car-card__dot">·</span>
                          <span>{formatEnum(vd.fuel_type)}</span>
                          {vd.seats && (
                            <>
                              <span className="car-card__dot">·</span>
                              <span>{vd.seats} seats</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      {listing.location && (
                        <p className="car-card__location">
                          📍 {listing.location}
                        </p>
                      )}

                      {/* Footer with price */}
                      <div className="car-card__footer">
                        <div>
                          {rt?.daily_price ? (
                            <>
                              <span className="car-card__price">
                                {rt.daily_price.toLocaleString()} Birr
                              </span>
                              <span className="car-card__price-unit"> / day</span>
                            </>
                          ) : (
                            <span className="car-card__price-unit">
                              Contact for price
                            </span>
                          )}
                        </div>
                        {rt && rt.security_deposit_amount > 0 && (
                          <span className="car-card__deposit">
                            {rt.security_deposit_amount.toLocaleString()} Birr deposit
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>


    </div>
  );
}
