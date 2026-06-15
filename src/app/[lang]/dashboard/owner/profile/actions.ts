"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requestOwnerVerification() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to request verification." };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("owner_profiles")
    .upsert(
      { user_id: user.id, verification_status: "pending" },
      { onConflict: "user_id" }
    );

  if (error) {
    return { error: "Failed to submit verification request. Please try again." };
  }

  return { success: true };
}
