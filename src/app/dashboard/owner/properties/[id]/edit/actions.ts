"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const propertyDetailsSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  property_type_id: z.string().uuid("Please select a property type"),
  bedrooms: z.coerce.number().int().min(0, "Cannot be negative").nullable(),
  bathrooms: z.coerce.number().int().min(0, "Cannot be negative").nullable(),
  area_sqm: z.coerce.number().int().min(1, "Must be at least 1").nullable(),
  floor: z.coerce.number().int().nullable(),
  furnished_status: z.enum(["unfurnished", "semi_furnished", "fully_furnished"], { message: "Select furnished status" }),
  property_condition: z.enum(["newly_built", "excellent", "good", "fair", "needs_repair"], { message: "Select condition" }),
  parking_available: z.boolean().default(false),
  compound_available: z.boolean().default(false),
  water_available: z.boolean().default(false),
  electricity_available: z.boolean().default(false),
  internet_available: z.boolean().default(false),
});

const rentPricingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  monthly_price: z.coerce.number().int().min(1, "Monthly rent is required"),
  security_deposit_amount: z.coerce.number().int().min(0).nullable(),
});

const salePricingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  sale_price: z.coerce.number().int().min(1, "Sale price is required"),
  is_negotiable: z.boolean().default(false),
});

export async function savePropertyDetails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parseResult = propertyDetailsSchema.safeParse({
    listing_id: formData.get("listing_id"),
    property_type_id: formData.get("property_type_id"),
    bedrooms: formData.get("bedrooms") || null,
    bathrooms: formData.get("bathrooms") || null,
    area_sqm: formData.get("area_sqm") || null,
    floor: formData.get("floor") || null,
    furnished_status: formData.get("furnished_status"),
    property_condition: formData.get("property_condition"),
    parking_available: formData.get("parking_available") === "on",
    compound_available: formData.get("compound_available") === "on",
    water_available: formData.get("water_available") === "on",
    electricity_available: formData.get("electricity_available") === "on",
    internet_available: formData.get("internet_available") === "on",
  });

  if (!parseResult.success) return { error: parseResult.error.issues[0].message };
  const data = parseResult.data;

  // UPSERT property_details
  const { data: existing } = await supabase
    .from("property_details")
    .select("id")
    .eq("listing_id", data.listing_id)
    .single();

  if (existing) {
    const { error } = await supabase.from("property_details").update(data).eq("listing_id", data.listing_id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("property_details").insert(data);
    if (error) return { error: error.message };
  }

  revalidatePath(`/dashboard/owner/properties/${data.listing_id}/edit`);
  return { success: true };
}

export async function saveRentPricing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parseResult = rentPricingSchema.safeParse({
    listing_id: formData.get("listing_id"),
    monthly_price: formData.get("monthly_price"),
    security_deposit_amount: formData.get("security_deposit_amount") || null,
  });

  if (!parseResult.success) return { error: parseResult.error.issues[0].message };
  const data = parseResult.data;

  // Check listing status
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("status")
    .eq("id", data.listing_id)
    .single();

  if (listingError || !listing) return { error: "Listing not found" };

  if (listing.status === "published") {
    // Upsert to pending_price_changes
    const { data: existingPending } = await supabase
      .from("pending_price_changes")
      .select("id")
      .eq("listing_id", data.listing_id)
      .single();

    if (existingPending) {
      const { error } = await supabase
        .from("pending_price_changes")
        .update({ proposed_terms: data, status: 'pending' })
        .eq("id", existingPending.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("pending_price_changes")
        .insert({
          listing_id: data.listing_id,
          owner_id: user.id,
          listing_type: 'rent',
          proposed_terms: data,
        });
      if (error) return { error: error.message };
    }
  } else {
    // Normal save
    const { data: existing } = await supabase.from("rental_terms").select("id").eq("listing_id", data.listing_id).single();

    if (existing) {
      const { error } = await supabase.from("rental_terms").update(data).eq("listing_id", data.listing_id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("rental_terms").insert(data);
      if (error) return { error: error.message };
    }
  }

  revalidatePath(`/dashboard/owner/properties/${data.listing_id}/edit`);
  return { success: true };
}

export async function saveSalePricing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parseResult = salePricingSchema.safeParse({
    listing_id: formData.get("listing_id"),
    sale_price: formData.get("sale_price"),
    is_negotiable: formData.get("is_negotiable") === "on",
  });

  if (!parseResult.success) return { error: parseResult.error.issues[0].message };
  const data = parseResult.data;

  // Check listing status
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("status")
    .eq("id", data.listing_id)
    .single();

  if (listingError || !listing) return { error: "Listing not found" };

  if (listing.status === "published") {
    // Upsert to pending_price_changes
    const { data: existingPending } = await supabase
      .from("pending_price_changes")
      .select("id")
      .eq("listing_id", data.listing_id)
      .single();

    if (existingPending) {
      const { error } = await supabase
        .from("pending_price_changes")
        .update({ proposed_terms: data, status: 'pending' })
        .eq("id", existingPending.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("pending_price_changes")
        .insert({
          listing_id: data.listing_id,
          owner_id: user.id,
          listing_type: 'sale',
          proposed_terms: data,
        });
      if (error) return { error: error.message };
    }
  } else {
    // Normal save
    const { data: existing } = await supabase.from("sale_terms").select("id").eq("listing_id", data.listing_id).single();

    if (existing) {
      const { error } = await supabase.from("sale_terms").update(data).eq("listing_id", data.listing_id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("sale_terms").insert(data);
      if (error) return { error: error.message };
    }
  }

  revalidatePath(`/dashboard/owner/properties/${data.listing_id}/edit`);
  return { success: true };
}

export async function submitPropertyForReview(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, status, owner_id, listing_type")
    .eq("id", listingId)
    .single();

  if (listingError || !listing || listing.owner_id !== user.id) {
    return { error: "Listing not found" };
  }

  // Pre-flight checks
  const missing = [];
  const { data: pd } = await supabase.from("property_details").select("id").eq("listing_id", listingId).single();
  if (!pd) missing.push("Property details are missing");

  if (listing.listing_type === "rent") {
    const { data: rt } = await supabase.from("rental_terms").select("id").eq("listing_id", listingId).single();
    if (!rt) missing.push("Rental pricing is missing");
  } else {
    const { data: st } = await supabase.from("sale_terms").select("id").eq("listing_id", listingId).single();
    if (!st) missing.push("Sale pricing is missing");
  }

  const { data: images } = await supabase.from("listing_images").select("id").eq("listing_id", listingId);
  const imgCount = images?.length || 0;
  if (imgCount < 5) missing.push(`At least 5 photos required (you have ${imgCount})`);

  if (missing.length > 0) return { error: "Cannot submit yet", missing };

  // Update status
  const { error: updateError } = await supabase
    .from("listings")
    .update({ status: "pending" }) // pending review
    .eq("id", listingId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/dashboard/owner/properties/${listingId}/edit`);
  return { success: true };
}
