import { createClient } from "@/lib/supabase/server";
import { ensureProfileExists } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth: redirect if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Ensure profile exists (fallback for DB trigger)
  await ensureProfileExists(user);

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link href="/dashboard" className="dashboard-logo">
            CarMarket
          </Link>
          
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
