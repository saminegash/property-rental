import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RentalCarCard } from "./RentalCarCard";

interface CarRentalListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  is_featured: boolean;
  car_details: {
    brand: string | null;
    model: string | null;
    year: number | null;
    body_type: string | null;
    transmission: string | null;
    fuel_type: string | null;
    seats: number | null;
    mileage: number | null;
    driver_included: boolean | null;
  }[];
  rental_terms: {
    daily_price: number | null;
    weekly_price: number | null;
  }[];
  listing_images: { image_url: string; is_primary: boolean }[];
}

export type CarRentalSectionProps = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  /** Filter by body_type (sedan, suv, van, pickup, luxury) */
  bodyType?: string;
  featuredOnly?: boolean;
  limit?: number;
  background?: "white" | "slate";
};

/**
 * Reusable car rental section. Used 6× on /cars/rent:
 *   - Featured (featuredOnly=true)
 *   - Sedan (bodyType="sedan")
 *   - SUV (bodyType="suv")
 *   - Van (bodyType="van")
 *   - Pickup (bodyType="pickup")
 *   - Luxury (bodyType="luxury")
 */
export async function CarRentalListingsSection({
  title,
  subtitle,
  viewAllHref = "/cars?listing_type=rent",
  bodyType,
  featuredOnly = false,
  limit = 5,
  background = "white",
}: CarRentalSectionProps) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, is_featured,
      car_details!inner ( brand, model, year, body_type, transmission, fuel_type, seats, mileage, driver_included ),
      rental_terms ( daily_price, weekly_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "car")
    .eq("status", "published")
    .eq("listing_type", "rent")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (bodyType) {
    query = query.ilike("car_details.body_type", bodyType);
  }

  const { data: listings } = await query;
  const cars = (listings || []) as unknown as CarRentalListing[];

  // Verified owners
  const ownerIds = [...new Set(cars.map((c) => c.owner_id))];
  const verifiedOwnerIds = new Set<string>();
  if (ownerIds.length > 0) {
    const { data: ownerProfiles } = await supabase
      .from("owner_public_profiles")
      .select("user_id, verification_status")
      .in("user_id", ownerIds)
      .eq("verification_status", "verified");
    if (ownerProfiles) {
      for (const op of ownerProfiles) verifiedOwnerIds.add(op.user_id);
    }
  }

  const bgClass = background === "slate" ? "bg-slate-50" : "bg-white";

  return (
    <section className={`${bgClass} py-10 lg:py-14`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600 hover:gap-2 transition-all"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {cars.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-5">
            {cars.map((c) => {
              const cd = c.car_details?.[0];
              const rt = c.rental_terms?.[0];
              const image =
                c.listing_images?.find((i) => i.is_primary)?.image_url ||
                c.listing_images?.[0]?.image_url ||
                "";

              // Build a clean display title: "Toyota Corolla 2020"
              const parts = [cd?.brand, cd?.model, cd?.year].filter(Boolean);
              const displayTitle = parts.length > 0 ? parts.join(" ") : c.title;

              return (
                <RentalCarCard
                  key={c.id}
                  id={c.id}
                  title={displayTitle}
                  location={c.location || "Addis Ababa"}
                  image={image}
                  dailyRate={rt?.daily_price || 0}
                  mileage={cd?.mileage ?? undefined}
                  transmission={cd?.transmission ?? undefined}
                  fuel={cd?.fuel_type ?? undefined}
                  seats={cd?.seats ?? undefined}
                  driverIncluded={cd?.driver_included ?? undefined}
                  isVerified={verifiedOwnerIds.has(c.owner_id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState viewAllHref={viewAllHref} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ viewAllHref }: { viewAllHref: string }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <Car className="h-7 w-7 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">No cars in this category yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        We&apos;re onboarding more verified sellers. Check back soon.
      </p>
      <Link
        href={viewAllHref}
        className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Browse All Rentals
      </Link>
    </div>
  );
}
