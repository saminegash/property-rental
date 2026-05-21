import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PropertyDetailsForm, { PropertyDetailsData } from "./property-details-form";
import PropertyPricingForm, { PropertyPricingData } from "./property-pricing-form";
import ImageUploadForm from "../../../cars/[id]/edit/image-upload-form";
import PropertySubmitReviewPanel from "./property-submit-review-panel";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch listing and ensure ownership
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
      id, status, title, description, location, admin_rejection_reason, listing_type,
      property_details ( * ),
      rental_terms ( * ),
      listing_images ( id, image_url, is_primary, sort_order, storage_path )
    `
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const { data: propertyTypes } = await supabase.from("property_types").select("*").order("name");

  // Determine readiness for submission
  const hasDetails = listing.property_details && (Array.isArray(listing.property_details) ? listing.property_details.length > 0 : !!listing.property_details);
  const rtRaw = listing.rental_terms;
  const rt = Array.isArray(rtRaw) ? rtRaw[0] : rtRaw;
  const hasPricing = listing.listing_type === "sale" ? true : !!rt?.monthly_price || !!rt?.daily_price;


  // Existing data parsing
  const pdRaw = listing.property_details;
  const existingDetails = Array.isArray(pdRaw) ? pdRaw[0] : pdRaw;
  const existingPricing = rt;
  const images = (Array.isArray(listing.listing_images) ? listing.listing_images : []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dashboard-title">Edit Property Listing</h1>
        <p className="dashboard-hint">
          Complete all sections below to submit your property for admin review.
          You need at least 5 photos.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Step 1: Basic Info (Read-only for now, or could make a form) */}
        <div className="dashboard-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>Basic Information</h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Title</div>
              <div style={{ fontWeight: 500 }}>{listing.title}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Location</div>
              <div style={{ fontWeight: 500 }}>{listing.location}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Type</div>
              <div style={{ fontWeight: 500 }}>{listing.listing_type === "rent" ? "For Rent" : "For Sale"}</div>
            </div>
          </div>
        </div>

        {/* Step 2: Property Details */}
        <PropertyDetailsForm
          listingId={listing.id}
          propertyTypes={propertyTypes || []}
          existingDetails={existingDetails as unknown as PropertyDetailsData}
        />

        {/* Step 3: Pricing */}
        <PropertyPricingForm
          listingId={listing.id}
          listingType={listing.listing_type}
          existingPricing={existingPricing as unknown as PropertyPricingData}
        />

        {/* Step 4: Photos */}
        <ImageUploadForm
          listingId={listing.id}
          existingImages={images}
          listingType="property"
        />

        {/* Step 5: Submit */}
        <PropertySubmitReviewPanel
          listingId={listing.id}
          listingStatus={listing.status}
          hasPropertyDetails={hasDetails}
          hasPricing={hasPricing}
          imageCount={images.length}
          rejectionReason={listing.admin_rejection_reason}
        />
      </div>
    </div>
  );
}
