import { createAdminClient } from "@/lib/supabase/admin";
import RequestReviewCard from "./RequestReviewCard";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const adminClient = createAdminClient();

  // Fetch all rental requests
  const { data: requests, error: requestsError } = await adminClient
    .from("rental_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (requestsError || !requests) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Rental Requests</h1>
        <div className="auth-error">
          Error loading requests: {requestsError?.message}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 className="dashboard-title" style={{ marginBottom: "2rem" }}>
          Rental Requests
        </h1>
        <div className="dashboard-card">
          <p className="dashboard-hint">
            No rental requests yet.
          </p>
        </div>
      </div>
    );
  }

  // Get all listing IDs to fetch listings
  const listingIds = [...new Set(requests.map((r) => r.listing_id))];

  // Fetch listings (just title and owner_id)
  const { data: listings } = await adminClient
    .from("listings")
    .select("id, title, owner_id")
    .in("id", listingIds);

  // Get all related user IDs (owners and renters)
  const userIds = new Set<string>();
  listings?.forEach((l) => userIds.add(l.owner_id));
  requests.forEach((r) => {
    if (r.renter_id) userIds.add(r.renter_id);
  });

  // Batch fetch profiles
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("user_id, full_name, email, phone")
    .in("user_id", Array.from(userIds));

  // Build enriched request objects
  const enrichedRequests = requests.map((request) => {
    const listing = listings?.find((l) => l.id === request.listing_id) || {
      title: "Unknown Listing",
      owner_id: "",
    };

    const ownerProfile = profiles?.find((p) => p.user_id === listing.owner_id) || null;
    const renterProfile = request.renter_id
      ? profiles?.find((p) => p.user_id === request.renter_id) || null
      : null;

    return {
      ...request,
      listing,
      owner: ownerProfile,
      renterProfile,
    };
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>
          Rental Requests
        </h1>
        <span className="status-badge status-badge--pending">
          {requests.length} total
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {enrichedRequests.map((request) => (
          <RequestReviewCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
