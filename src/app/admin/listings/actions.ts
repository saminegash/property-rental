"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateListingStatus(formData: FormData) {
  const listingId = formData.get("listing_id") as string;
  const status = formData.get("status") as string;
  const adminNotes = formData.get("admin_notes") as string | null;

  if (!listingId || !status) {
    throw new Error("Listing ID and status are required.");
  }

  const adminClient = createAdminClient();

  const updateData: any = { status };
  if (adminNotes !== null) {
    updateData.admin_notes = adminNotes;
  }

  const { error } = await adminClient
    .from("listings")
    .update(updateData)
    .eq("id", listingId);

  if (error) {
    throw new Error("Failed to update listing: " + error.message);
  }

  revalidatePath("/admin/listings");
}
