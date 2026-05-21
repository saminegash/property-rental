import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerEarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Owner's Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title")
    .eq("owner_id", user.id);

  const listingIds = listings?.map((l) => l.id) || [];

  // 2. Fetch Rental Requests for those listings
  const { data: rentalRequests } = await supabase
    .from("rental_requests")
    .select("id, status, listing_id")
    .in("listing_id", listingIds);

  const requestIds = rentalRequests?.map((r) => r.id) || [];

  // 3. Fetch Commissions for those requests
  const { data: commissions } = await supabase
    .from("commissions")
    .select("id, rental_request_id, commission_base_amount, commission_amount, commission_status, created_at")
    .in("rental_request_id", requestIds)
    .order("created_at", { ascending: false });

  // 4. Calculate Earnings Metrics
  const completedRequests = rentalRequests?.filter(r => r.status === "completed") || [];
  const completedRequestIds = completedRequests.map(r => r.id);

  // We consider "Gross Earnings" as the sum of commission_base_amount for completed rentals
  // Platform Commission is the sum of commission_amount for completed rentals
  const completedCommissions = commissions?.filter(c => completedRequestIds.includes(c.rental_request_id)) || [];
  
  const totalGrossEarnings = completedCommissions.reduce((sum, c) => sum + (c.commission_base_amount || 0), 0);
  const totalPlatformCommission = completedCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const netEarnings = totalGrossEarnings - totalPlatformCommission;
  
  const totalCompletedDeals = completedRequests.length;

  const pendingCommissions = commissions?.filter(c => c.commission_status === "pending") || [];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Earnings Overview</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Track your gross earnings, commission payments, and finalized net payouts.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Net Earnings</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-success-text)", lineHeight: 1 }}>{formatCurrency(netEarnings)}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Your finalized take-home pay.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Gross Earnings</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{formatCurrency(totalGrossEarnings)}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Total revenue from completed deals.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Platform Commission</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{formatCurrency(totalPlatformCommission)}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            5% deducted from gross rental price.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Completed Deals</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalCompletedDeals}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Successfully finalized rentals.
          </div>
        </div>
      </div>

      {/* Pending Transactions Section */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1.5rem" }}>Pending Commission & Payouts</h2>
        
        {pendingCommissions.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <p className="dashboard-hint">You have no pending commissions or unfinalized payouts. Great job!</p>
          </div>
        ) : (
          <div className="dashboard-card" style={{ padding: "0" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--color-text-muted)" }}>Date</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--color-text-muted)" }}>Request ID</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--color-text-muted)" }}>Base Amount</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--color-text-muted)" }}>Commission (5%)</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--color-text-muted)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCommissions.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--color-surface-hover)" }}>
                      <td style={{ padding: "1rem", color: "var(--color-text)" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "1rem", color: "var(--color-text)" }}>
                        <Link href={`/dashboard/owner/requests`} className="text-primary hover:underline">
                          {c.rental_request_id.split('-')[0]}...
                        </Link>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "var(--color-text)" }}>
                        {formatCurrency(c.commission_base_amount)}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "var(--color-text)" }}>
                        {formatCurrency(c.commission_amount)}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 500 }}>
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
