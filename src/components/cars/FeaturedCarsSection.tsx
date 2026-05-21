import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "./CarListingCard";

interface FeaturedCarListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  is_featured: boolean;
  listing_type: "rent" | "sale";
  vehicle_details: {
    make: string;
    model: string;
    year: number;
  }[];
  rental_terms: {
    daily_price: number | null;
    daily_driver_fee: number | null;
    security_deposit_amount: number;
    delivery_fee: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    delivery_available: boolean;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export async function FeaturedCarsSection() {
  const supabase = await createClient();

  // 1. Fetch only published vehicle listings (rent and sale)
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, is_featured, listing_type,
      vehicle_details ( make, model, year ),
      rental_terms (
        daily_price, daily_driver_fee, security_deposit_amount,
        delivery_fee, available_with_driver, available_without_driver, delivery_available
      ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const cars = (listings || []) as unknown as FeaturedCarListing[];

  // 2. Fetch verification status for all owners via the public-safe view
  //    No service-role key needed — the view bypasses RLS safely
  const ownerIds = [...new Set(cars.map((c) => c.owner_id))];
  const verifiedOwnerIds = new Set<string>();

  if (ownerIds.length > 0) {
    const { data: ownerProfiles } = await supabase
      .from("owner_public_profiles")
      .select("user_id, verification_status")
      .in("user_id", ownerIds)
      .eq("verification_status", "verified");

    if (ownerProfiles) {
      for (const op of ownerProfiles) {
        verifiedOwnerIds.add(op.user_id);
      }
    }
  }

  return (
    <section className="featured-cars" id="featured-cars">
      <div className="featured-cars__inner">
        {/* Header */}
        <div className="featured-cars__header">
          <div>
            <h2 className="featured-cars__title">Featured Cars</h2>
            <p className="featured-cars__subtitle">
              Top rated and most trusted cars, ready for you.
            </p>
          </div>
          <Link href="/cars" className="featured-cars__view-all" id="featured-cars-view-all">
            View all cars →
          </Link>
        </div>

        {/* Cards or Empty State */}
        {cars.length > 0 ? (
          <div className="featured-cars__grid">
            {cars.map((car) => {
              const rt = car.rental_terms?.[0];
              const coverImage =
                car.listing_images?.find((img) => img.is_primary)?.image_url ||
                car.listing_images?.[0]?.image_url ||
                "";

              return (
                <CarListingCard
                  key={car.id}
                  id={car.id}
                  title={car.title}
                  location={car.location || "Addis Ababa"}
                  image={coverImage || "/placeholder-car.jpg"}
                  listingType={car.listing_type}
                  dailyPrice={rt?.daily_price || null}
                  salePrice={null} // Sale price handling will be added when DB supports it
                  driverFee={rt?.daily_driver_fee || 0}
                  securityDeposit={rt?.security_deposit_amount || 0}
                  deliveryAvailable={rt?.delivery_available || false}
                  withDriver={rt?.available_with_driver || false}
                  withoutDriver={rt?.available_without_driver || false}
                  isNegotiable={false} // Negotiable flag handling will be added later
                  isVerifiedOwner={verifiedOwnerIds.has(car.owner_id)}
                  isFeatured={car.is_featured}
                  href={`/cars/${car.id}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="featured-cars__empty" id="featured-cars-empty">
            <div className="featured-cars__empty-icon" aria-hidden="true">
              🚗
            </div>
            <h3 className="featured-cars__empty-title">No cars listed yet</h3>
            <p className="featured-cars__empty-text">
              We&apos;re onboarding verified car owners right now. Check back soon or list your own car to be among the first.
            </p>
            <div className="featured-cars__empty-actions">
              <Link
                href="/dashboard/owner/cars/new"
                className="featured-cars__empty-btn featured-cars__empty-btn--primary"
              >
                List Your Car
              </Link>
              <Link
                href="/cars"
                className="featured-cars__empty-btn featured-cars__empty-btn--secondary"
              >
                Browse All Cars
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
