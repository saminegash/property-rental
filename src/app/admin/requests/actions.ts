"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateRequestStatus(formData: FormData) {
  const requestId = formData.get("request_id") as string;
  const status = formData.get("status") as string;
  const adminNotes = formData.get("admin_notes") as string | null;

  if (!requestId || !status) {
    throw new Error("Request ID and status are required.");
  }

  const adminClient = createAdminClient();

  const updateData: any = { status };
  if (adminNotes !== null) {
    updateData.admin_notes = adminNotes;
  }

  const { error } = await adminClient
    .from("requests")
    .update(updateData)
    .eq("id", requestId);

  if (error) {
    throw new Error("Failed to update request: " + error.message);
  }

  revalidatePath("/admin/requests");
}
