"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vehicleDetailsSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  vehicle_type_id: z.string().uuid("Please select a vehicle type"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1950, "Year must be 1950 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  transmission: z.enum(["automatic", "manual", "semi_automatic", "cvt"], {
    message: "Please select a transmission type",
  }),
  fuel_type: z.enum(["petrol", "diesel", "electric", "hybrid", "phev"], {
    message: "Please select a fuel type",
  }),
  seats: z.coerce.number().int().min(1, "Seats must be at least 1").max(50, "Seats cannot exceed 50").nullable(),
  mileage: z.coerce.number().int().min(0, "Mileage cannot be negative").nullable(),
  color: z.string().optional(),
  condition: z.enum(["new", "excellent", "good", "fair", "needs_repair"], {
    message: "Please select a condition",
  }),
});

export async function saveVehicleDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listingId = formData.get("listing_id");

  // Verify the listing exists and belongs to this user (RLS enforces ownership)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found or you don't have permission to edit it" };
  }

  if (listing.owner_id !== user.id) {
    return { error: "You can only add vehicle details to your own listings" };
  }

  // Parse and validate form data
  const rawSeats = formData.get("seats");
  const rawMileage = formData.get("mileage");

  const parseResult = vehicleDetailsSchema.safeParse({
    listing_id: formData.get("listing_id"),
    vehicle_type_id: formData.get("vehicle_type_id"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    transmission: formData.get("transmission"),
    fuel_type: formData.get("fuel_type"),
    seats: rawSeats === "" || rawSeats === null ? null : rawSeats,
    mileage: rawMileage === "" || rawMileage === null ? null : rawMileage,
    color: formData.get("color") || undefined,
    condition: formData.get("condition"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // Check if vehicle details already exist for this listing (upsert)
  const { data: existing } = await supabase
    .from("vehicle_details")
    .select("id")
    .eq("listing_id", data.listing_id)
    .single();

  if (existing) {
    // Update existing vehicle details
    const { error } = await supabase
      .from("vehicle_details")
      .update({
        vehicle_type_id: data.vehicle_type_id,
        make: data.make,
        model: data.model,
        year: data.year,
        transmission: data.transmission,
        fuel_type: data.fuel_type,
        seats: data.seats,
        mileage: data.mileage,
        color: data.color || null,
        condition: data.condition,
      })
      .eq("listing_id", data.listing_id);

    if (error) {
      return { error: "Failed to update vehicle details: " + error.message };
    }
  } else {
    // Insert new vehicle details
    const { error } = await supabase.from("vehicle_details").insert({
      listing_id: data.listing_id,
      vehicle_type_id: data.vehicle_type_id,
      make: data.make,
      model: data.model,
      year: data.year,
      transmission: data.transmission,
      fuel_type: data.fuel_type,
      seats: data.seats,
      mileage: data.mileage,
      color: data.color || null,
      condition: data.condition,
    });

    if (error) {
      return { error: "Failed to save vehicle details: " + error.message };
    }
  }

  revalidatePath(`/dashboard/owner/cars/${data.listing_id}/edit`);
  revalidatePath("/dashboard/owner");
  return { success: true };
}
