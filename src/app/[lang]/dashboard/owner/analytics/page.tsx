import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerAnalyticsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  // 1. Fetch Owner's Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, property_type, listing_type, status")
    .eq("owner_id", user.id);

  const listingIds = listings?.map((l) => l.id) || [];

  const totalListings = listings?.length || 0;
  const publishedListings = listings?.filter(l => l.status === "published").length || 0;
  const pendingReviewListings = listings?.filter(l => l.status === "pending_review").length || 0;
  const rejectedListings = listings?.filter(l => l.status === "rejected").length || 0;

  // 2. Fetch Requests for those listings
  const { data: allRequests } = await supabase
    .from("requests")
    .select("id, status, name, listing_id, created_at")
    .in("listing_id", listingIds);

  const totalRequests = allRequests?.length || 0;
  
  // Aggregate Requests by Status
  const requestStatusCounts = (allRequests || []).reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedRentals = allRequests?.filter(r => r.status === "completed").length || 0;

  const pendingPriceChangesCount = 0;

  // Analytics views are disabled in new schema
  const totalViews = 0;
  const conversionRate = "0";

  // 5. Find Top Performing Listing
  let topListingId: string | null = null;
  let topListingRequestCount = 0;

  if (allRequests && allRequests.length > 0) {
    const requestCounts: Record<string, number> = {};
    allRequests.forEach(req => {
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
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Analytics & Insights</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
            Monitor your listing performance and discover what drives the most requests.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Listing Status
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <StatCard title="Total Listings" count={totalListings} description="All your marketplace entries." />
        <StatCard title="Published" count={publishedListings} description="Live to the public." />
        <StatCard title="Pending Review" count={pendingReviewListings} description="Waiting for admin approval." highlight={pendingReviewListings > 0} />
        <StatCard title="Pending Price Changes" count={pendingPriceChangesCount} description="Price updates in review." highlight={pendingPriceChangesCount > 0} />
        {rejectedListings > 0 && (
          <StatCard title="Rejected" count={rejectedListings} description="Requires your attention." error={true} />
        )}
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Request Performance
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Listing Views</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalViews}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Total page views across all listings.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Total Inquiries</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{totalRequests}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Combines rentals, sales, and general inquiries.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Conversion Rate</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>{conversionRate}%</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Inquiries per listing view.
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Completed Deals</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-success-text)", lineHeight: 1 }}>{completedRentals}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Successfully closed requests.
          </div>
        </div>

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
                <Link href={`/${lang}/dashboard/owner/listings/${topListing.id}/edit`} className="text-primary hover:underline">
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

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Requests by Status</h3>
          {Object.keys(requestStatusCounts).length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginTop: "0.5rem" }}>No requests yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginTop: "0.75rem" }}>
              {Object.entries(requestStatusCounts).map(([status, count]) => (
                <div key={status} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--color-text-muted)", textTransform: "capitalize" }}>{status.replace(/_/g, ' ')}</span>
                  <span style={{ fontWeight: 600, color: "var(--color-text-heading)" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Future Tracking & Insights
      </h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        We are continually expanding our analytics capabilities. The following metrics are on our roadmap.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {/* Planned Data: Favorite Count */}
        <FutureMetricCard 
          title="Favorite Saves" 
          description="How many users saved your listing for later."
        />

        {/* Planned Data: Contact Click Count */}
        <FutureMetricCard 
          title="Contact Clicks" 
          description="Times users clicked to view your phone number."
        />
      </div>
    </div>
  );
}

function StatCard({ title, count, description, highlight, error }: { title: string, count: number, description: string, highlight?: boolean, error?: boolean }) {
  const bgColor = error ? "#fef2f2" : highlight ? "#fffbeb" : "var(--color-surface)";
  const borderColor = error ? "#f87171" : highlight ? "#fcd34d" : "var(--color-border)";

  return (
    <div style={{
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
    }}>
      <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1 }}>{count}</p>
      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
        {description}
      </div>
    </div>
  );
}

function FutureMetricCard({ title, description, unit = "-" }: { title: string, description: string, unit?: string }) {
  return (
    <div className="dashboard-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{title}</h3>
        <span style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>Coming Soon</span>
      </div>
      <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-heading)", lineHeight: 1, opacity: 0.3 }}>{unit}</p>
      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
        {description}
      </div>
    </div>
  );
}
