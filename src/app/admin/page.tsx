import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminClient = createAdminClient();

  // Execute all queries concurrently using Promise.all
  // We use `{ count: "exact", head: true }` to fetch only the counts for efficiency.
  const [
    { count: totalListings },
    { count: pendingListings },
    { count: pendingCars },
    { count: pendingProperties },
    { count: publishedListings },
    { count: pendingPriceChanges },
    { count: newRentalRequests },
    { count: activeDeals },
    { count: disputedRequests },
    { count: pendingOwnerVerifications },
    { count: pendingCommissions },
    { count: pendingSecurityDeposits },
  ] = await Promise.all([
    adminClient.from("listings").select("id", { count: "exact", head: true }),
    adminClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    adminClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review").eq("category", "vehicle"),
    adminClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review").eq("category", "property"),
    adminClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
    adminClient.from("pending_price_changes").select("id", { count: "exact", head: true }).eq("status", "pending"),
    adminClient.from("rental_requests").select("id", { count: "exact", head: true }).eq("status", "new_request"),
    adminClient.from("rental_requests").select("id", { count: "exact", head: true }).eq("status", "active"),
    adminClient.from("rental_requests").select("id", { count: "exact", head: true }).eq("status", "disputed"),
    adminClient.from("owner_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    adminClient.from("commissions").select("id", { count: "exact", head: true }).eq("commission_status", "pending"),
    adminClient.from("security_deposits").select("id", { count: "exact", head: true }).eq("deposit_status", "pending"),
  ]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: "0.5rem" }}>Admin Control Center</h1>
        <p className="dashboard-hint">
          Welcome to the marketplace operational dashboard. Monitor and manage all platform activity here.
        </p>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Platform Metrics
      </h2>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "1rem",
        marginBottom: "3rem" 
      }}>
        <MetricCard title="Total Listings" count={totalListings || 0} icon="📊" />
        <MetricCard title="Published Listings" count={publishedListings || 0} icon="✅" />
        
        <MetricCard title="Pending Listings" count={pendingListings || 0} icon="⏳" highlight={!!pendingListings} />
        <MetricCard title="Pending Cars" count={pendingCars || 0} icon="🚗" highlight={!!pendingCars} />
        <MetricCard title="Pending Properties" count={pendingProperties || 0} icon="🏢" highlight={!!pendingProperties} />
        <MetricCard title="Pending Price Changes" count={pendingPriceChanges || 0} icon="💰" highlight={!!pendingPriceChanges} />
        
        <MetricCard title="New Rental Requests" count={newRentalRequests || 0} icon="📫" highlight={!!newRentalRequests} />
        <MetricCard title="Active Rentals" count={activeDeals || 0} icon="🚀" />
        <MetricCard title="Disputed Requests" count={disputedRequests || 0} icon="🚨" highlight={!!disputedRequests} error />
        
        <MetricCard title="Pending Owners" count={pendingOwnerVerifications || 0} icon="👤" highlight={!!pendingOwnerVerifications} />
        <MetricCard title="Pending Commissions" count={pendingCommissions || 0} icon="💵" highlight={!!pendingCommissions} />
        <MetricCard title="Pending Deposits" count={pendingSecurityDeposits || 0} icon="🛡️" highlight={!!pendingSecurityDeposits} />
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Quick Actions
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        <ActionCard 
          href="/admin/listings" 
          title="Review Pending Listings & Pricing" 
          description="Approve new car and property listings, and review price updates."
        />
        <ActionCard 
          href="/admin/requests" 
          title="Manage Rental Requests" 
          description="Review new bookings, active rentals, disputes, and manage platform flow."
        />
        <ActionCard 
          href="/admin/owners" 
          title="Owner Management" 
          description="Review, approve, or suspend car and property owner profiles."
        />
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  count, 
  icon, 
  highlight = false,
  error = false 
}: { 
  title: string; 
  count: number; 
  icon: string; 
  highlight?: boolean;
  error?: boolean;
}) {
  const bgColor = error && count > 0 
    ? "#fef2f2" 
    : highlight && count > 0 
      ? "#fffbeb" 
      : "var(--color-bg)";
      
  const borderColor = error && count > 0 
    ? "#f87171" 
    : highlight && count > 0 
      ? "#fcd34d" 
      : "var(--color-border)";

  return (
    <div style={{
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      padding: "1.25rem",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      transition: "all 0.2s ease"
    }}>
      <div>
        <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-heading)" }}>
          {count}
        </div>
      </div>
      <div style={{ fontSize: "1.5rem" }}>
        {icon}
      </div>
    </div>
  );
}

function ActionCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: "block", 
        padding: "1.5rem", 
        border: "1px solid var(--color-border)", 
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        backgroundColor: "var(--color-surface)",
        textAlign: "left",
        transition: "all 0.15s ease",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
      className="admin-action-card"
    >
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
        {title} &rarr;
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
        {description}
      </p>
    </Link>
  );
}
