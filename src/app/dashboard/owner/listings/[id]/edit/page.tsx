import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateListing } from "../../actions";
import { ListingFormFields } from "../../new/page";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, description, property_type, listing_type, price, city, sub_city, bedrooms, bathrooms, area_sqm, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!listing) {
    notFound();
  }

  const updateWithId = updateListing.bind(null, listing.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Edit Listing</h1>
          <p className="dashboard-hint">
            Update your listing details below.
            {listing.status === "published" && " Changes will take effect immediately."}
            {listing.status === "rejected" && " Re-submit to send for review again."}
          </p>
        </div>
        <Link href="/dashboard/owner/listings" style={{ fontSize: "0.875rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Listings
        </Link>
      </div>

      <div className="dashboard-card" style={{ padding: "2rem" }}>
        <form action={updateWithId}>
          <ListingFormFields
            defaults={{
              title: listing.title,
              description: listing.description,
              property_type: listing.property_type,
              listing_type: listing.listing_type,
              price: listing.price,
              city: listing.city,
              sub_city: listing.sub_city,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              area_sqm: listing.area_sqm,
            }}
          />

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
            <button type="submit" className="auth-button" style={{ marginTop: 0 }}>
              Save Changes
            </button>
            <Link href="/dashboard/owner/listings" className="auth-button auth-button--secondary" style={{ textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
