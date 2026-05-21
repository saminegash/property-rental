import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

// Landing Page Components
import { FeaturedCarsSection } from "@/components/cars/FeaturedCarsSection";
import { CarRowSection } from "@/components/cars/CarRowSection";
import { CarCategoriesSection } from "@/components/cars/CarCategoriesSection";
import { TrustFeaturesSection } from "@/components/cars/TrustFeaturesSection";
import { PricingTransparencySection } from "@/components/cars/PricingTransparencySection";
import { HowItWorksSection } from "@/components/cars/HowItWorksSection";
import { OwnerCTASection } from "@/components/cars/OwnerCTASection";
import { PopularLocationsSection } from "@/components/cars/PopularLocationsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Cars — MyEthioProperties",
  description:
    "Browse verified rental cars in Ethiopia. Filter by location, driver option, and more.",
};

// ── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  location?: string;
  start?: string;
  end?: string;
  driver?: "with" | "without" | string;
  delivery?: "true" | string;
  category?: string;
  min_price?: string;
  max_price?: string;
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
    delivery_available: boolean;
    security_deposit_amount: number;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEnum(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BrowseCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Active filter summary
  const hasFilters = !!(params.location || params.driver || params.delivery || params.min_price || params.max_price);

  let error = null;
  let filtered: ListingCard[] = [];

  // Only run complex DB query if we are in Search Mode (filters are active)
  if (hasFilters) {
    let query = supabase
      .from("listings")
      .select(
        `
        id, title, location,
        vehicle_details ( make, model, year, transmission, fuel_type, seats, condition ),
        rental_terms ( daily_price, available_with_driver, available_without_driver, delivery_available, security_deposit_amount ),
        listing_images ( image_url, is_primary )
      `
      )
      .eq("category", "vehicle")
      .eq("listing_type", "rent")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (params.location) {
      query = query.ilike("location", `%${params.location}%`);
    }

    const { data: listings, error: fetchError } = await query;
    error = fetchError;

    filtered = (listings || []) as unknown as ListingCard[];

    if (params.driver === "with") {
      filtered = filtered.filter((l) => l.rental_terms?.[0]?.available_with_driver);
    } else if (params.driver === "without") {
      filtered = filtered.filter((l) => l.rental_terms?.[0]?.available_without_driver);
    }

    if (params.delivery === "true") {
      filtered = filtered.filter((l) => l.rental_terms?.[0]?.delivery_available);
    }

    if (params.min_price) {
      const min = parseInt(params.min_price, 10);
      filtered = filtered.filter((l) => (l.rental_terms?.[0]?.daily_price ?? 0) >= min);
    }
    if (params.max_price) {
      const max = parseInt(params.max_price, 10);
      filtered = filtered.filter((l) => (l.rental_terms?.[0]?.daily_price ?? Infinity) <= max);
    }
  }

  return (
    <div className={hasFilters ? "browse-layout" : ""}>
      {/* ── Page hero ── */}
      <section className="browse-hero">
        <h1 className="browse-hero__title">
          {hasFilters ? "Search Results" : "Find Your Perfect Car"}
        </h1>
        <p className="browse-hero__subtitle">
          Verified rentals across Ethiopia — with or without a driver.
        </p>
      </section>

      {/* ── Search + filter bar ── */}
      <div className="browse-filter-bar" id="filter-bar">
        <form method="GET" action="/cars" className="browse-filter-form">
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
              placeholder="e.g. Bole, Addis Ababa"
              defaultValue={params.location ?? ""}
              className="browse-filter-input"
            />
          </div>

          {/* Driver option */}
          <div className="browse-filter-field">
            <label htmlFor="filter-driver" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 12 5 10.8 5H5.6c-.8 0-1.5.5-1.8 1.2L2 11v5c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
              Driver
            </label>
            <select
              id="filter-driver"
              name="driver"
              defaultValue={params.driver ?? ""}
              className="browse-filter-select"
            >
              <option value="">Any option</option>
              <option value="with">With Driver</option>
              <option value="without">Self-Drive</option>
            </select>
          </div>

          {/* Delivery */}
          <div className="browse-filter-field browse-filter-field--check">
            <label className="browse-filter-check-label" htmlFor="filter-delivery">
              <input
                type="checkbox"
                id="filter-delivery"
                name="delivery"
                value="true"
                defaultChecked={params.delivery === "true"}
                className="browse-filter-checkbox"
              />
              Delivery Available
            </label>
          </div>

          {/* Price range */}
          <div className="browse-filter-field">
            <label htmlFor="filter-min" className="browse-filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Price (Birr/day)
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
              <Link href="/cars" className="browse-filter-btn browse-filter-btn--clear">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {hasFilters ? (
        // ── Search Mode Layout ──
        <>
          {/* Active filter chips */}
          <div className="browse-active-filters" aria-label="Active filters">
            <span className="browse-active-filters__label">Filtered by:</span>
            {params.location && (
              <span className="browse-active-chip">
                📍 {params.location}
                <Link href={`/cars?${new URLSearchParams({ ...params, location: "" }).toString()}`} aria-label="Remove location filter">×</Link>
              </span>
            )}
            {params.driver && (
              <span className="browse-active-chip">
                🚗 {params.driver === "with" ? "With Driver" : "Self-Drive"}
                <Link href={`/cars?${new URLSearchParams({ ...params, driver: "" }).toString()}`} aria-label="Remove driver filter">×</Link>
              </span>
            )}
            {params.delivery === "true" && (
              <span className="browse-active-chip">
                📦 Delivery
                <Link href={`/cars?${new URLSearchParams({ ...params, delivery: "" }).toString()}`} aria-label="Remove delivery filter">×</Link>
              </span>
            )}
            {(params.min_price || params.max_price) && (
              <span className="browse-active-chip">
                💰 {params.min_price || "0"}–{params.max_price || "∞"} Birr/day
                <Link href={`/cars?${new URLSearchParams({ ...params, min_price: "", max_price: "" }).toString()}`} aria-label="Remove price filter">×</Link>
              </span>
            )}
          </div>

          {/* Results */}
          <main className="browse-main">
            {error && (
              <div className="auth-error" style={{ maxWidth: "600px", margin: "0 auto" }}>
                Failed to load listings: {error.message}
              </div>
            )}

            {!error && filtered.length === 0 && (
              <div className="browse-empty">
                <div className="browse-empty__icon">🚗</div>
                <h2 className="browse-empty__title">No cars found</h2>
                <p className="browse-empty__text">
                  Try adjusting your filters or clearing them to see all available cars.
                </p>
                <Link href="/cars" className="auth-button" style={{ textDecoration: "none", display: "inline-block", marginTop: "1rem" }}>
                  Clear all filters
                </Link>
              </div>
            )}

            {filtered.length > 0 && (
              <>
                <p className="browse-count">
                  {filtered.length} car{filtered.length !== 1 ? "s" : ""} found
                  {params.location ? ` in ${params.location}` : ""}
                </p>

                <div className="car-grid">
                  {filtered.map((listing) => {
                    const vd = listing.vehicle_details?.[0];
                    const rt = listing.rental_terms?.[0];
                    const primaryImg = listing.listing_images?.find((img) => img.is_primary);
                    const coverImage = primaryImg || listing.listing_images?.[0];

                    return (
                      <Link key={listing.id} href={`/cars/${listing.id}`} className="car-card">
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
                          {/* Driver/delivery badges */}
                          {rt && (
                            <div className="car-card__badges">
                              {rt.available_with_driver && (
                                <span className="car-card__badge">Driver available</span>
                              )}
                              {rt.available_without_driver && (
                                <span className="car-card__badge car-card__badge--alt">Self-drive</span>
                              )}
                              {rt.delivery_available && (
                                <span className="car-card__badge car-card__badge--delivery">Delivery</span>
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
                          {listing.location && (
                            <p className="car-card__location">📍 {listing.location}</p>
                          )}
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
                                <span className="car-card__price-unit">Contact for price</span>
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
        </>
      ) : (
        // ── Landing Mode Layout ──
        <div className="landing-layout">
          <FeaturedCarsSection />
          
          <CarRowSection
            title="Cars With Driver"
            subtitle="Sit back, relax, and let our professional drivers navigate."
            filterType="with_driver"
            viewAllLink="/cars?driver=with"
          />

          <CarRowSection
            title="Self-Drive Cars"
            subtitle="Take the wheel and explore at your own pace."
            filterType="without_driver"
            viewAllLink="/cars?driver=without"
          />

          <CarRowSection
            title="Cars For Sale"
            subtitle="Find your next personal or business vehicle."
            filterType="sale"
            viewAllLink="/cars?listing_type=sale"
          />

          <CarCategoriesSection />
          <PricingTransparencySection />
          <TrustFeaturesSection />
          <HowItWorksSection />
          <PopularLocationsSection />
          <OwnerCTASection />
        </div>
      )}
    </div>
  );
}
