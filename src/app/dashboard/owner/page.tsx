import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerMyCarsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch listings for this owner
  // The RLS policy natively restricts this to only their own listings,
  // but we explicitly filter by owner_id for clarity.
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      status,
      created_at,
      vehicle_details (
        make,
        model,
        year
      )
    `)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">My Cars</h1>
        <div className="auth-error">Error loading listings: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>My Cars</h1>
        <Link href="/dashboard/owner/cars/new" className="auth-button" style={{ textDecoration: "none" }}>
          + Add New Car
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            You haven&apos;t listed any cars yet
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            Start earning by listing your first vehicle on CarMarket.
          </p>
          <Link href="/dashboard/owner/cars/new" className="auth-button" style={{ textDecoration: "none" }}>
            Create First Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {listings.map((listing) => {
            // Handle array or single object from the join
            const details = Array.isArray(listing.vehicle_details) 
              ? listing.vehicle_details[0] 
              : listing.vehicle_details;

            return (
              <div 
                key={listing.id} 
                className="dashboard-card" 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "1.5rem" 
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
                    {listing.title || "Untitled Listing"}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    {details ? `${details.year} ${details.make} ${details.model}` : "No vehicle details added"}
                  </p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 600, 
                    textTransform: "uppercase", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "9999px",
                    backgroundColor: listing.status === 'published' ? 'var(--color-success-bg)' : 'var(--color-surface-hover)',
                    color: listing.status === 'published' ? 'var(--color-success-text)' : 'var(--color-text-muted)',
                    border: `1px solid ${listing.status === 'published' ? 'var(--color-success-border)' : 'var(--color-border)'}`
                  }}>
                    {listing.status.replace('_', ' ')}
                  </span>
                  
                  <Link 
                    href={`/dashboard/owner/cars/${listing.id}/edit`}
                    className="auth-button auth-button--secondary"
                    style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
