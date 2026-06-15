"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Database } from "@/lib/supabase/database.types";

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || "en";
}

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

  // 1. Insert the listing
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !listing) {
    throw new Error("Failed to create listing: " + (error?.message || "Unknown error"));
  }

  // 2. Upload images
  const files = formData.getAll("images") as File[];
  const primaryIndex = Number(formData.get("primary_image_index") ?? 0);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.size || !file.name) continue; // skip empty entries

    const ext = file.name.split(".").pop() || "webp";
    const storagePath = `${listing.id}/${crypto.randomUUID()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Image upload failed for ${file.name}:`, uploadError.message);
      continue; // Skip this image but continue with others
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("listing-images").getPublicUrl(storagePath);

    // Insert into listing_images table
    const { error: dbError } = await supabase.from("listing_images").insert({
      listing_id: listing.id,
      image_url: publicUrl,
      storage_path: storagePath,
      is_primary: i === primaryIndex,
      sort_order: i,
    });

    if (dbError) {
      console.error(`Failed to save image record:`, dbError.message);
    }
  }

  revalidatePath("/dashboard/owner/listings");
  redirect(`/${await getLocale()}/dashboard/owner/listings`);
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

  // Upload any new images
  const files = formData.getAll("images") as File[];
  if (files.length > 0 && files[0].size > 0) {
    // Get current image count
    const { count } = await supabase
      .from("listing_images")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId);

    const currentCount = count || 0;
    const MAX_IMAGES = 10;

    for (let i = 0; i < files.length && currentCount + i < MAX_IMAGES; i++) {
      const file = files[i];
      if (!file.size || !file.name) continue;

      const ext = file.name.split(".").pop() || "webp";
      const storagePath = `${listingId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Image upload failed:`, uploadError.message);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-images").getPublicUrl(storagePath);

      await supabase.from("listing_images").insert({
        listing_id: listingId,
        image_url: publicUrl,
        storage_path: storagePath,
        is_primary: false,
        sort_order: currentCount + i,
      });
    }
  }

  revalidatePath("/dashboard/owner/listings");
  redirect(`/${await getLocale()}/dashboard/owner/listings`);
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

/* ─── Image Management Actions ─── */

export async function deleteListingImage(imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Fetch the image to get storage_path and verify ownership
  const { data: image } = await supabase
    .from("listing_images")
    .select("id, listing_id, storage_path, is_primary")
    .eq("id", imageId)
    .single();

  if (!image) throw new Error("Image not found");

  // Verify listing ownership
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", image.listing_id)
    .eq("owner_id", user.id)
    .single();

  if (!listing) throw new Error("Not authorized");

  // Delete from storage
  if (image.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("listing-images")
      .remove([image.storage_path]);

    if (storageError) {
      console.error("Failed to delete from storage:", storageError.message);
    }
  }

  // Delete from DB
  const { error } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error("Failed to delete image: " + error.message);

  // If this was the primary image, set the next one as primary
  if (image.is_primary) {
    const { data: remaining } = await supabase
      .from("listing_images")
      .select("id")
      .eq("listing_id", image.listing_id)
      .order("sort_order", { ascending: true })
      .limit(1);

    if (remaining && remaining.length > 0) {
      await supabase
        .from("listing_images")
        .update({ is_primary: true })
        .eq("id", remaining[0].id);
    }
  }

  revalidatePath("/dashboard/owner/listings");
  revalidatePath(`/listings/${image.listing_id}`);
}

export async function setPrimaryImage(listingId: string, imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Verify ownership
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .single();

  if (!listing) throw new Error("Not authorized");

  // Unset all primary flags for this listing
  await supabase
    .from("listing_images")
    .update({ is_primary: false })
    .eq("listing_id", listingId);

  // Set the new primary
  const { error } = await supabase
    .from("listing_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("listing_id", listingId);

  if (error) throw new Error("Failed to set primary image: " + error.message);

  revalidatePath("/dashboard/owner/listings");
  revalidatePath(`/listings/${listingId}`);
}
