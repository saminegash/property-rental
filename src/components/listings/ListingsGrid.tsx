import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingDetails } from "@/lib/format";

/**
 * Matches the `public.property_type` enum in supabase.
 * See: 20260530000001_redesign_schema.sql
 */
export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "condominium"
  | "studio"
  | "land"
  | "commercial"
  | "warehouse"
  | "vehicle";

export interface ListingsGridProps {
  /** Section heading. */
  title: string;
  /** Section sub-heading. */
  subtitle: string;
  /** "View All" link target. */
  viewAllHref: string;
  /** Optional filter on `listings.property_type`. */
  propertyType?: PropertyType;
  /** Optional filter on `listings.listing_type`. */
  listingType?: "rent" | "sale";
  /** Optional anchor id for in-page navigation. */
  anchorId?: string;
  /** Background variant — alternate when stacking sections. */
  background?: "white" | "slate";
  /** Max number of listings to fetch. */
  limit?: number;
}

/**
 * Shared listings grid used by:
 *   - `FeaturedListingsSection` (home page, mixed)
 *   - Every per-category section on `/trade`
 *
 * Fetches from `listings`, joins primary image, looks up verified owners,
 * renders the same column-wise card grid as the home page Featured block.
 */
export async function ListingsGrid({
  title,
  subtitle,
  viewAllHref,
  propertyType,
  listingType,
  anchorId,
  background = "slate",
  limit = 30,
}: ListingsGridProps) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      `
      id, title, city, sub_city, owner_id, listing_type, is_featured, property_type, price, details,
      listing_images ( image_url, is_primary )
    `,
    )
    .eq("status", "published");

  if (propertyType) {
    query = query.eq("property_type", propertyType);
  }
  if (listingType) {
    query = query.eq("listing_type", listingType);
  }

  const { data: listings } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  const activeListings = listings || [];

  // Resolve verified-owner badges in one round trip.
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

  const bgClass = background === "white" ? "bg-white" : "bg-slate-50";

  return (
    <section
      id={anchorId}
      className={`${bgClass} py-12 lg:py-16 scroll-mt-20`}
    >
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {activeListings.length > 0 ? (
          <div className="mt-6 lg:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
            {activeListings.map((listing) => {
              const image =
                listing.listing_images?.find((i) => i.is_primary)?.image_url ||
                listing.listing_images?.[0]?.image_url ||
                "";

              const details = listing.details as ListingDetails | null;

              return (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={`${listing.sub_city || ""}, ${listing.city || ""}`.replace(
                    /^, /,
                    "",
                  )}
                  image={image}
                  price={listing.price}
                  type={listing.listing_type}
                  propertyType={
                    listing.property_type.charAt(0).toUpperCase() +
                    listing.property_type.slice(1)
                  }
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
          <EmptyState
            icon={<Sparkles className="h-10 w-10 text-blue-600" />}
            title="No listings available right now"
            description="We're onboarding verified owners. Check back soon."
            primaryHref="/dashboard/owner/listings/new"
            primaryLabel="Post a Listing"
            secondaryHref="/trade"
            secondaryLabel="Browse Marketplace"
          />
        )}
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
