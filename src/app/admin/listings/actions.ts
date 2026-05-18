"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Validates that the current request is performed by an admin.
 */
async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const isAdmin = await hasRole(user.id, "admin");
  if (!isAdmin) throw new Error("Unauthorized: Admin only");

  return user;
}

export async function approveListing(listingId: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  // Verify listing exists and is pending_review
  const { data: listing, error: fetchError } = await adminClient
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) {
    return { error: "Listing not found" };
  }

  if (listing.status !== "pending_review") {
    return { error: "Only pending listings can be approved" };
  }

  const { error } = await adminClient
    .from("listings")
    .update({ status: "published" })
    .eq("id", listingId);

  if (error) {
    return { error: "Failed to approve listing: " + error.message };
  }

  revalidatePath("/admin/listings");
  return { success: true };
}

export async function rejectListing(listingId: string, reason: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  if (!reason || reason.trim().length === 0) {
    return { error: "A rejection reason is required" };
  }

  // Verify listing exists and is pending_review
  const { data: listing, error: fetchError } = await adminClient
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) {
    return { error: "Listing not found" };
  }

  if (listing.status !== "pending_review") {
    return { error: "Only pending listings can be rejected" };
  }

  // Update status to rejected
  // Note: We store rejection reason in the description field isn't ideal,
  // but there's no admin_notes column on listings yet. For MVP, we use
  // a separate approach — the admin can communicate via other channels.
  const { error } = await adminClient
    .from("listings")
    .update({ status: "rejected" })
    .eq("id", listingId);

  if (error) {
    return { error: "Failed to reject listing: " + error.message };
  }

  revalidatePath("/admin/listings");
  return { success: true, reason };
}
