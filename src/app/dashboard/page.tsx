import { createClient } from "@/lib/supabase/server";
import { logout } from "../(auth)/actions";

export const dynamic = "force-dynamic";

/**
 * Dashboard landing page.
 *
 * Shows the authenticated user's email and a logout button.
 * In a future task, this will redirect to role-specific dashboards
 * (owner, renter, admin) based on the user's profile role.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-welcome">
          Welcome, <strong>{user?.email ?? "User"}</strong>
        </p>
        <p className="dashboard-hint">
          You are logged in. Role-specific dashboards will be added in a future
          task.
        </p>
        <form action={logout}>
          <button type="submit" className="auth-button auth-button--secondary">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
