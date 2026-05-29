import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Unified listing model used across the /rent and /buy hubs.
 * Normalizes a `listings` row (property OR vehicle) into one card-ready shape
 * so a single grid can show both side by side.
 */
export type UnifiedListing = {
  id: string;
  kind: "property" | "car";
  title: string;
  location: string;
  image: string;
  /** rent => per-month (property) or per-day (car); sale => sale price */
  price: number;
  type: "rent" | "sale";
  isVerified: boolean;
  isFeatured: boolean;
  // property meta
  beds?: number;
  baths?: number;
  area?: number;
  propertyType?: string;
  // car meta
  mileage?: number;
  transmission?: string;
  // detail-page href, kind-aware
  href: string;
};

type RawRow = {
  id: string;
  title: string;
  location: string | null;
  owner_id: string;
  listing_type: "rent" | "sale";
  is_featured: boolean;
  category: "property" | "vehicle";
  property_details?: {
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    property_types?: { name: string } | { name: string }[] | null;
  }[] | null;
  vehicle_details?: {
    make: string | null;
    model: string | null;
    year: number | null;
    transmission: string | null;
    mileage: number | null;
  }[] | null;
  rental_terms?: { daily_price: number | null; monthly_price: number | null }[] | null;
  sale_terms?: { sale_price: number | null }[] | null;
  listing_images?: { image_url: string; is_primary: boolean }[] | null;
};

const SELECT = `
  id, title, location, owner_id, listing_type, is_featured, category,
  property_details ( bedrooms, bathrooms, area_sqm, property_types:property_type_id ( name ) ),
  vehicle_details ( make, model, year, transmission, mileage ),
  rental_terms ( daily_price, monthly_price ),
  sale_terms ( sale_price ),
  listing_images ( image_url, is_primary )
`;

function firstName(pt: { name: string } | { name: string }[] | null | undefined): string | undefined {
  if (!pt) return undefined;
  return Array.isArray(pt) ? pt[0]?.name : pt.name;
}

function toUnified(row: RawRow, verified: Set<string>): UnifiedListing {
  const isCar = row.category === "vehicle";
  const image =
    row.listing_images?.find((i) => i.is_primary)?.image_url ||
    row.listing_images?.[0]?.image_url ||
    "";

  const rt = row.rental_terms?.[0];
  const st = row.sale_terms?.[0];
  const price =
    row.listing_type === "sale"
      ? st?.sale_price || 0
      : isCar
        ? rt?.daily_price || 0
        : rt?.monthly_price || 0;

  if (isCar) {
    const cd = row.vehicle_details?.[0];
    const parts = [cd?.make, cd?.model, cd?.year].filter(Boolean);
    return {
      id: row.id,
      kind: "car",
      title: parts.length ? parts.join(" ") : row.title,
      location: row.location || "Addis Ababa",
      image,
      price,
      type: row.listing_type,
      isVerified: verified.has(row.owner_id),
      isFeatured: row.is_featured,
      mileage: cd?.mileage ?? undefined,
      transmission: cd?.transmission ?? undefined,
      href: `/cars/${row.id}`,
    };
  }

  const pd = row.property_details?.[0];
  return {
    id: row.id,
    kind: "property",
    title: row.title,
    location: row.location || "Addis Ababa",
    image,
    price,
    type: row.listing_type,
    isVerified: verified.has(row.owner_id),
    isFeatured: row.is_featured,
    beds: pd?.bedrooms ?? undefined,
    baths: pd?.bathrooms ?? undefined,
    area: pd?.area_sqm ?? undefined,
    propertyType: firstName(pd?.property_types),
    href: `/properties/${row.id}`,
  };
}

async function verifiedOwnerSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerIds: string[],
): Promise<Set<string>> {
  const set = new Set<string>();
  if (ownerIds.length === 0) return set;
  const { data } = await supabase
    .from("owner_public_profiles")
    .select("user_id, verification_status")
    .in("user_id", ownerIds)
    .eq("verification_status", "verified");
  for (const op of data || []) set.add(op.user_id);
  return set;
}

export type MixedListingOptions = {
  /** "rent" or "sale" — required, defines the hub */
  listingType: "rent" | "sale";
  /** "property" | "vehicle" | "both" */
  category?: "property" | "vehicle" | "both";
  /** Filter properties by property_types.name (e.g. "Apartment") */
  propertyTypeName?: string;
  limit?: number;
};

/**
 * Fetch a mixed (or single-category) set of listings for a hub section.
 * Featured listings float to the top; within that, newest first.
 */
export async function getMixedListings(
  opts: MixedListingOptions,
): Promise<UnifiedListing[]> {
  const { listingType, category = "both", propertyTypeName, limit = 8 } = opts;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(SELECT)
    .eq("status", "published")
    .eq("listing_type", listingType)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit * 2); // over-fetch; we filter property_type client-side

  if (category !== "both") {
    query = query.eq("category", category);
  }

  const { data } = await query;
  let rows = (data || []) as unknown as RawRow[];

  if (propertyTypeName) {
    rows = rows.filter(
      (r) =>
        r.category === "property" &&
        firstName(r.property_details?.[0]?.property_types)?.toLowerCase() ===
          propertyTypeName.toLowerCase(),
    );
  }

  rows = rows.slice(0, limit);

  const verified = await verifiedOwnerSet(
    supabase,
    [...new Set(rows.map((r) => r.owner_id))],
  );

  return rows.map((r) => toUnified(r, verified));
}

/**
 * Fetch sponsored listings for a hub surface, ordered by `position`
 * (first-come-first-served). Joins the live slot to its published listing.
 */
export async function getSponsoredListings(
  surface: "rent_hub" | "buy_hub" | "home",
  listingType: "rent" | "sale",
  limit = 6,
): Promise<UnifiedListing[]> {
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("sponsored_slots")
    .select(`position, listings:listing_id ( ${SELECT} )`)
    .eq("surface", surface)
    .order("position", { ascending: true })
    .limit(limit);

  const rows = (slots || [])
    .map((s) => (s as unknown as { listings: RawRow | null }).listings)
    .filter((r): r is RawRow => !!r && r.listing_type === listingType);

  const verified = await verifiedOwnerSet(
    supabase,
    [...new Set(rows.map((r) => r.owner_id))],
  );

  return rows.map((r) => toUnified(r, verified));
}
