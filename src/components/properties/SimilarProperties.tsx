import React from "react";
import { createClient } from "@/lib/supabase/server";
import { PropertyListingCard } from "./PropertyListingCard";

interface SimilarPropertiesProps {
  currentListingId: string;
  location?: string | null;
  listingType: string;
  propertyTypeId?: string | null;
}

type SupabaseListingImage = {
  image_url: string;
  is_primary: boolean;
};

type SupabasePropertyType = { name: string };

type SupabasePropertyDetails = {
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  property_types?: SupabasePropertyType | SupabasePropertyType[] | null;
};

type SupabaseRentalTerm = {
  daily_price: number | null;
  monthly_price: number | null;
};

type SimilarPropertyResult = {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: string;
  is_featured: boolean;
  property_details?: SupabasePropertyDetails | SupabasePropertyDetails[] | null;
  rental_terms?: SupabaseRentalTerm[] | null;
  listing_images?: SupabaseListingImage[] | null;
};

export async function SimilarProperties({ currentListingId, location, listingType, propertyTypeId }: SimilarPropertiesProps) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, listing_type, is_featured,
      property_details!inner ( bedrooms, bathrooms, area_sqm, property_types ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .eq("listing_type", listingType)
    .neq("id", currentListingId);

  // Optionally prioritize same location
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  
  // Try to match property type if provided
  if (propertyTypeId) {
    query = query.eq("property_details.property_type_id", propertyTypeId);
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
        Similar Properties
      </h2>
      <div className="featured-cars__grid">
        {(listings as unknown as SimilarPropertyResult[]).map((prop) => {
          const pdRaw = prop.property_details;
          const pd = Array.isArray(pdRaw) ? pdRaw[0] : pdRaw;
          const propertyTypeName = Array.isArray(pd?.property_types) 
            ? pd?.property_types[0]?.name 
            : (pd?.property_types as SupabasePropertyType | undefined)?.name;

          const rt = prop.rental_terms?.[0];
          const price = rt?.monthly_price || rt?.daily_price || 0;

          const coverImage =
            prop.listing_images?.find((img) => img.is_primary)?.image_url ||
            prop.listing_images?.[0]?.image_url ||
            "";

          return (
            <PropertyListingCard
              key={prop.id}
              id={prop.id}
              title={prop.title}
              location={prop.location || "Addis Ababa"}
              image={coverImage || "/placeholder-property.jpg"}
              price={price}
              type={prop.listing_type === "sale" ? "sale" : "rent"}
              beds={pd?.bedrooms || 0}
              baths={pd?.bathrooms || 0}
              area={pd?.area_sqm || 0}
              propertyType={propertyTypeName || "Property"}
              isVerified={verifiedOwnerIds.has(prop.owner_id)}
              isFeatured={prop.is_featured}
              href={`/properties/${prop.id}`}
            />
          );
        })}
      </div>
    </div>
  );
}
