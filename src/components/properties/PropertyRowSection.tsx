import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyListingCard } from "./PropertyListingCard";

interface PropertyRowSectionProps {
  title: string;
  subtitle: string;
  filterType: "rent" | "sale" | "Apartment" | "House" | "Villa" | "Land" | "Commercial" | "Condominium";
  viewAllLink: string;
}

interface PropertyListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: string;
  is_featured: boolean;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    property_types: {
      name: string;
    } | null;
  }[];
  rental_terms: {
    daily_price: number | null;
    monthly_price: number | null;
  }[];
  sale_terms: {
    sale_price: number | null;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export async function PropertyRowSection({ title, subtitle, filterType, viewAllLink }: PropertyRowSectionProps) {
  const supabase = await createClient();

  const isCategoryFilter = ["Apartment", "House", "Villa", "Land", "Commercial", "Condominium"].includes(filterType);

  let typeId = null;
  if (isCategoryFilter) {
    // Map the filter to actual DB names if necessary, e.g. "Commercial" might be "Commercial Property" in DB depending on schema.
    // For now we just use ilike to be safe.
    const { data: typeData } = await supabase
      .from("property_types")
      .select("id")
      .ilike("name", `${filterType}%`)
      .limit(1)
      .single();
    
    if (typeData) {
      typeId = typeData.id;
    }
  }

  // We only require !inner if we are actually filtering by a child field to force an inner join
  const selectQuery = isCategoryFilter && typeId
    ? `
      id, title, location, owner_id, listing_type, is_featured,
      property_details!inner ( bedrooms, bathrooms, area_sqm, property_type_id, property_types ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      sale_terms ( sale_price ),
      listing_images ( image_url, is_primary )
    `
    : `
      id, title, location, owner_id, listing_type, is_featured,
      property_details ( bedrooms, bathrooms, area_sqm, property_types ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      sale_terms ( sale_price ),
      listing_images ( image_url, is_primary )
    `;

  let query = supabase
    .from("listings")
    .select(selectQuery)
    .eq("category", "property")
    .eq("status", "published");

  if (filterType === "rent" || filterType === "sale") {
    query = query.eq("listing_type", filterType);
  } else if (isCategoryFilter && typeId) {
    query = query.eq("property_details.property_type_id", typeId);
  }

  const { data: listings } = await query.order("created_at", { ascending: false }).limit(4);
  const properties = (listings || []) as unknown as PropertyListing[];

  if (properties.length === 0) {
    return null; // Gracefully hide section if no properties match the filter
  }

  // Fetch verification status for all owners via public-safe view
  const ownerIds = [...new Set(properties.map((p) => p.owner_id))];
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
    <section className="featured-properties">
      <div className="featured-properties__inner">
        <div className="featured-properties__header">
          <div>
            <h2 className="featured-properties__title">{title}</h2>
            <p className="featured-properties__subtitle">{subtitle}</p>
          </div>
          <Link href={viewAllLink} className="featured-properties__view-all">
            View all →
          </Link>
        </div>

        <div className="featured-properties__grid">
          {properties.map((prop) => {
            const pd = prop.property_details?.[0];
            const rt = prop.rental_terms?.[0];
            const coverImage =
              prop.listing_images?.find((img) => img.is_primary)?.image_url ||
              prop.listing_images?.[0]?.image_url ||
              "";

            const st = prop.sale_terms?.[0];
            const displayPrice = prop.listing_type === "sale"
              ? (st?.sale_price || 0)
              : (rt?.monthly_price || rt?.daily_price || 0);
            const propertyTypeName = Array.isArray(pd?.property_types) 
              ? pd?.property_types[0]?.name 
              : pd?.property_types?.name;

            return (
              <PropertyListingCard
                key={prop.id}
                id={prop.id}
                title={prop.title}
                location={prop.location || "Addis Ababa"}
                image={coverImage || "/placeholder-property.jpg"}
                price={displayPrice}
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
    </section>
  );
}
