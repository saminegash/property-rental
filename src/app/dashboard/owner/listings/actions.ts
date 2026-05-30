"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Database } from "@/lib/supabase/database.types";

type PropertyType = Database["public"]["Enums"]["property_type"];
type ListingType = Database["public"]["Enums"]["listing_type"];

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const property_type = formData.get("property_type") as PropertyType;
  const listing_type = formData.get("listing_type") as ListingType;
  const price = Number(formData.get("price")) || 0;
  const city = (formData.get("city") as string) || null;
  const sub_city = (formData.get("sub_city") as string) || null;
  const bedrooms = formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null;
  const bathrooms = formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null;
  const area_sqm = formData.get("area_sqm") ? Number(formData.get("area_sqm")) : null;

  if (!title || !property_type || !listing_type) {
    throw new Error("Title, property type, and listing type are required.");
  }

  const { error } = await supabase.from("listings").insert({
    owner_id: user.id,
    title,
    description,
    property_type,
    listing_type,
    price,
    city,
    sub_city,
    bedrooms,
    bathrooms,
    area_sqm,
    status: "pending_review",
  });

  if (error) {
    throw new Error("Failed to create listing: " + error.message);
  }

  revalidatePath("/dashboard/owner/listings");
  redirect("/dashboard/owner/listings");
}

export async function updateListing(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const property_type = formData.get("property_type") as PropertyType;
  const listing_type = formData.get("listing_type") as ListingType;
  const price = Number(formData.get("price")) || 0;
  const city = (formData.get("city") as string) || null;
  const sub_city = (formData.get("sub_city") as string) || null;
  const bedrooms = formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null;
  const bathrooms = formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null;
  const area_sqm = formData.get("area_sqm") ? Number(formData.get("area_sqm")) : null;

  if (!title || !property_type || !listing_type) {
    throw new Error("Title, property type, and listing type are required.");
  }

  const { error } = await supabase
    .from("listings")
    .update({
      title,
      description,
      property_type,
      listing_type,
      price,
      city,
      sub_city,
      bedrooms,
      bathrooms,
      area_sqm,
    })
    .eq("id", listingId)
    .eq("owner_id", user.id); // RLS double-check

  if (error) {
    throw new Error("Failed to update listing: " + error.message);
  }

  revalidatePath("/dashboard/owner/listings");
  redirect("/dashboard/owner/listings");
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Soft-delete by setting deleted_at
  const { error } = await supabase
    .from("listings")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", listingId)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error("Failed to delete listing: " + error.message);
  }

  revalidatePath("/dashboard/owner/listings");
  return;
}
