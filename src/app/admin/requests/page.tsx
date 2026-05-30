import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

type RequestRow = {
  id: string;
  status: string;
  request_type: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  created_at: string;
  listings: { title: string; property_type: string } | null;
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  new: { bg: "#eef2ff", color: "#6366f1" },
  admin_reviewing: { bg: "#fffbeb", color: "#d97706" },
  owner_contacted: { bg: "#e0f2fe", color: "#0284c7" },
  owner_responded: { bg: "#ecfdf5", color: "#059669" },
  confirmed: { bg: "#f0fdf4", color: "#16a34a" },
  completed: { bg: "#f9fafb", color: "#6b7280" },
  rejected: { bg: "#fef2f2", color: "#dc2626" },
  cancelled: { bg: "#f9fafb", color: "#6b7280" },
};

export default async function AdminRequestsPage() {
  const adminClient = createAdminClient();

  const { data: rawRequests, error } = await adminClient
    .from("requests")
    .select("id, status, request_type, name, phone, email, message, created_at, listings(title, property_type)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Requests & Inquiries</h1>
        <div className="auth-error">Error loading requests: {error.message}</div>
      </div>
    );
  }

  const requests: RequestRow[] = (rawRequests || []).map((r) => ({
    ...r,
    listings: Array.isArray(r.listings) ? r.listings[0] : r.listings,
  }));

  const newRequests = requests.filter((r) => r.status === "new");
  const inProgress = requests.filter((r) => ["admin_reviewing", "owner_contacted", "owner_responded", "confirmed"].includes(r.status));
  const closed = requests.filter((r) => ["completed", "rejected", "cancelled"].includes(r.status));

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>Requests & Inquiries</h1>
          <p className="dashboard-hint">{requests.length} total · {newRequests.length} new · {inProgress.length} in progress</p>
        </div>
        <Link href="/admin" style={{ fontSize: "0.875rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* New Requests */}
      {newRequests.length > 0 && (
        <Section title={`🔔 New Requests (${newRequests.length})`} titleColor="#6366f1">
          {newRequests.map((r) => <RequestCard key={r.id} request={r} highlight />)}
        </Section>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <Section title={`🔄 In Progress (${inProgress.length})`}>
          {inProgress.map((r) => <RequestCard key={r.id} request={r} />)}
        </Section>
      )}

      {/* Closed */}
      {closed.length > 0 && (
        <Section title={`📁 Closed (${closed.length})`}>
          {closed.map((r) => <RequestCard key={r.id} request={r} />)}
        </Section>
      )}

      {requests.length === 0 && (
        <div className="dashboard-card" style={{ padding: "3rem", textAlign: "center" }}>
          <p className="dashboard-hint">No requests found.</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, titleColor, children }: { title: string; titleColor?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: titleColor || "var(--color-text-heading)", marginBottom: "1rem" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {children}
      </div>
    </div>
  );
}

function RequestCard({ request, highlight = false }: { request: RequestRow; highlight?: boolean }) {
  const style = STATUS_STYLES[request.status] || STATUS_STYLES.new;

  return (
    <div
      className="dashboard-card"
      style={{
        padding: "1.25rem",
        borderLeft: highlight ? "4px solid #6366f1" : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.125rem" }}>
            {request.listings?.title || "Unknown Listing"}
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{
              fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700,
              padding: "0.125rem 0.375rem", borderRadius: "4px",
              backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-muted)",
            }}>
              {request.request_type}
            </span>
            <span style={{
              fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700,
              padding: "0.125rem 0.375rem", borderRadius: "4px",
              backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)",
            }}>
              {request.listings?.property_type || "unknown"}
            </span>
          </div>
        </div>
        <span style={{
          fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
          padding: "0.25rem 0.5rem", borderRadius: "9999px",
          backgroundColor: style.bg, color: style.color,
        }}>
          {request.status.replace(/_/g, " ")}
        </span>
      </div>

      <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
        <p style={{ marginBottom: "0.25rem" }}>
          <strong>{request.name}</strong> · {request.phone}{request.email ? ` · ${request.email}` : ""}
        </p>
        {request.message && (
          <p style={{ fontStyle: "italic", backgroundColor: "var(--color-surface)", padding: "0.375rem 0.5rem", borderRadius: "var(--radius-sm)", marginTop: "0.375rem" }}>
            &quot;{request.message}&quot;
          </p>
        )}
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          {new Date(request.created_at).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
