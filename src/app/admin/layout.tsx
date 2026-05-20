import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "../(auth)/actions";

export const dynamic = "force-dynamic";

/**
 * Admin Layout Guard
 *
 * This layout wraps all `/admin` routes. It ensures that only authenticated users
 * with the "admin" role can access these pages.
 * Role verification is performed securely on the server side using the admin client.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Must be authenticated
  if (!user) {
    redirect("/login");
  }

  // 2. Must have the 'admin' role
  const isUserAdmin = await hasRole(user.id, "admin");
  if (!isUserAdmin) {
    // Redirect non-admins back to the regular dashboard
    redirect("/dashboard");
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header" style={{ borderBottomColor: "var(--color-primary)" }}>
        <div className="dashboard-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" className="dashboard-logo">
              MyEthioProperties
            </Link>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", padding: "0.25rem 0.5rem", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "var(--radius-sm)" }}>
              ADMIN PANEL
            </span>
          </div>

          <div className="dashboard-user-nav">
            <span className="dashboard-user-email">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="dashboard-logout-btn">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
