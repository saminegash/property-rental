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

// ─── Driver Options ──────────────────────────────────────────────

const driverOptionsSchema = z
  .object({
    listing_id: z.string().uuid("Invalid listing ID"),
    available_with_driver: z.boolean(),
    available_without_driver: z.boolean(),
    daily_driver_fee: z.coerce.number().int().min(0, "Daily driver fee must be 0 or more").nullable(),
    weekly_driver_fee: z.coerce.number().int().min(0, "Weekly driver fee must be 0 or more").nullable(),
    monthly_driver_fee: z.coerce.number().int().min(0, "Monthly driver fee must be 0 or more").nullable(),
  })
  .refine(
    (d) => d.available_with_driver || d.available_without_driver,
    { message: "At least one option must be selected: with driver or without driver" }
  )
  .refine(
    (d) => !d.available_with_driver || (d.daily_driver_fee !== null && d.daily_driver_fee > 0),
    { message: "Daily driver fee is required when available with driver" }
  );

export async function saveDriverOptions(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listingId = formData.get("listing_id");

  // Verify listing ownership (RLS + defense-in-depth)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found or you don't have permission to edit it" };
  }

  if (listing.owner_id !== user.id) {
    return { error: "You can only update driver options for your own listings" };
  }

  // Parse checkbox values (unchecked checkboxes are absent from FormData)
  const rawDailyFee = formData.get("daily_driver_fee");
  const rawWeeklyFee = formData.get("weekly_driver_fee");
  const rawMonthlyFee = formData.get("monthly_driver_fee");

  const parseResult = driverOptionsSchema.safeParse({
    listing_id: listingId,
    available_with_driver: formData.get("available_with_driver") === "true",
    available_without_driver: formData.get("available_without_driver") === "true",
    daily_driver_fee: rawDailyFee === "" || rawDailyFee === null ? null : rawDailyFee,
    weekly_driver_fee: rawWeeklyFee === "" || rawWeeklyFee === null ? null : rawWeeklyFee,
    monthly_driver_fee: rawMonthlyFee === "" || rawMonthlyFee === null ? null : rawMonthlyFee,
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // Clear driver fees if not available with driver
  const driverFees = data.available_with_driver
    ? {
        daily_driver_fee: data.daily_driver_fee,
        weekly_driver_fee: data.weekly_driver_fee,
        monthly_driver_fee: data.monthly_driver_fee,
      }
    : {
        daily_driver_fee: null,
        weekly_driver_fee: null,
        monthly_driver_fee: null,
      };

  // Check if rental_terms already exist for this listing (upsert)
  const { data: existing } = await supabase
    .from("rental_terms")
    .select("id")
    .eq("listing_id", data.listing_id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("rental_terms")
      .update({
        available_with_driver: data.available_with_driver,
        available_without_driver: data.available_without_driver,
        ...driverFees,
      })
      .eq("listing_id", data.listing_id);

    if (error) {
      return { error: "Failed to update driver options: " + error.message };
    }
  } else {
    const { error } = await supabase.from("rental_terms").insert({
      listing_id: data.listing_id,
      available_with_driver: data.available_with_driver,
      available_without_driver: data.available_without_driver,
      ...driverFees,
    });

    if (error) {
      return { error: "Failed to save driver options: " + error.message };
    }
  }

  revalidatePath(`/dashboard/owner/cars/${data.listing_id}/edit`);
  revalidatePath("/dashboard/owner");
  return { success: true };
}

// ─── Pickup & Delivery ──────────────────────────────────────────

const pickupDeliverySchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  pickup_available: z.boolean(),
  delivery_available: z.boolean(),
  delivery_fee: z.coerce
    .number()
    .int()
    .min(0, "Delivery fee must be 0 or more")
    .nullable(),
  estimated_delivery_time: z
    .enum(["within_3_hours", "same_day", "next_day", "custom", ""], {
      message: "Invalid delivery time option",
    })
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  rental_notes: z.string().optional(),
});

export async function savePickupDelivery(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listingId = formData.get("listing_id");

  // Verify listing ownership (RLS + defense-in-depth)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return {
      error: "Listing not found or you don't have permission to edit it",
    };
  }

  if (listing.owner_id !== user.id) {
    return {
      error: "You can only update pickup & delivery for your own listings",
    };
  }

  const rawDeliveryFee = formData.get("delivery_fee");

  const parseResult = pickupDeliverySchema.safeParse({
    listing_id: listingId,
    pickup_available: formData.get("pickup_available") === "true",
    delivery_available: formData.get("delivery_available") === "true",
    delivery_fee:
      rawDeliveryFee === "" || rawDeliveryFee === null
        ? null
        : rawDeliveryFee,
    estimated_delivery_time: formData.get("estimated_delivery_time") || null,
    rental_notes: formData.get("rental_notes") || undefined,
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // Clear delivery-specific fields if delivery is not available
  const deliveryFields = data.delivery_available
    ? {
        delivery_fee: data.delivery_fee,
        estimated_delivery_time: data.estimated_delivery_time,
      }
    : {
        delivery_fee: null,
        estimated_delivery_time: null,
      };

  // Check if rental_terms already exist for this listing (upsert)
  const { data: existing } = await supabase
    .from("rental_terms")
    .select("id")
    .eq("listing_id", data.listing_id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("rental_terms")
      .update({
        pickup_available: data.pickup_available,
        delivery_available: data.delivery_available,
        ...deliveryFields,
        rental_notes: data.rental_notes || null,
      })
      .eq("listing_id", data.listing_id);

    if (error) {
      return {
        error: "Failed to update pickup & delivery options: " + error.message,
      };
    }
  } else {
    const { error } = await supabase.from("rental_terms").insert({
      listing_id: data.listing_id,
      pickup_available: data.pickup_available,
      delivery_available: data.delivery_available,
      ...deliveryFields,
      rental_notes: data.rental_notes || null,
    });

    if (error) {
      return {
        error: "Failed to save pickup & delivery options: " + error.message,
      };
    }
  }

  revalidatePath(`/dashboard/owner/cars/${data.listing_id}/edit`);
  revalidatePath("/dashboard/owner");
  return { success: true };
}

