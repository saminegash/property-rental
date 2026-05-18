"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = await hasRole(user.id, "admin");
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function updateRequestStatus(requestId: string, newStatus: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateRequestAdminNotes(requestId: string, notes: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ admin_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateRequestOwnerNotes(requestId: string, notes: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ owner_response_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}
