import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OwnerListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, property_type, listing_type, price, status, city, sub_city, created_at")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const activeListings = listings || [];

  const statusColors: Record<string, { bg: string; color: string }> = {
    published: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
    pending_review: { bg: "#fffbeb", color: "#d97706" },
    rejected: { bg: "#fef2f2", color: "#dc2626" },
    draft: { bg: "var(--color-surface-hover)", color: "var(--color-text-muted)" },
    archived: { bg: "var(--color-surface-hover)", color: "var(--color-text-muted)" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>My Listings</h1>
          <p className="dashboard-hint">{activeListings.length} listing{activeListings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/owner/listings/new"
          className="auth-button"
          style={{ textDecoration: "none" }}
        >
          + Add Listing
        </Link>
      </div>

      {activeListings.length === 0 ? (
        <div className="dashboard-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
            No listings yet
          </h2>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            Create your first listing and start receiving requests.
          </p>
          <Link href="/dashboard/owner/listings/new" className="auth-button" style={{ textDecoration: "none" }}>
            Create First Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {activeListings.map((listing) => {
            const style = statusColors[listing.status] || statusColors.draft;

            return (
              <div key={listing.id} className="dashboard-card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{
                      fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700,
                      padding: "0.125rem 0.375rem", borderRadius: "4px",
                      backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)",
                    }}>
                      {listing.property_type}
                    </span>
                    <span style={{
                      fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700,
                      padding: "0.125rem 0.375rem", borderRadius: "4px",
                      backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)",
                    }}>
                      {listing.listing_type}
                    </span>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-heading)" }}>
                      {listing.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                    {formatCompactNumber(listing.price)} ETB · {listing.city || "No city"}{listing.sub_city ? `, ${listing.sub_city}` : ""}
                    {" · "}{new Date(listing.created_at).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
                    padding: "0.25rem 0.5rem", borderRadius: "9999px",
                    backgroundColor: style.bg, color: style.color,
                  }}>
                    {listing.status.replace("_", " ")}
                  </span>
                  <Link
                    href={`/dashboard/owner/listings/${listing.id}/edit`}
                    className="auth-button auth-button--secondary"
                    style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
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
