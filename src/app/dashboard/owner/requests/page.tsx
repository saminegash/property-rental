import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type CombinedRequest = {
  id: string;
  status: string;
  message?: string | null;
  admin_notes?: string | null;
  created_at: string;
  listing: { title: string } | { title: string }[];
  __type: 'rental' | 'listing';
  
  // Rental fields
  renter_name?: string;
  renter_phone?: string;
  renter_email?: string | null;
  start_date?: string;
  end_date?: string;
  needs_driver?: boolean;
  needs_delivery?: boolean;
  delivery_location?: string | null;

  // Listing fields
  request_type?: string;
  requester_name?: string;
  requester_phone?: string;
  requester_email?: string | null;
  preferred_viewing_date?: string | null;
  budget_amount?: number | null;
};

export default async function OwnerRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch rental requests.
  // Note: The RLS policy natively enforces:
  // 1. Only requests for listings owned by this user are returned.
  // 2. Requests with status 'new_request' or 'admin_reviewing' are hidden.
  const { data: rentalRequests, error: rentalError } = await supabase
    .from("rental_requests")
    .select(`
      id, status, renter_name, renter_phone, renter_email, start_date, end_date, needs_driver, needs_delivery, delivery_location, message, admin_notes, created_at,
      listing:listings (
        title
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch listing requests (general/sale inquiries)
  const { data: listingRequests, error: listingError } = await supabase
    .from("listing_requests")
    .select(`
      id, status, request_type, requester_name, requester_phone, requester_email, message, preferred_viewing_date, budget_amount, admin_notes, created_at,
      listing:listings (
        title
      )
    `)
    .order("created_at", { ascending: false });

  if (rentalError || listingError) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Requests & Inquiries</h1>
        <div className="auth-error">Error loading requests. Please try again later.</div>
      </div>
    );
  }

  // Combine and sort
  const combinedRequests = [
    ...(rentalRequests || []).map(r => ({ ...r, __type: 'rental' as const })),
    ...(listingRequests || []).map(r => ({ ...r, __type: 'listing' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>Requests & Inquiries</h1>
      </div>

      {combinedRequests.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            No Active Requests
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            Requests will appear here after admin review.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {combinedRequests.map((request: CombinedRequest) => {
            const listing = Array.isArray(request.listing) ? request.listing[0] : request.listing;
            
            return (
              <div 
                key={`${request.__type}-${request.id}`} 
                className="dashboard-card" 
                style={{ padding: "1.5rem", borderLeft: request.__type === 'rental' ? "4px solid var(--color-primary)" : "4px solid #10b981" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
                      {listing?.title || "Unknown Listing"}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                      {request.__type === 'rental' ? 'Rental Request' : `${formatStatus(request.request_type || 'general')} Inquiry`}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 600, 
                    textTransform: "uppercase", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "9999px",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-heading)",
                    border: "1px solid var(--color-border)",
                    height: "fit-content"
                  }}>
                    {formatStatus(request.status)}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Request Details</h4>
                    {request.__type === 'rental' ? (
                      <>
                        <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          <strong>Dates:</strong> {request.start_date && request.end_date ? `${new Date(request.start_date).toLocaleDateString()} to ${new Date(request.end_date).toLocaleDateString()}` : "N/A"}
                        </p>
                        <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          <strong>Driver:</strong> {request.needs_driver ? "Required" : "Self-Drive"}
                        </p>
                        <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                          <strong>Delivery:</strong> {request.needs_delivery ? `Yes (${request.delivery_location})` : "No (Pickup)"}
                        </p>
                      </>
                    ) : (
                      <>
                        {request.preferred_viewing_date && (
                          <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                            <strong>Preferred Date:</strong> {new Date(request.preferred_viewing_date).toLocaleDateString()}
                          </p>
                        )}
                        {request.budget_amount != null && (
                          <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                            <strong>Budget:</strong> {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(request.budget_amount)}
                          </p>
                        )}
                      </>
                    )}
                    
                    {request.message && (
                      <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", fontStyle: "italic", backgroundColor: "var(--color-surface)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
                        &quot;{request.message}&quot;
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Contact Info</h4>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Name:</strong> {request.__type === 'rental' ? request.renter_name : request.requester_name}
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Phone:</strong> {request.__type === 'rental' ? request.renter_phone : request.requester_phone}
                    </p>
                    {(request.renter_email || request.requester_email) && (
                      <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        <strong>Email:</strong> {request.__type === 'rental' ? request.renter_email : request.requester_email}
                      </p>
                    )}
                  </div>
                </div>

                {request.admin_notes && (
                  <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Admin Notes (Visible to you)</h4>
                    <p style={{ fontSize: "0.875rem" }}>{request.admin_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
