import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "./CarListingCard";

interface CarRowSectionProps {
  title: string;
  subtitle: string;
  filterType: "with_driver" | "without_driver" | "sale";
  viewAllLink: string;
}

interface VehicleListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: string;
  is_featured: boolean;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
    transmission: string;
    fuel_type: string;
    seats: number | null;
  }[];
  rental_terms: {
    daily_price: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    delivery_available: boolean;
  }[] | null;
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export async function CarRowSection({ title, subtitle, filterType, viewAllLink }: CarRowSectionProps) {
  const supabase = await createClient();

  const selectQuery = filterType === "sale"
    ? `
      id, title, location, owner_id, listing_type, is_featured,
      vehicle_details ( make, model, year, transmission, fuel_type, seats, condition ),
      listing_images ( image_url, is_primary )
    `
    : `
      id, title, location, owner_id, listing_type, is_featured,
      vehicle_details ( make, model, year, transmission, fuel_type, seats, condition ),
      rental_terms!inner ( daily_price, available_with_driver, available_without_driver, delivery_available, security_deposit_amount ),
      listing_images ( image_url, is_primary )
    `;

  let query = supabase
    .from("listings")
    .select(selectQuery)
    .eq("category", "vehicle")
    .eq("status", "published");

  if (filterType === "sale") {
    query = query.eq("listing_type", "sale");
  } else {
    query = query.eq("listing_type", "rent");
    if (filterType === "with_driver") {
      query = query.eq("rental_terms.available_with_driver", true);
    }
    if (filterType === "without_driver") {
      query = query.eq("rental_terms.available_without_driver", true);
    }
  }

  const { data: listings } = await query.order("created_at", { ascending: false }).limit(4);
  const cars = (listings || []) as unknown as VehicleListing[];

  if (cars.length === 0) {
    return null; // Gracefully hide section if no cars match the filter
  }

  // Fetch verification status for all owners via public-safe view
  const ownerIds = [...new Set(cars.map((p) => p.owner_id))];
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
    <section className="featured-cars">
      <div className="featured-cars__inner">
        <div className="featured-cars__header">
          <div>
            <h2 className="featured-cars__title">{title}</h2>
            <p className="featured-cars__subtitle">{subtitle}</p>
          </div>
          <Link href={viewAllLink} className="featured-cars__view-all">
            View all →
          </Link>
        </div>

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
                dailyPrice={rt?.daily_price || 0}
                listingType={car.listing_type === "sale" ? "sale" : "rent"}
                isVerifiedOwner={verifiedOwnerIds.has(car.owner_id)}
                isFeatured={car.is_featured}
                href={`/cars/${car.id}`}
                withDriver={rt?.available_with_driver}
                withoutDriver={rt?.available_without_driver}
                deliveryAvailable={rt?.delivery_available}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
