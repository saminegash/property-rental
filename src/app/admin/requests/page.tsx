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

  // Batch fetch commissions
  const requestIds = requests.map((r) => r.id);
  const { data: commissions } = await adminClient
    .from("commissions")
    .select("id, rental_request_id, commission_base_amount, commission_amount, commission_status, rental_days")
    .in("rental_request_id", requestIds);

  // Batch fetch rental terms
  const { data: rentalTerms } = await adminClient
    .from("rental_terms")
    .select("listing_id, security_deposit_amount")
    .in("listing_id", listingIds);

  // Batch fetch security deposits
  const { data: securityDeposits } = await adminClient
    .from("security_deposits")
    .select("id, rental_request_id, deposit_amount, deposit_status, payment_method, admin_notes")
    .in("rental_request_id", requestIds);

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

    const commission = commissions?.find((c) => c.rental_request_id === request.id) || null;
    const rentalTerm = rentalTerms?.find((t) => t.listing_id === request.listing_id) || null;
    const securityDeposit = securityDeposits?.find((d) => d.rental_request_id === request.id) || null;

    return {
      ...request,
      listing,
      owner: ownerProfile,
      renterProfile,
      commission,
      rentalTerm,
      securityDeposit,
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
