import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Dashboard landing page.
 * Auto-routes users to their role-specific dashboard:
 *   - admin → /[lang]/admin
 *   - owner → /[lang]/dashboard/owner
 *   - renter → /[lang]/dashboard/renter
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  // Check roles in priority order: admin > owner > renter
  const isAdmin = await hasRole(user.id, "admin");
  if (isAdmin) {
    redirect(`/${lang}/admin`);
  }

  const isOwner = await hasRole(user.id, "owner");
  if (isOwner) {
    redirect(`/${lang}/dashboard/owner`);
  }

  // Default: renter dashboard
  redirect(`/${lang}/dashboard/renter`);
}
