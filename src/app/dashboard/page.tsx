import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Dashboard landing page.
 * Auto-routes users to their role-specific dashboard:
 *   - admin → /admin
 *   - owner → /dashboard/owner
 *   - renter → /dashboard/renter
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check roles in priority order: admin > owner > renter
  const isAdmin = await hasRole(user.id, "admin");
  if (isAdmin) {
    redirect("/admin");
  }

  const isOwner = await hasRole(user.id, "owner");
  if (isOwner) {
    redirect("/dashboard/owner");
  }

  // Default: renter dashboard
  redirect("/dashboard/renter");
}
