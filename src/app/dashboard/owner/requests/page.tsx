import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const { data: requests, error } = await supabase
    .from("rental_requests")
    .select(`
      *,
      listing:listings (
        title
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Rental Requests</h1>
        <div className="auth-error">Error loading requests: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>Rental Requests</h1>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            No Active Requests
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            When an admin approves a request for one of your cars, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((request) => {
            // Because of the join, listing is an object or array of objects.
            const listing = Array.isArray(request.listing) ? request.listing[0] : request.listing;
            
            return (
              <div 
                key={request.id} 
                className="dashboard-card" 
                style={{ padding: "1.5rem" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)" }}>
                    {listing?.title || "Unknown Listing"}
                  </h3>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 600, 
                    textTransform: "uppercase", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "9999px",
                    backgroundColor: "var(--color-primary)",
                    color: "#fff"
                  }}>
                    {formatStatus(request.status)}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Rental Details</h4>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Dates:</strong> {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Driver:</strong> {request.needs_driver ? "Required" : "Self-Drive"}
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Delivery:</strong> {request.needs_delivery ? `Yes (${request.delivery_location})` : "No (Pickup)"}
                    </p>
                    {request.message && (
                      <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", fontStyle: "italic" }}>
                        <strong>Message:</strong> &quot;{request.message}&quot;
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-muted)" }}>Renter Info</h4>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Name:</strong> {request.renter_name}
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                      <strong>Phone:</strong> {request.renter_phone}
                    </p>
                    {request.renter_email && (
                      <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        <strong>Email:</strong> {request.renter_email}
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
