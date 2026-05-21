import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyListingCard } from "./PropertyListingCard";

interface FeaturedPropertyListing {
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
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export async function FeaturedPropertiesSection() {
  const supabase = await createClient();

  // Fetch only published property listings — RLS-safe
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, listing_type, is_featured,
      property_details ( bedrooms, bathrooms, area_sqm, property_types ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const properties = (listings || []) as unknown as FeaturedPropertyListing[];

  // 2. Fetch verification status for all owners via the public-safe view
  //    No service-role key needed — the view bypasses RLS safely
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
    <section className="featured-properties" id="featured-properties">
      <div className="featured-properties__inner">
        {/* Header */}
        <div className="featured-properties__header">
          <div>
            <h2 className="featured-properties__title">Featured Properties</h2>
            <p className="featured-properties__subtitle">
              Verified apartments, villas, and more — ready for you.
            </p>
          </div>
          <Link href="/properties" className="featured-properties__view-all" id="featured-properties-view-all">
            View all properties →
          </Link>
        </div>

        {/* Cards or Empty State */}
        {properties.length > 0 ? (
          <div className="featured-properties__grid">
            {properties.map((prop) => {
              const pd = prop.property_details?.[0];
              const rt = prop.rental_terms?.[0];
              const coverImage =
                prop.listing_images?.find((img) => img.is_primary)?.image_url ||
                prop.listing_images?.[0]?.image_url ||
                "";

              const displayPrice = rt?.monthly_price || rt?.daily_price || 0;
              const propertyTypeName = pd?.property_types?.name || "Property";

              return (
                <PropertyListingCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  location={prop.location || "Addis Ababa"}
                  image={coverImage || "/placeholder-property.jpg"}
                  price={displayPrice}
                  type={prop.listing_type === "sale" ? "sale" : "rent"}
                  propertyType={propertyTypeName}
                  beds={pd?.bedrooms ?? 0}
                  baths={pd?.bathrooms ?? 0}
                  area={pd?.area_sqm ?? 0}
                  isVerified={verifiedOwnerIds.has(prop.owner_id)}
                  isFeatured={prop.is_featured}
                  href={`/properties/${prop.id}`}
                />
              );
            })}
          </div>
        ) : (
          /* Polished empty state */
          <div className="featured-properties__empty" id="featured-properties-empty">
            <div className="featured-properties__empty-icon" aria-hidden="true">🏠</div>
            <h3 className="featured-properties__empty-title">No properties listed yet</h3>
            <p className="featured-properties__empty-text">
              We&apos;re onboarding verified property owners right now. Check back soon or list your own property to be among the first.
            </p>
            <div className="featured-properties__empty-actions">
              <Link href="/dashboard/owner/properties/new" className="featured-properties__empty-btn featured-properties__empty-btn--primary">
                List Your Property
              </Link>
              <Link href="/properties" className="featured-properties__empty-btn featured-properties__empty-btn--secondary">
                Browse All Properties
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
