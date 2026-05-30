import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

type ListingRow = {
  id: string;
  title: string;
  property_type: string;
  listing_type: string;
  price: number;
  status: string;
  city: string | null;
  sub_city: string | null;
  created_at: string;
  owner_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function AdminListingsPage() {
  const adminClient = createAdminClient();

  // Fetch listings joined with owner profile info
  const { data: rawListings, error } = await adminClient
    .from("listings")
    .select("id, title, property_type, listing_type, price, status, city, sub_city, created_at, owner_id, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Listing Management</h1>
        <div className="auth-error">Error loading listings: {error.message}</div>
      </div>
    );
  }

  const listings: ListingRow[] = (rawListings || []).map((l) => ({
    ...l,
    profiles: Array.isArray(l.profiles) ? l.profiles[0] : l.profiles,
  }));

  const pending = listings.filter((l) => l.status === "pending_review");
  const other = listings.filter((l) => l.status !== "pending_review");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Listing Management</h1>
          <p className="dashboard-hint">{listings.length} total listings · {pending.length} pending review</p>
        </div>
        <Link href="/admin" style={{ fontSize: "0.875rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Pending Review Section */}
      {pending.length > 0 && (
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#d97706", marginBottom: "1rem" }}>
            ⏳ Pending Review ({pending.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pending.map((listing) => (
              <ListingRow key={listing.id} listing={listing} highlight />
            ))}
          </div>
        </div>
      )}

      {/* All Other Listings */}
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        All Listings
      </h2>
      {other.length === 0 ? (
        <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
          <p className="dashboard-hint">No additional listings.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {other.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingRow({ listing, highlight = false }: { listing: ListingRow; highlight?: boolean }) {
  const statusColors: Record<string, { bg: string; color: string }> = {
    published: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
    pending_review: { bg: "#fffbeb", color: "#d97706" },
    rejected: { bg: "#fef2f2", color: "#dc2626" },
    draft: { bg: "var(--color-surface-hover)", color: "var(--color-text-muted)" },
    archived: { bg: "var(--color-surface-hover)", color: "var(--color-text-muted)" },
  };

  const style = statusColors[listing.status] || statusColors.draft;

  return (
    <div
      className="dashboard-card"
      style={{
        padding: "1.25rem",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "1rem",
        alignItems: "center",
        borderLeft: highlight ? "4px solid #d97706" : undefined,
      }}
    >
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
          {" · "}Owner: {listing.profiles?.full_name || listing.profiles?.email || listing.owner_id.slice(0, 8)}
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
      </div>
    </div>
  );
}
