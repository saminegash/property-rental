import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import VehicleDetailsForm from "./vehicle-details-form";
import RentalPricingForm from "./rental-pricing-form";
import DriverOptionsForm from "./driver-options-form";
import PickupDeliveryForm from "./pickup-delivery-form";
import ImageUploadForm from "@/components/dashboard/shared/ImageUploadForm";
import SubmitReviewPanel from "@/components/dashboard/shared/SubmitReviewPanel";

export const dynamic = "force-dynamic";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the listing with status (RLS ensures only the owner can see their own)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, owner_id, status")
    .eq("id", id)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  // Double-check ownership (defense-in-depth, RLS is the primary gate)
  if (listing.owner_id !== user.id) {
    notFound();
  }

  // Fetch existing vehicle details for this listing (may be null)
  const { data: vehicleDetails } = await supabase
    .from("vehicle_details")
    .select(
      "id, vehicle_type_id, make, model, year, transmission, fuel_type, seats, mileage, color, condition"
    )
    .eq("listing_id", id)
    .single();

  // Fetch vehicle types from the database (dynamic, not hardcoded)
  const { data: vehicleTypes } = await supabase
    .from("vehicle_types")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Fetch existing rental terms (pricing, driver options, pickup/delivery)
  const { data: rentalTerms } = await supabase
    .from("rental_terms")
    .select(
      "daily_price, weekly_price, monthly_price, security_deposit_amount, minimum_rental_days, available_with_driver, available_without_driver, daily_driver_fee, weekly_driver_fee, monthly_driver_fee, pickup_available, delivery_available, delivery_fee, estimated_delivery_time, rental_notes"
    )
    .eq("listing_id", id)
    .single();

  // Fetch existing listing images
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

  // Determine if pricing has been set
  const hasPricing = !!(rentalTerms?.daily_price && rentalTerms.daily_price > 0);

  return (
    <>
      {/* Section 1: Vehicle Details */}
      <VehicleDetailsForm
        listingId={listing.id}
        listingTitle={listing.title}
        vehicleTypes={vehicleTypes || []}
        existingDetails={vehicleDetails || null}
      />

      {/* Section 2: Rental Pricing */}
      <RentalPricingForm
        listingId={listing.id}
        existingPricing={
          rentalTerms
            ? {
                daily_price: rentalTerms.daily_price,
                weekly_price: rentalTerms.weekly_price,
                monthly_price: rentalTerms.monthly_price,
                security_deposit_amount: rentalTerms.security_deposit_amount,
                minimum_rental_days: rentalTerms.minimum_rental_days,
              }
            : null
        }
        pendingPriceChange={pendingPriceChange || null}
      />

      {/* Section 3: Driver Options */}
      <DriverOptionsForm
        listingId={listing.id}
        existingOptions={
          rentalTerms
            ? {
                available_with_driver: rentalTerms.available_with_driver,
                available_without_driver: rentalTerms.available_without_driver,
                daily_driver_fee: rentalTerms.daily_driver_fee,
                weekly_driver_fee: rentalTerms.weekly_driver_fee,
                monthly_driver_fee: rentalTerms.monthly_driver_fee,
              }
            : null
        }
        pendingPriceChange={pendingPriceChange || null}
      />

      {/* Section 4: Pickup & Delivery */}
      <PickupDeliveryForm
        listingId={listing.id}
        existingData={
          rentalTerms
            ? {
                pickup_available: rentalTerms.pickup_available,
                delivery_available: rentalTerms.delivery_available,
                delivery_fee: rentalTerms.delivery_fee,
                estimated_delivery_time: rentalTerms.estimated_delivery_time,
                rental_notes: rentalTerms.rental_notes,
              }
            : null
        }
        pendingPriceChange={pendingPriceChange || null}
      />

      {/* Section 5: Photo Gallery (5-10 required) */}
      <ImageUploadForm
        listingId={listing.id}
        existingImages={listingImages || []}
      />

      {/* Section 6: Submit for Review */}
      <SubmitReviewPanel
        listingStatus={listing.status}
        hasVehicleDetails={!!vehicleDetails}
        hasPricing={hasPricing}
        hasRentalTerms={!!rentalTerms}
        imageCount={(listingImages || []).length}
        backHref="/dashboard/owner/cars"
        category="vehicle"
        onSubmit={async () => {
          "use server";
          const { submitForReview } = await import("./actions");
          return submitForReview(listing.id);
        }}
      />
    </>
  );
}
