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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");
  
  const isAdmin = await hasRole(user.id, "admin");
  if (!isAdmin) throw new Error("Unauthorized: Admin only");
  
  return user;
}

export async function updateOwnerStatus(ownerProfileId: string, status: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("owner_profiles")
    .update({ verification_status: status })
    .eq("id", ownerProfileId);

  if (error) {
    return { error: "Failed to update status: " + error.message };
  }

  revalidatePath("/admin/owners");
  return { success: true };
}

export async function updateAdminNotes(ownerProfileId: string, notes: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("owner_profiles")
    .update({ admin_notes: notes })
    .eq("id", ownerProfileId);

  if (error) {
    return { error: "Failed to update notes: " + error.message };
  }

  revalidatePath("/admin/owners");
  return { success: true };
}
