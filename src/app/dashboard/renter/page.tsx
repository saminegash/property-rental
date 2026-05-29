import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RenterDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch request counts for summary
  const { data: requests } = await supabase
    .from("requests")
    .select("id, status")
    .eq("user_id", user.id);

  const totalRequests = requests?.length || 0;
  const activeRequests =
    requests?.filter((r) =>
      ["confirmed", "active"].includes(r.status)
    ).length || 0;
  const pendingRequests =
    requests?.filter((r) =>
      ["new_request", "admin_reviewing", "owner_contacted", "renter_contacted", "awaiting_payment"].includes(r.status)
    ).length || 0;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dashboard-title">Welcome back!</h1>
        <p className="dashboard-hint">
          Browse available properties and manage your requests.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="dashboard-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)" }}>
            {totalRequests}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Total Requests
          </div>
        </div>
        <div className="dashboard-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#059669" }}>
            {activeRequests}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Active Rentals
          </div>
        </div>
        <div className="dashboard-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d97706" }}>
            {pendingRequests}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Pending
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Link
          href="/dashboard/renter/requests"
          style={{
            display: "block",
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            backgroundColor: "var(--color-surface)",
            transition: "border-color 0.15s ease",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            My Requests
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Track the status of your rental requests.
          </p>
        </Link>

        <Link
          href="/properties"
          style={{
            display: "block",
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            backgroundColor: "var(--color-surface)",
            transition: "border-color 0.15s ease",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            Browse Properties
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Find a property that fits your needs.
          </p>
        </Link>

        <Link
          href="/dashboard/become-owner"
          style={{
            display: "block",
            padding: "1.5rem",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            backgroundColor: "var(--color-bg)",
            transition: "border-color 0.15s ease",
            gridColumn: "1 / -1",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            🏠 Become an Owner
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Have a property? List it on our platform and start earning.
          </p>
        </Link>
      </div>
    </div>
  );
}
