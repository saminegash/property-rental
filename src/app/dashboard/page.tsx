export const dynamic = "force-dynamic";

/**
 * Dashboard landing page.
 *
 * In a future task, this will redirect to role-specific dashboards
 * (owner, renter, admin) based on the user's profile role.
 */
export default async function DashboardPage() {
  return (
    <div className="dashboard-card">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <p className="dashboard-hint">
        Role-specific features (owner, renter, admin) will appear here in a future task.
      </p>
    </div>
  );
}
