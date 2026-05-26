import React from "react";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "./CarListingCard";

interface SimilarCarsProps {
  currentListingId: string;
  location?: string | null;
  listingType: string;
}

type SimilarCarData = {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: string;
  is_featured: boolean;
  rental_terms: {
    daily_price: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    delivery_available: boolean;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
};

export async function SimilarCars({ currentListingId, location, listingType }: SimilarCarsProps) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, listing_type, is_featured,
      vehicle_details ( transmission, fuel_type, seats, condition ),
      rental_terms ( daily_price, available_with_driver, available_without_driver, delivery_available ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("status", "published")
    .eq("listing_type", listingType)
    .neq("id", currentListingId);

  // Optionally prioritize same location
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  const { data: listings } = await query.order("created_at", { ascending: false }).limit(4);

  if (!listings || listings.length === 0) {
    return null;
  }

  // Fetch verification status
  const ownerIds = [...new Set(listings.map((l) => l.owner_id))];
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
    <div style={{ marginTop: "3rem", borderTop: "1px solid var(--color-border-light)", paddingTop: "3rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1.5rem" }}>
        Similar Cars
      </h2>
      <div className="featured-cars__grid">
        {(listings as SimilarCarData[]).map((car) => {
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
  );
}
