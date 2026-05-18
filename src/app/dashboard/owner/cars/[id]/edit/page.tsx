import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import VehicleDetailsForm from "./vehicle-details-form";

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

  return (
    <VehicleDetailsForm
      listingId={listing.id}
      listingTitle={listing.title}
      vehicleTypes={vehicleTypes || []}
      existingDetails={vehicleDetails || null}
    />
  );
}
