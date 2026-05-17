import Link from "next/link";

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
      
      <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
        <h2 className="dashboard-title" style={{ fontSize: "1.125rem" }}>Want to list your car?</h2>
        <p className="dashboard-hint" style={{ marginBottom: "1rem" }}>
          Become an owner to start earning from your vehicle.
        </p>
        <Link 
          href="/dashboard/become-owner" 
          className="auth-button" 
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          Become an Owner
        </Link>
      </div>
    </div>
  );
}
