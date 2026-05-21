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
  revalidatePath("/");
  revalidatePath("/cars");
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

  // Update status to rejected and persist the reason for the owner to see
  const { error } = await adminClient
    .from("listings")
    .update({ status: "rejected", admin_rejection_reason: reason.trim() })
    .eq("id", listingId);

  if (error) {
    return { error: "Failed to reject listing: " + error.message };
  }

  revalidatePath("/admin/listings");
  return { success: true, reason };
}

export async function suspendListing(listingId: string, reason: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  if (!reason || reason.trim().length === 0) {
    return { error: "A suspension reason is required" };
  }

  // Verify listing exists and is in an active state
  const { data: listing, error: fetchError } = await adminClient
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) {
    return { error: "Listing not found" };
  }

  if (listing.status === "suspended") {
    return { error: "Listing is already suspended" };
  }

  const { error } = await adminClient
    .from("listings")
    .update({ status: "suspended", admin_rejection_reason: reason.trim() })
    .eq("id", listingId);

  if (error) {
    return { error: "Failed to suspend listing: " + error.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/");
  revalidatePath("/cars");
  return { success: true };
}

export async function saveAdminNotes(listingId: string, notes: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("listings")
    .update({ admin_notes: notes.trim() || null })
    .eq("id", listingId);

  if (error) {
    return { error: "Failed to save admin notes: " + error.message };
  }

  revalidatePath("/admin/listings");
  return { success: true };
}

export async function approvePriceChange(pendingChangeId: string, listingId: string, listingType: string, proposedTerms: Record<string, unknown>) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const table = listingType === "rent" ? "rental_terms" : "sale_terms";
  
  // 1. Update active terms
  const { error: updateError } = await adminClient
    .from(table)
    .update(proposedTerms)
    .eq("listing_id", listingId);

  if (updateError) {
    return { error: `Failed to update active ${table}: ` + updateError.message };
  }

  // 2. Mark pending change as approved
  const { error: statusError } = await adminClient
    .from("pending_price_changes")
    .update({ status: "approved" })
    .eq("id", pendingChangeId);

  if (statusError) {
    return { error: "Failed to update pending change status: " + statusError.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/");
  revalidatePath(`/cars/${listingId}`);
  revalidatePath(`/properties/${listingId}`);
  return { success: true };
}

export async function rejectPriceChange(pendingChangeId: string, reason: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  if (!reason || reason.trim().length === 0) {
    return { error: "A rejection reason is required" };
  }

  const { error } = await adminClient
    .from("pending_price_changes")
    .update({ status: "rejected", admin_feedback: reason.trim() })
    .eq("id", pendingChangeId);

  if (error) {
    return { error: "Failed to reject price change: " + error.message };
  }

  revalidatePath("/admin/listings");
  return { success: true, reason };
}
