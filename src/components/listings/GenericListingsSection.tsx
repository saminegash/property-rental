import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";

export async function GenericListingsSection({
  title,
  subtitle,
  listingType,
}: {
  title: string;
  subtitle: string;
  listingType: "rent" | "sale";
}) {
  const supabase = await createClient();

  // Query the new listings table
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, city, sub_city, owner_id, listing_type, is_featured, property_type, price, details,
      listing_images ( image_url, is_primary )
    `)
    .eq("status", "published")
    .eq("listing_type", listingType)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(16);

  const activeListings = listings || [];

  // Fetch verification status of owners
  const ownerIds = [...new Set(activeListings.map((p) => p.owner_id))];
  const verifiedOwnerIds = new Set<string>();
  if (ownerIds.length > 0) {
    const { data: ownerProfiles } = await supabase
      .from("profiles")
      .select("user_id, verification_status")
      .in("user_id", ownerIds)
      .eq("verification_status", "verified");
    if (ownerProfiles) {
      for (const op of ownerProfiles) verifiedOwnerIds.add(op.user_id);
    }
  }

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {subtitle}
            </p>
          </div>
        </div>

        {activeListings.length > 0 ? (
          <div className="mt-6 lg:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeListings.map((listing) => {
              const image =
                listing.listing_images?.find((i) => i.is_primary)?.image_url ||
                listing.listing_images?.[0]?.image_url ||
                "";
                
              const details = listing.details as Record<string, any>;

              return (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={`${listing.sub_city || ""}, ${listing.city || ""}`.replace(/^, /, '')}
                  image={image}
                  price={listing.price}
                  type={listing.listing_type}
                  propertyType={listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)}
                  beds={details?.bedrooms || null}
                  baths={details?.bathrooms || null}
                  area={details?.area_sqm || null}
                  isVerified={verifiedOwnerIds.has(listing.owner_id)}
                  isFeatured={listing.is_featured}
                  href={`/listings/${listing.id}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No listings available</h3>
            <p className="mt-2 max-w-md text-sm text-slate-600">Check back later for new listings.</p>
          </div>
        )}
      </div>
    </section>
  );
}
