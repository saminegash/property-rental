"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePropertyDetails(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const property_type_id = formData.get("property_type_id") as string;
  const bedrooms = formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string, 10) : null;
  const bathrooms = formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string, 10) : null;
  const area_sqm = formData.get("area_sqm") ? parseInt(formData.get("area_sqm") as string, 10) : null;
  const floor = formData.get("floor") ? parseInt(formData.get("floor") as string, 10) : null;
  const total_floors = formData.get("total_floors") ? parseInt(formData.get("total_floors") as string, 10) : null;
  const furnished_status = formData.get("furnished_status") as string || null;
  const property_condition = formData.get("property_condition") as string || null;

  const parking_available = formData.get("parking_available") === "true";
  const compound_available = formData.get("compound_available") === "true";
  const water_available = formData.get("water_available") === "true";
  const electricity_available = formData.get("electricity_available") === "true";
  const internet_available = formData.get("internet_available") === "true";

  if (!listing_id || !property_type_id) {
    return { error: "Missing required fields" };
  }

  // Use upsert to handle both create and update
  const { error } = await supabase
    .from("property_details")
    .upsert(
      {
        listing_id,
        property_type_id,
        bedrooms,
        bathrooms,
        area_sqm,
        floor,
        total_floors,
        furnished_status: furnished_status as "unfurnished" | "semi_furnished" | "fully_furnished" | null,
        property_condition: property_condition as "newly_built" | "excellent" | "good" | "fair" | "needs_repair" | null,
        parking_available,
        compound_available,
        water_available,
        electricity_available,
        internet_available,
      },
      { onConflict: "listing_id" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/owner/properties/${listing_id}/edit`);
  return { success: true };
}

export async function savePropertyPricing(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const monthly_price = formData.get("monthly_price") ? parseFloat(formData.get("monthly_price") as string) : null;
  const daily_price = formData.get("daily_price") ? parseFloat(formData.get("daily_price") as string) : null;
  const security_deposit_amount = parseFloat(formData.get("security_deposit_amount") as string) || 0;
  const minimum_rental_days = parseInt(formData.get("minimum_rental_days") as string, 10) || null;

  if (!listing_id) {
    return { error: "Missing listing ID" };
  }

  const { error } = await supabase
    .from("rental_terms")
    .upsert(
      {
        listing_id,
        monthly_price,
        daily_price,
        security_deposit_amount,
        minimum_rental_days,
        available_with_driver: false,
        available_without_driver: false,
        delivery_available: false,
        pickup_available: false,
      },
      { onConflict: "listing_id" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/owner/properties/${listing_id}/edit`);
  return { success: true };
}
