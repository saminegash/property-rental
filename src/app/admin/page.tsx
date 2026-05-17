import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="dashboard-card">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Welcome to the admin panel. Only authorized administrators can see this page.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
        <Link 
          href="/admin/owners" 
          style={{ 
            display: "block", 
            padding: "1.5rem", 
            border: "1px solid var(--color-border)", 
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            backgroundColor: "var(--color-bg)",
            textAlign: "left",
            transition: "border-color 0.15s ease"
          }}
        >
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
            Owner Management
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Review, approve, or suspend car owner profiles.
          </p>
        </Link>
      </div>
    </div>
  );
}
