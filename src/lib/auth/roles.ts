import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Checks if a specific user has a specific role.
 *
 * This function uses the service-role admin client to bypass RLS,
 * allowing it to securely query the `roles` and `user_roles` tables
 * without exposing the service-role key to the client.
 */
export async function hasRole(userId: string, roleName: 'user' | 'owner' | 'admin'): Promise<boolean> {
  const adminClient = createAdminClient();

  const { data: userRole } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", roleName)
    .maybeSingle();

  return !!userRole;
}
