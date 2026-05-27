import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/shared/PropertyCard";

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
    property_types: { name: string } | null;
  }[];
  rental_terms: { daily_price: number | null; monthly_price: number | null }[];
  sale_terms: { sale_price: number | null }[];
  listing_images: { image_url: string; is_primary: boolean }[];
}

export async function FeaturedPropertiesSection() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location, owner_id, listing_type, is_featured,
      property_details ( bedrooms, bathrooms, area_sqm, property_types ( name ) ),
      rental_terms ( daily_price, monthly_price ),
      sale_terms ( sale_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const properties = (listings || []) as unknown as FeaturedPropertyListing[];

  const ownerIds = [...new Set(properties.map((p) => p.owner_id))];
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
    <section className="bg-slate-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Featured Properties
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Verified apartments, villas, and more — ready for you.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all"
          >
            View All Properties <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className={`mt-6 lg:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            properties.length >= 5 ? "lg:grid-cols-5" :
            properties.length >= 4 ? "lg:grid-cols-4" :
            properties.length >= 3 ? "lg:grid-cols-3" :
            "lg:grid-cols-2"
          }`}>
            {properties.map((prop) => {
              const pd = prop.property_details?.[0];
              const rt = prop.rental_terms?.[0];
              const st = prop.sale_terms?.[0];
              const image =
                prop.listing_images?.find((i) => i.is_primary)?.image_url ||
                prop.listing_images?.[0]?.image_url ||
                "";
              const price = prop.listing_type === "sale"
                ? st?.sale_price || 0
                : rt?.monthly_price || rt?.daily_price || 0;

              return (
                <PropertyCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  location={prop.location || "Addis Ababa"}
                  image={image}
                  price={price}
                  type={prop.listing_type === "sale" ? "sale" : "rent"}
                  beds={pd?.bedrooms ?? undefined}
                  baths={pd?.bathrooms ?? undefined}
                  area={pd?.area_sqm ?? undefined}
                  isVerified={verifiedOwnerIds.has(prop.owner_id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Home className="h-10 w-10 text-blue-600" />}
            title="No properties listed yet"
            description="We're onboarding verified property owners right now. Check back soon."
            primaryHref="/dashboard/owner/properties/new"
            primaryLabel="List Your Property"
            secondaryHref="/properties"
            secondaryLabel="Browse All"
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
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
