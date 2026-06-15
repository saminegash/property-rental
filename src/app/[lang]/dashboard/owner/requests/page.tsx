import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type CombinedRequest = {
  id: string;
  status: string;
  message?: string | null;
  admin_notes?: string | null;
  created_at: string;
  listing: { title: string } | { title: string }[];
  request_type: string;

  // Renter / Requester fields
  name: string;
  phone: string;
  email?: string | null;

  // Rental specific fields
  start_date?: string | null;
  end_date?: string | null;

  // Sale/General fields
  offered_price?: number | null;
};

export default async function OwnerRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch requests.
  // Note: The RLS policy natively enforces:
  // 1. Only requests for listings owned by this user are returned.
  // 2. Requests with status 'new' or 'admin_reviewing' are hidden.
  const { data: combinedRequests, error } = await supabase
    .from("requests")
    .select(
      `
      id, status, request_type, name, phone, email,
      start_date, end_date, offered_price, message, admin_notes, created_at,
      listing:listings (
        title
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Requests & Inquiries</h1>
        <div className="auth-error">
          Error loading requests. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>
          Requests & Inquiries
        </h1>
      </div>

      {combinedRequests.length === 0 ? (
        <div
          className="dashboard-card"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              color: "var(--color-text-heading)",
              marginBottom: "0.5rem",
            }}
          >
            No Active Requests
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            Requests will appear here after admin review.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {combinedRequests?.map((request: CombinedRequest) => {
            const listing = Array.isArray(request.listing)
              ? request.listing[0]
              : request.listing;

            return (
              <div
                key={`${request.request_type}-${request.id}`}
                className="dashboard-card"
                style={{
                  padding: "1.5rem",
                  borderLeft:
                    request.request_type === "rental"
                      ? "4px solid var(--color-primary)"
                      : "4px solid #10b981",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "var(--color-text-heading)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {listing?.title || "Unknown Listing"}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {request.request_type === "rental"
                        ? "Rental Request"
                        : `${formatStatus(request.request_type || "general")} Inquiry`}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-heading)",
                      border: "1px solid var(--color-border)",
                      height: "fit-content",
                    }}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Request Details
                    </h4>
                    {request.request_type === "rental" ? (
                      <>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <strong>Dates:</strong>{" "}
                          {request.start_date && request.end_date
                            ? `${new Date(request.start_date).toLocaleDateString()} to ${new Date(request.end_date).toLocaleDateString()}`
                            : "N/A"}
                        </p>
                      </>
                    ) : (
                      <>
                        {request.offered_price != null && (
                          <p
                            style={{
                              fontSize: "0.875rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <strong>Offered Price:</strong>{" "}
                            {formatCurrency(request.offered_price)}
                          </p>
                        )}
                      </>
                    )}

                    {request.message && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                          fontStyle: "italic",
                          backgroundColor: "var(--color-surface)",
                          padding: "0.5rem",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        &quot;{request.message}&quot;
                      </p>
                    )}
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Contact Info
                    </h4>
                    <p
                      style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
                    >
                      <strong>Name:</strong> {request.name}
                    </p>
                    <p
                      style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}
                    >
                      <strong>Phone:</strong> {request.phone}
                    </p>
                    {request.email && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <strong>Email:</strong> {request.email}
                      </p>
                    )}
                  </div>
                </div>

                {request.admin_notes && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Admin Notes (Visible to you)
                    </h4>
                    <p style={{ fontSize: "0.875rem" }}>
                      {request.admin_notes}
                    </p>
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
