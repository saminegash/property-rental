import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures a user's profile and initial roles exist.
 *
 * This acts as a robust server-side fallback to the Postgres `handle_new_user`
 * trigger. If the trigger fails or the user was imported, this ensures the
 * user has a profile before accessing the application.
 */
export async function ensureProfileExists(user: User) {
  const adminClient = createAdminClient();

  // 1. Check if profile exists
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return; // Profile already exists
  }

  // 2. Profile is missing, attempt to create it.
  // We use try/catch to gracefully handle race conditions where the database
  // trigger might have created it milliseconds before this insert.
  try {
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
    });

    if (profileError && profileError.code !== '23505') {
      // 23505 is PostgreSQL unique violation (duplicate key)
      console.error("Error creating fallback profile:", profileError);
      return;
    }

    // 3. Assign Role (Default to renter, allow owner if specified in metadata)
    const requestedRole = user.user_metadata?.role;
    const roleName = requestedRole === "owner" ? "owner" : "renter";

    const { data: roleData } = await adminClient
      .from("roles")
      .select("id")
      .eq("role_name", roleName)
      .single();

    if (roleData) {
      await adminClient.from("user_roles").insert({
        user_id: user.id,
        role_id: roleData.id,
      });
    }
  } catch (error) {
    console.error("Unexpected error in ensureProfileExists:", error);
  }
}
