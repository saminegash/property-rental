import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import PropertyDetailsForm from "./property-details-form";
import PropertyPricingForm from "./property-pricing-form";
import ImageUploadForm from "@/components/dashboard/shared/ImageUploadForm";
import SubmitReviewPanel from "@/components/dashboard/shared/SubmitReviewPanel";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, owner_id, status, listing_type")
    .eq("id", id)
    .single();

  if (listingError || !listing || listing.owner_id !== user.id) {
    notFound();
  }

  const { data: propertyDetails } = await supabase
    .from("property_details")
    .select("*")
    .eq("listing_id", id)
    .single();

  const { data: propertyTypes } = await supabase
    .from("property_types")
    .select("id, name")
    .order("name", { ascending: true });

  let pricingTerms = null;
  if (listing.listing_type === "rent") {
    const { data } = await supabase.from("rental_terms").select("*").eq("listing_id", id).single();
    pricingTerms = data;
  } else {
    // If Supabase API errors (e.g. table not created locally yet), it will gracefully return null
    const { data, error } = await supabase.from("sale_terms").select("*").eq("listing_id", id).single();
    if (!error) pricingTerms = data;
  }

  const { data: listingImages } = await supabase
    .from("listing_images")
    .select("id, image_url, storage_path, is_primary, sort_order")
    .eq("listing_id", id)
    .order("sort_order", { ascending: true });

  const { data: pendingPriceChange } = await supabase
    .from("pending_price_changes")
    .select("status, admin_feedback")
    .eq("listing_id", id)
    .single();

  const hasPricing = !!pricingTerms && (listing.listing_type === "rent" ? !!pricingTerms.monthly_price : !!pricingTerms.sale_price);

  return (
    <>
      <PropertyDetailsForm
        listingId={listing.id}
        propertyTypes={propertyTypes || []}
        existingDetails={propertyDetails || null}
      />

      <PropertyPricingForm
        listingId={listing.id}
        listingType={listing.listing_type as "rent" | "sale"}
        existingTerms={pricingTerms || null}
        pendingPriceChange={pendingPriceChange || null}
      />

      <ImageUploadForm
        listingId={listing.id}
        existingImages={listingImages || []}
      />

      <SubmitReviewPanel
        listingStatus={listing.status}
        hasPropertyDetails={!!propertyDetails}
        hasPricing={hasPricing}
        imageCount={(listingImages || []).length}
        backHref="/dashboard/owner/properties"
        category="property"
        onSubmit={async () => {
          "use server";
          const { submitPropertyForReview } = await import("./actions");
          return submitPropertyForReview(listing.id);
        }}
      />
    </>
  );
}
