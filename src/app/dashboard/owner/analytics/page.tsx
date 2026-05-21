import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerAnalyticsPage() {
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
    .select("id, title, category, listing_type, status")
    .eq("owner_id", user.id);

  const listingIds = listings?.map((l) => l.id) || [];

  // 2. Fetch Rental Requests for those listings
  const { data: rentalRequests } = await supabase
    .from("rental_requests")
    .select("id, status, listing_id")
    .in("listing_id", listingIds);

  const totalRequests = rentalRequests?.length || 0;

  // 3. Find Top Performing Listing
  let topListingId: string | null = null;
  let topListingRequestCount = 0;

  if (rentalRequests && rentalRequests.length > 0) {
    const requestCounts: Record<string, number> = {};
    rentalRequests.forEach(req => {
      requestCounts[req.listing_id] = (requestCounts[req.listing_id] || 0) + 1;
    });

    for (const [id, count] of Object.entries(requestCounts)) {
      if (count > topListingRequestCount) {
        topListingRequestCount = count;
        topListingId = id;
      }
    }
  }

  const topListing = listings?.find(l => l.id === topListingId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Analytics</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Monitor your listing performance and discover what drives the most requests.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        
        {/* Real Data: Request Volume */}
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Total Requests</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalRequests}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Inquiries across all listings.
          </div>
        </div>

        {/* Real Data: Top Performing */}
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Top Listing</h3>
          {topListing ? (
            <>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.25rem" }}>
                {topListing.title}
              </p>
              <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "0.125rem 0.5rem", borderRadius: "10px" }}>
                  {topListingRequestCount} Requests
                </span>
                <Link href={`/dashboard/owner/${topListing.category === 'vehicle' ? 'cars' : 'properties'}/${topListing.id}/edit`} className="text-primary hover:underline">
                  View
                </Link>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginTop: "0.5rem" }}>
              No requests received yet.
            </p>
          )}
        </div>

        {/* Planned Data: Listing Views */}
        <div className="dashboard-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Listing Views</h3>
            <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>Coming Soon</span>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1, opacity: 0.5 }}>-</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            We&apos;re building tracking for public views.
          </div>
        </div>

        {/* Planned Data: Conversion Summary */}
        <div className="dashboard-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Conversion Rate</h3>
            <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>Coming Soon</span>
          </div>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1, opacity: 0.5 }}>%</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Percentage of views that turn into requests.
          </div>
        </div>
      </div>
    </div>
  );
}
