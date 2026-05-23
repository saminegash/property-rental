import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Listings Data
  const { data: listings } = await supabase
    .from("listings")
    .select("id, status, category")
    .eq("owner_id", user.id);

  const totalListings = listings?.length || 0;
  const publishedListings = listings?.filter(l => l.status === "published").length || 0;
  const pendingListings = listings?.filter(l => l.status === "pending_review").length || 0;
  const rejectedListings = listings?.filter(l => l.status === "rejected").length || 0;

  // 2. Fetch Requests Data
  // To get requests for this owner, we need to join through listings
  // The policy "Owners can view requests assigned to them" restricts visibility,
  // but to count *all* requests we might need a custom query or RPC. 
  // For now we rely on what RLS allows the owner to see.
  const { data: requests } = await supabase
    .from("rental_requests")
    .select("id, status, listing_id");

  // Since RLS only returns requests for their listings, this count is accurate to what they have access to
  const totalRequests = requests?.length || 0;
  const activeRentals = requests?.filter(r => r.status === "active" || r.status === "confirmed").length || 0;

  // 3. Fetch Recent Activity (Limit 3)
  const { data: recentActivity } = await supabase
    .from("listings")
    .select("id, title, category, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Dashboard Overview</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Welcome back. Here is what&apos;s happening with your account today.</p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Total Listings</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalListings}</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--color-success-text)", backgroundColor: "var(--color-success-bg)", padding: "0.125rem 0.5rem", borderRadius: "10px" }}>{publishedListings} Published</span>
            {pendingListings > 0 && <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "0.125rem 0.5rem", borderRadius: "10px" }}>{pendingListings} Pending</span>}
            {rejectedListings > 0 && <span style={{ color: "var(--color-danger)", backgroundColor: "#fee2e2", padding: "0.125rem 0.5rem", borderRadius: "10px" }}>{rejectedListings} Rejected</span>}
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Total Requests</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalRequests}</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.125rem 0.5rem", borderRadius: "10px" }}>{activeRentals} Active Deals</span>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Estimated Earnings</h3>
            <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>Planned</span>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>0 <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>ETB</span></p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>Earnings tracking coming soon.</p>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Commission Paid</h3>
            <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>Planned</span>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>0 <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)" }}>ETB</span></p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>Commission history coming soon.</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)" }}>Recent Listings</h2>
            <Link href="/dashboard/owner/cars" style={{ fontSize: "0.875rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>View All</Link>
          </div>

          {!recentActivity || recentActivity.length === 0 ? (
            <div className="dashboard-card" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)" }}>No listings found. Start by adding a car or property.</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
                <Link href="/dashboard/owner/cars/new" className="auth-button">Add Car</Link>
                <Link href="/dashboard/owner/properties/new" className="auth-button auth-button--secondary">Add Property</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentActivity.map((listing) => (
                <div key={listing.id} className="dashboard-card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, padding: "0.125rem 0.375rem", borderRadius: "4px", backgroundColor: listing.category === "vehicle" ? "var(--color-primary-light)" : "var(--color-surface-hover)", color: listing.category === "vehicle" ? "var(--color-primary)" : "var(--color-text-heading)" }}>
                        {listing.category}
                      </span>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-heading)" }}>
                        {listing.title || "Untitled"}
                      </h3>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Added {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ 
                      fontSize: "0.75rem", 
                      fontWeight: 600, 
                      textTransform: "uppercase", 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "9999px",
                      backgroundColor: listing.status === 'published' ? 'var(--color-success-bg)' : 'var(--color-surface-hover)',
                      color: listing.status === 'published' ? 'var(--color-success-text)' : 'var(--color-text-muted)'
                    }}>
                      {listing.status.replace('_', ' ')}
                    </span>
                    <Link 
                      href={`/dashboard/owner/${listing.category === "vehicle" ? "cars" : "properties"}/${listing.id}/edit`}
                      className="auth-button auth-button--secondary"
                      style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
