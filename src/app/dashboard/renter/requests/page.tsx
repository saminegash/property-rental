import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Requests — MyEthioProperties",
  description: "Track your property and car rental requests and their current status.",
};

type RequestWithListing = {
  id: string;
  listing_id: string;
  name: string;
  phone: string;
  email: string | null;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
  listing: { title: string; location: string | null; property_type: string | null } | null;
  request_type: string;
  offered_price: number | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  new_request: {
    label: "Submitted",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    desc: "Your request was received. Our team is reviewing it.",
  },
  admin_reviewing: {
    label: "Under Review",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Our admin team is reviewing your request.",
  },
  owner_contacted: {
    label: "Owner Contacted",
    color: "#0284c7",
    bg: "#e0f2fe",
    border: "#bae6fd",
    desc: "We have reached out to the owner for availability.",
  },
  owner_available: {
    label: "Owner Available",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    desc: "The owner has confirmed availability. Finalizing details.",
  },
  owner_unavailable: {
    label: "Owner Unavailable",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    desc: "The listing was unavailable for your selected dates.",
  },
  renter_contacted: {
    label: "We'll Contact You",
    color: "#0284c7",
    bg: "#e0f2fe",
    border: "#bae6fd",
    desc: "Our team will contact you shortly to finalize details.",
  },
  requester_contacted: {
    label: "We'll Contact You",
    color: "#0284c7",
    bg: "#e0f2fe",
    border: "#bae6fd",
    desc: "Our team will contact you shortly to finalize details.",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Please complete payment to confirm your booking.",
  },
  confirmed: {
    label: "Confirmed",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Your rental is confirmed! Check admin notes for pickup details.",
  },
  active: {
    label: "Active",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Your rental is currently active.",
  },
  completed: {
    label: "Completed",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    desc: "This rental has been completed.",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    desc: "This rental request was cancelled.",
  },
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    desc: "This request was not approved.",
  },
};

function formatDate(d: string | null) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RenterRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: allRequests, error } = await supabase
    .from("requests")
    .select(`
      id, listing_id, name, phone, email,
      start_date, end_date, message, status, created_at,
      request_type, offered_price,
      listing:listings ( title, location, property_type )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">My Requests</h1>
        <div className="auth-error">Error loading requests: {error?.message}</div>
      </div>
    );
  }

  const typedRequests = (allRequests || []) as unknown as RequestWithListing[];

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>
            My Requests
          </h1>
          <p className="dashboard-hint" style={{ margin: 0 }}>
            Track the status of all your rental and sale inquiries.
          </p>
        </div>
        <Link
          href="/properties"
          className="auth-button auth-button--secondary"
          style={{ textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Browse Listings
        </Link>
      </div>

      {typedRequests.length === 0 ? (
        <div
          className="dashboard-card"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
          <h2
            style={{
              fontSize: "1.25rem",
              color: "var(--color-text-heading)",
              marginBottom: "0.5rem",
            }}
          >
            No requests yet
          </h2>
          <p
            className="dashboard-hint"
            style={{ marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}
          >
            Browse available properties and submit a request to get started.
          </p>
          <Link href="/properties" className="auth-button" style={{ textDecoration: "none" }}>
            Browse Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {typedRequests.map((request) => {
            const listing = Array.isArray(request.listing)
              ? request.listing[0]
              : request.listing;
            const statusCfg =
              STATUS_CONFIG[request.status] ?? STATUS_CONFIG["new_request"];

            return (
              <div key={request.id} className="dashboard-card" style={{ padding: "1.5rem" }}>
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--color-text-heading)",
                        marginBottom: "0.125rem",
                      }}
                    >
                      {listing?.title || "Listing"}
                    </h3>
                    {listing?.location && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        📍 {listing.location}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                      color: statusCfg.color,
                      backgroundColor: statusCfg.bg,
                      border: `1px solid ${statusCfg.border}`,
                    }}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                {/* Status description */}
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                    color: statusCfg.color,
                  }}
                >
                  {statusCfg.desc}
                </div>

                {/* Details grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem 2rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {request.request_type !== "rental" ? (
                    <>
                      <div>
                        <span style={{ color: "var(--color-text-muted)" }}>Request Type</span>
                        <p style={{ fontWeight: 500, marginTop: "0.125rem" }}>
                          {request.request_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span style={{ color: "var(--color-text-muted)" }}>{listing?.property_type === "property" ? "Start Date" : "Pickup Date"}</span>
                        <p style={{ fontWeight: 500, marginTop: "0.125rem" }}>
                          {formatDate(request.start_date)}
                        </p>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-text-muted)" }}>{listing?.property_type === "property" ? "End Date" : "Return Date"}</span>
                        <p style={{ fontWeight: 500, marginTop: "0.125rem" }}>
                          {formatDate(request.end_date)}
                        </p>
                      </div>
                    </>
                  )}
                  {request.request_type !== "rental" && request.offered_price != null && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Offered Price</span>
                      <p style={{ fontWeight: 500, marginTop: "0.125rem" }}>
                        {request.offered_price.toLocaleString()} ETB
                      </p>
                    </div>
                  )}
                </div>

                {/* Submitted at */}
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    marginTop: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  Submitted {formatDate(request.created_at)} ·{" "}
                  <Link href={`/${listing?.property_type === "property" ? "properties" : "cars"}/${request.listing_id}`} style={{ color: "var(--color-primary)" }}>
                    View Listing
                  </Link>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
