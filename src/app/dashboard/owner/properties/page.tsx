import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerMyPropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      status,
      created_at,
      property_details (
        bedrooms,
        bathrooms,
        area_sqm,
        property_types ( name )
      ),
      pending_price_changes (
        status
      )
    `)
    .eq("owner_id", user.id)
    .eq("category", "property")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">My Properties</h1>
        <div className="auth-error">Error loading properties: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>My Properties</h1>
        <Link href="/dashboard/owner/properties/new" className="auth-button" style={{ textDecoration: "none" }}>
          + Add New Property
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            You haven&apos;t listed any properties yet
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            Start earning by listing your first property on MyEthioProperties.
          </p>
          <Link href="/dashboard/owner/properties/new" className="auth-button" style={{ textDecoration: "none" }}>
            Create First Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {listings.map((listing: { id: string; title: string | null; status: string; created_at: string; property_details: unknown; pending_price_changes: unknown }) => {
            const pdRaw = listing.property_details;
            const pd = Array.isArray(pdRaw) ? pdRaw[0] : (pdRaw as Record<string, unknown>);
            const propertyTypeName = Array.isArray(pd?.property_types) 
              ? pd?.property_types[0]?.name 
              : pd?.property_types?.name;

            const pendingChanges = Array.isArray(listing.pending_price_changes) 
              ? listing.pending_price_changes 
              : [];
            const hasPendingPriceChange = pendingChanges.some((c: { status: string }) => c.status === "pending");

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
                    {listing.title || "Untitled Property"}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                    {propertyTypeName ? propertyTypeName : "Property"}
                    {pd?.bedrooms ? ` · ${pd.bedrooms} Beds` : ""}
                    {pd?.area_sqm ? ` · ${pd.area_sqm} m²` : ""}
                  </p>
                  {hasPendingPriceChange && (
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", padding: "0.125rem 0.375rem", borderRadius: "4px", backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", display: "inline-block" }}>
                      ⚠️ Price Edit Pending Review
                    </span>
                  )}
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
                    href={`/dashboard/owner/properties/${listing.id}/edit`}
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
