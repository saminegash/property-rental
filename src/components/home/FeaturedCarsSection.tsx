import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CarCard } from "@/components/shared/CarCard";

interface FeaturedCarListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: string;
  is_featured: boolean;
  car_details: {
    mileage: number | null;
    transmission: string | null;
    year: number | null;
  }[];
  rental_terms: { daily_price: number | null; weekly_price: number | null }[];
  sale_terms: { sale_price: number | null }[];
  listing_images: { image_url: string; is_primary: boolean }[];
}

export async function FeaturedCarsSection() {
  const supabase = await createClient();

  // Note: this assumes you have a car_details table. Adjust the select if your schema differs.
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, listing_type, is_featured,
      car_details ( mileage, transmission, year ),
      rental_terms ( daily_price, weekly_price ),
      sale_terms ( sale_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "car")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const cars = (listings || []) as unknown as FeaturedCarListing[];

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

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Featured Cars
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Verified vehicles from trusted sellers.
            </p>
          </div>
          <Link
            href="/cars"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {cars.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
            {cars.map((car) => {
              const cd = car.car_details?.[0];
              const rt = car.rental_terms?.[0];
              const st = car.sale_terms?.[0];
              const image =
                car.listing_images?.find((i) => i.is_primary)?.image_url ||
                car.listing_images?.[0]?.image_url ||
                "";
              const price = car.listing_type === "sale"
                ? st?.sale_price || 0
                : rt?.daily_price || 0;

              const titleWithYear = cd?.year
                ? `${car.title} ${cd.year}`
                : car.title;

              return (
                <CarCard
                  key={car.id}
                  id={car.id}
                  title={titleWithYear}
                  location={car.location || "Addis Ababa"}
                  image={image}
                  price={price}
                  type={car.listing_type === "sale" ? "sale" : "rent"}
                  mileage={cd?.mileage ?? undefined}
                  transmission={cd?.transmission ?? undefined}
                  isVerified={verifiedOwnerIds.has(car.owner_id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Car className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No cars listed yet</h3>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              We&apos;re onboarding verified sellers right now.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/become-owner?category=car"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                List Your Car
              </Link>
              <Link
                href="/cars"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse All
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
