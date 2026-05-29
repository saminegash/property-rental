"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyListingOwnership(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("owner_id, property_type")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found" };
  }

  if (listing.owner_id !== user.id) {
    return { error: "You can only manage images for your own listings" };
  }

  return { userId: user.id, property_type: listing.property_type };
}

export async function saveImageMetadata(params: {
  listingId: string;
  imageUrl: string;
  storagePath: string;
  isPrimary: boolean;
  sortOrder: number;
}) {
  const ownership = await verifyListingOwnership(params.listingId);
  if ("error" in ownership) {
    return { error: ownership.error };
  }

  const supabase = await createClient();

  // If this is marked as primary, unset any existing primary image
  if (params.isPrimary) {
    await supabase
      .from("listing_images")
      .update({ is_primary: false })
      .eq("listing_id", params.listingId)
      .eq("is_primary", true);
  }

  const { data, error } = await supabase
    .from("listing_images")
    .insert({
      listing_id: params.listingId,
      image_url: params.imageUrl,
      storage_path: params.storagePath,
      is_primary: params.isPrimary,
      sort_order: params.sortOrder,
    })
    .select("id, image_url, storage_path, is_primary, sort_order")
    .single();

  if (error) {
    return { error: "Failed to save image metadata: " + error.message };
  }

  revalidatePath(`/dashboard/owner/listings/${params.listingId}/edit`);
  return { image: data };
}

export async function setPrimaryImage(params: {
  listingId: string;
  imageId: string;
}) {
  const ownership = await verifyListingOwnership(params.listingId);
  if ("error" in ownership) {
    return { error: ownership.error };
  }

  const supabase = await createClient();

  // Unset all primary flags for this listing
  const { error: unsetError } = await supabase
    .from("listing_images")
    .update({ is_primary: false })
    .eq("listing_id", params.listingId);

  if (unsetError) {
    return { error: "Failed to update primary image: " + unsetError.message };
  }

  // Set the chosen image as primary
  const { error: setError } = await supabase
    .from("listing_images")
    .update({ is_primary: true })
    .eq("id", params.imageId)
    .eq("listing_id", params.listingId);

  if (setError) {
    return { error: "Failed to set primary image: " + setError.message };
  }

  revalidatePath(`/dashboard/owner/listings/${params.listingId}/edit`);
  return { success: true };
}

export async function deleteImage(params: {
  listingId: string;
  imageId: string;
  storagePath: string;
}) {
  const ownership = await verifyListingOwnership(params.listingId);
  if ("error" in ownership) {
    return { error: ownership.error };
  }

  const supabase = await createClient();

  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from("listing-images")
    .remove([params.storagePath]);

  if (storageError) {
    return { error: "Failed to delete image file: " + storageError.message };
  }

  // Delete metadata row
  const { error: dbError } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", params.imageId)
    .eq("listing_id", params.listingId);

  if (dbError) {
    return { error: "Failed to delete image record: " + dbError.message };
  }

  // If the deleted image was primary, promote the first remaining image
  const { data: remaining } = await supabase
    .from("listing_images")
    .select("id")
    .eq("listing_id", params.listingId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();

  if (remaining) {
    await supabase
      .from("listing_images")
      .update({ is_primary: true })
      .eq("id", remaining.id);
  }

  revalidatePath(`/dashboard/owner/listings/${params.listingId}/edit`);
  return { success: true };
}
