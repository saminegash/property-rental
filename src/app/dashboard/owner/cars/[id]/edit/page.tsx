import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import VehicleDetailsForm from "./vehicle-details-form";
import DriverOptionsForm from "./driver-options-form";
import PickupDeliveryForm from "./pickup-delivery-form";

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

  // Fetch the listing (RLS ensures only the owner can see their own listings)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, title, owner_id")
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

  // Fetch existing rental terms (driver options + pickup/delivery)
  const { data: rentalTerms } = await supabase
    .from("rental_terms")
    .select(
      "available_with_driver, available_without_driver, daily_driver_fee, weekly_driver_fee, monthly_driver_fee, pickup_available, delivery_available, delivery_fee, estimated_delivery_time, rental_notes"
    )
    .eq("listing_id", id)
    .single();

  return (
    <>
      <VehicleDetailsForm
        listingId={listing.id}
        listingTitle={listing.title}
        vehicleTypes={vehicleTypes || []}
        existingDetails={vehicleDetails || null}
      />

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
      />

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
      />
    </>
  );
}
