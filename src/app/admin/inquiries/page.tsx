import { createAdminClient } from "@/lib/supabase/admin";
import InquiryReviewCard from "./InquiryReviewCard";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const adminClient = createAdminClient();

  // Fetch all listing requests
  const { data: requests, error: requestsError } = await adminClient
    .from("listing_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (requestsError || !requests) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Listing Inquiries</h1>
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
          Listing Inquiries
        </h1>
        <div className="dashboard-card">
          <p className="dashboard-hint">
            No inquiries yet.
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

  // Get all related user IDs (owners and requesters)
  const userIds = new Set<string>();
  listings?.forEach((l) => userIds.add(l.owner_id));
  requests.forEach((r) => {
    if (r.requester_id) userIds.add(r.requester_id);
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
    const requesterProfile = request.requester_id
      ? profiles?.find((p) => p.user_id === request.requester_id) || null
      : null;

    return {
      ...request,
      listing,
      owner: ownerProfile,
      requesterProfile,
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
          Listing Inquiries
        </h1>
        <span className="status-badge status-badge--pending">
          {requests.length} total
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {enrichedRequests.map((request) => (
          <InquiryReviewCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
