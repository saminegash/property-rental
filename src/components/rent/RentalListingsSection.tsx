import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RentalPropertyCard } from "./RentalPropertyCard";

interface RentalListing {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  is_featured: boolean;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    property_types: { name: string } | null;
  }[];
  rental_terms: {
    monthly_price: number | null;
    deposit_months: number | null;
  }[];
  listing_images: { image_url: string; is_primary: boolean }[];
}

export type RentalSectionProps = {
  /** Section heading, e.g. "Featured Rental Properties" */
  title: string;
  /** Optional subtitle below heading */
  subtitle?: string;
  /** "View all" link destination */
  viewAllHref?: string;
  /** Filter by a specific property_type name (e.g. "Apartment", "Condominium") */
  propertyTypeName?: string;
  /** Only show featured listings (used for the Featured section) */
  featuredOnly?: boolean;
  /** Max number of cards to fetch */
  limit?: number;
  /** Background tone — alternates section bg colors */
  background?: "white" | "slate";
};

/**
 * Reusable rental section. One component, multiple use cases:
 *   - Featured Rentals (featuredOnly=true)
 *   - Apartment Rentals (propertyTypeName="Apartment")
 *   - Condo Rentals (propertyTypeName="Condominium")
 *   - House Rentals (propertyTypeName="House")
 *
 * Fetches data server-side, renders 5-column grid on desktop.
 */
export async function RentalListingsSection({
  title,
  subtitle,
  viewAllHref = "/properties?listing_type=rent",
  propertyTypeName,
  featuredOnly = false,
  limit = 5,
  background = "white",
}: RentalSectionProps) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, is_featured,
      property_details!inner ( bedrooms, bathrooms, area_sqm, property_types!inner ( name ) ),
      rental_terms ( monthly_price, deposit_months ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .eq("listing_type", "rent")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (propertyTypeName) {
    // Filter via the nested property_types relation
    query = query.eq("property_details.property_types.name", propertyTypeName);
  }

  const { data: listings } = await query;
  const rentals = (listings || []) as unknown as RentalListing[];

  // Verified owners lookup
  const ownerIds = [...new Set(rentals.map((r) => r.owner_id))];
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
        {/* Header */}
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
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
        {rentals.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-5">
            {rentals.map((r) => {
              const pd = r.property_details?.[0];
              const rt = r.rental_terms?.[0];
              const image =
                r.listing_images?.find((i) => i.is_primary)?.image_url ||
                r.listing_images?.[0]?.image_url ||
                "";

              return (
                <RentalPropertyCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  location={r.location || "Addis Ababa"}
                  image={image}
                  monthlyRent={rt?.monthly_price || 0}
                  beds={pd?.bedrooms ?? undefined}
                  baths={pd?.bathrooms ?? undefined}
                  area={pd?.area_sqm ?? undefined}
                  isVerified={verifiedOwnerIds.has(r.owner_id)}
                  depositMonths={rt?.deposit_months ?? undefined}
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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <Home className="h-7 w-7 text-blue-600" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">No rentals here yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        We&apos;re onboarding more owners. Check back soon or browse all rentals.
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
